import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { EvaluatorResult } from './chain-runner.js';

// ── Pattern Rule Types ──────────────────────────────────────────────────

interface PatternRule {
  pattern: string;
  message: string;
  severity: 'error' | 'warning';
}

interface PatternRulesFile {
  rules: PatternRule[];
}

interface PatternMatch {
  rule: PatternRule;
  line: number;
  match: string;
}

// ── Pattern Scorer ──────────────────────────────────────────────────────

/**
 * Score an artifact file by running regex pattern rules against it.
 *
 * Reads rules from a JSON file. For each match:
 * - "error" severity: -10 points
 * - "warning" severity: -5 points
 *
 * Score starts at max (weight) and is clamped to 0 minimum.
 */
export function runPatternScorer(
  name: string,
  filePath: string,
  rulesFile: string,
  weight: number,
): EvaluatorResult {
  // Read the rules file
  let rulesContent: string;
  try {
    rulesContent = readFileSync(resolve(rulesFile), 'utf-8');
  } catch (err) {
    return {
      name,
      score: 0,
      max: 1,
      weight,
      details: { error: `Failed to read rules file: ${rulesFile} — ${String(err)}` },
      passed: false,
    };
  }

  let rules: PatternRule[];
  try {
    const parsed = JSON.parse(rulesContent) as PatternRulesFile;
    rules = parsed.rules;
    if (!Array.isArray(rules)) {
      throw new Error('rules field must be an array');
    }
  } catch (err) {
    return {
      name,
      score: 0,
      max: 1,
      weight,
      details: { error: `Failed to parse rules file: ${rulesFile} — ${String(err)}` },
      passed: false,
    };
  }

  // Read the artifact file
  let fileContent: string;
  try {
    fileContent = readFileSync(resolve(filePath), 'utf-8');
  } catch (err) {
    return {
      name,
      score: 0,
      max: 1,
      weight,
      details: { error: `Failed to read artifact file: ${filePath} — ${String(err)}` },
      passed: false,
    };
  }

  const lines = fileContent.split('\n');
  const matches: PatternMatch[] = [];
  let deductions = 0;

  for (const rule of rules) {
    let regex: RegExp;
    try {
      regex = new RegExp(rule.pattern, 'g');
    } catch {
      // Skip invalid regex patterns
      continue;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      regex.lastIndex = 0; // Reset for each line
      const result = regex.exec(line);
      if (result) {
        const penalty = rule.severity === 'error' ? 10 : 5;
        deductions += penalty;
        matches.push({
          rule,
          line: i + 1,
          match: result[0].slice(0, 100),
        });
      }
    }
  }

  // Score: start from 100 (normalized to 1.0), apply deductions
  const rawScore = Math.max(0, 100 - deductions);
  const normalizedScore = rawScore / 100; // 0..1 range

  const errorCount = matches.filter((m) => m.rule.severity === 'error').length;
  const warningCount = matches.filter((m) => m.rule.severity === 'warning').length;

  return {
    name,
    score: normalizedScore,
    max: 1,
    weight,
    details: {
      file: filePath,
      rules_file: rulesFile,
      total_matches: matches.length,
      errors: errorCount,
      warnings: warningCount,
      deductions,
      matches: matches.slice(0, 50).map((m) => ({
        pattern: m.rule.pattern,
        message: m.rule.message,
        severity: m.rule.severity,
        line: m.line,
        match: m.match,
      })),
    },
    passed: errorCount === 0,
  };
}
