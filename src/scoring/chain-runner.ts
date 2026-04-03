import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ScorerChainItem } from '../core/config.js';
import type { LLMProvider } from '../llm/provider.js';
import { runCommandScorer } from './command-scorer.js';
import { runPatternScorer } from './pattern-scorer.js';
import { runLLMJudge } from './llm-judge.js';

// ── Types ────────────────────────────────────────────────────────────────

export interface EvaluatorResult {
  name: string;
  score: number;
  max: number;
  weight: number;
  details: Record<string, unknown>;
  passed: boolean;
}

export interface Scorecard {
  total_score: number;
  max_score: number;
  percentage: number;
  evaluators: EvaluatorResult[];
  timestamp: string;
}

export interface ChainRunOptions {
  /** LLM provider for llm-judge evaluators. Required if chain has llm-judge items. */
  provider?: LLMProvider;
  /** The artifact content as a string. Required for llm-judge evaluators. */
  artifactContent?: string;
  /** Absolute path to the artifact file. Used by pattern scorer when no command override. */
  artifactPath?: string;
}

// ── Chain Runner ─────────────────────────────────────────────────────────

/**
 * Run an evaluator chain in sequence and aggregate weighted scores into a scorecard.
 *
 * Each evaluator produces a result with a raw score and max. The chain runner
 * computes a weighted total: sum(score * weight) / sum(max * weight) * 100.
 */
export async function runChain(
  chain: ScorerChainItem[],
  projectRoot: string,
  options?: ChainRunOptions,
): Promise<Scorecard> {
  if (chain.length === 0) {
    throw new Error('Scorer chain is empty — at least one evaluator is required');
  }

  const evaluators: EvaluatorResult[] = [];

  for (const item of chain) {
    let result: EvaluatorResult;

    // Determine evaluator type:
    // - If command is present and type is undefined or 'script', use command scorer
    // - If type is 'pattern', use pattern scorer
    // - If type is 'llm-judge', use LLM judge scorer
    const effectiveType = item.type ?? (item.command ? 'command' : 'unknown');

    if (effectiveType === 'command' || (effectiveType === 'script' && item.command)) {
      // No type or 'script' with a command field — run command scorer
      if (!item.command) {
        result = {
          name: item.name,
          score: 0,
          max: 1,
          weight: item.weight,
          details: { error: 'Command scorer requires a command field' },
          passed: false,
        };
      } else {
        result = runCommandScorer(item.name, item.command, projectRoot);
        result.weight = item.weight;
      }
    } else if (effectiveType === 'script' && !item.command) {
      result = {
        name: item.name,
        score: 0,
        max: 1,
        weight: item.weight,
        details: { error: 'Script scorer requires a command field' },
        passed: false,
      };
    } else if (effectiveType === 'pattern') {
      if (!item.rules_file) {
        result = {
          name: item.name,
          score: 0,
          max: 1,
          weight: item.weight,
          details: { error: 'Pattern scorer requires a rules_file field' },
          passed: false,
        };
      } else {
        // Pattern scorer reads the artifact file directly. Use command field
        // as explicit override, then artifact path from options, then project root.
        const patternFilePath = item.command ?? options?.artifactPath ?? `${projectRoot}`;
        result = runPatternScorer(
          item.name,
          patternFilePath,
          item.rules_file,
          item.weight,
        );
      }
    } else if (effectiveType === 'llm-judge') {
      if (!options?.provider) {
        result = {
          name: item.name,
          score: 0,
          max: 1,
          weight: item.weight,
          details: { error: 'LLM judge scorer requires a provider in chain options' },
          passed: false,
        };
      } else if (!options.artifactContent) {
        result = {
          name: item.name,
          score: 0,
          max: 1,
          weight: item.weight,
          details: { error: 'LLM judge scorer requires artifactContent in chain options' },
          passed: false,
        };
      } else {
        // Read rubric from file if rules_file is a path, otherwise use as-is
        let rubricText = item.rules_file;
        if (rubricText) {
          try {
            const rubricPath = resolve(projectRoot, rubricText);
            rubricText = readFileSync(rubricPath, 'utf-8');
          } catch {
            // If file read fails, use the raw string as rubric text
          }
        }
        result = await runLLMJudge(
          item.name,
          options.artifactContent,
          item.weight,
          {
            provider: options.provider,
            rubric: rubricText,
          },
        );
      }
    } else {
      result = {
        name: item.name,
        score: 0,
        max: 1,
        weight: item.weight,
        details: { error: `Unknown evaluator type: ${item.type ?? 'none'}` },
        passed: false,
      };
    }

    evaluators.push(result);
  }

  // Compute weighted totals
  const weightedScoreSum = evaluators.reduce(
    (sum, e) => sum + e.score * e.weight,
    0
  );
  const weightedMaxSum = evaluators.reduce(
    (sum, e) => sum + e.max * e.weight,
    0
  );

  const percentage = weightedMaxSum > 0
    ? Math.round((weightedScoreSum / weightedMaxSum) * 10000) / 100
    : 0;

  return {
    total_score: Math.round(weightedScoreSum * 100) / 100,
    max_score: weightedMaxSum,
    percentage,
    evaluators,
    timestamp: new Date().toISOString(),
  };
}
