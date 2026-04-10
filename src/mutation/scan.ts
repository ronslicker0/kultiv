import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { LLMProvider } from '../llm/provider.js';
import type { ScanAnalysis } from './types.js';

// ── Scan Directory ──────────────────────────────────────────────────────

function scansDir(evoDir: string): string {
  return join(evoDir, 'scans');
}

function scanPath(evoDir: string, artifactId: string): string {
  return join(scansDir(evoDir), `${artifactId}.json`);
}

// ── Scan Artifact ───────────────────────────────────────────────────────

/**
 * Analyze an agent prompt to understand its purpose, structure, and
 * improvement opportunities. Uses the LLM's domain knowledge to evaluate
 * whether the prompt is well-structured for what it's designed to do.
 */
export async function scanArtifact(
  content: string,
  artifactId: string,
  provider: LLMProvider,
): Promise<ScanAnalysis> {
  const prompt = `You are an expert AI agent prompt analyst. Analyze the following agent instruction prompt and provide a structured assessment.

<artifact>
${content}
</artifact>

Analyze this prompt and respond with ONLY a JSON object (no markdown fences):

{
  "purpose": "1-2 sentence description of what this agent is designed to do",
  "domain": "the specific domain this agent operates in (e.g., 'API development', 'code review', 'video processing')",
  "sections": [
    { "name": "section heading or topic", "lineCount": <approximate lines>, "assessment": "brief quality assessment" }
  ],
  "recommendations": [
    {
      "type": "trim|expand|combine|split|restructure|add_examples",
      "target": "which section or area",
      "rationale": "why this change would improve the agent's effectiveness",
      "priority": "low|medium|high"
    }
  ],
  "hasExamples": <true if prompt contains concrete code/usage examples>,
  "hasNegativeExamples": <true if prompt shows what NOT to do>,
  "hasDecisionTrees": <true if prompt has conditional logic/decision trees>
}

Assessment guidelines:
- "trim": Section is verbose, repetitive, or contains information the LLM already knows
- "expand": Section covers a topic superficially — needs concrete patterns, code, or edge cases
- "combine": Multiple sections cover overlapping concerns and should be merged
- "split": A section tries to cover too many concerns and should be broken apart
- "restructure": Information is in the wrong order or hard to find
- "add_examples": Abstract rules that would benefit from concrete before/after examples

Focus on whether the prompt effectively communicates:
1. What the agent should DO (behaviors, patterns, workflows)
2. What the agent should NOT do (anti-patterns, guardrails)
3. How to handle edge cases and errors
4. Domain-specific knowledge the agent needs`;

  const response = await provider.generate(
    [{ role: 'user', content: prompt }],
    { maxTokens: 4096, temperature: 0.2 },
  );

  let parsed: Record<string, unknown>;
  try {
    let cleaned = response.content.trim();
    const fenceMatch = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/.exec(cleaned);
    if (fenceMatch?.[1]) cleaned = fenceMatch[1].trim();
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error(`Failed to parse scan response: ${response.content.slice(0, 500)}`);
  }

  return {
    artifactId,
    scannedAt: new Date().toISOString(),
    purpose: String(parsed.purpose ?? ''),
    domain: String(parsed.domain ?? ''),
    sections: Array.isArray(parsed.sections)
      ? (parsed.sections as Array<Record<string, unknown>>).map((s) => ({
          name: String(s.name ?? ''),
          lineCount: Number(s.lineCount ?? 0),
          assessment: String(s.assessment ?? ''),
        }))
      : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? (parsed.recommendations as Array<Record<string, unknown>>).map((r) => ({
          type: String(r.type ?? 'expand') as ScanAnalysis['recommendations'][0]['type'],
          target: String(r.target ?? ''),
          rationale: String(r.rationale ?? ''),
          priority: String(r.priority ?? 'medium') as 'low' | 'medium' | 'high',
        }))
      : [],
    hasExamples: Boolean(parsed.hasExamples),
    hasNegativeExamples: Boolean(parsed.hasNegativeExamples),
    hasDecisionTrees: Boolean(parsed.hasDecisionTrees),
  };
}

// ── Persistence ─────────────────────────────────────────────────────────

export function saveScanAnalysis(evoDir: string, analysis: ScanAnalysis): void {
  const dir = scansDir(evoDir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(scanPath(evoDir, analysis.artifactId), JSON.stringify(analysis, null, 2), 'utf-8');
}

export function loadScanAnalysis(evoDir: string, artifactId: string): ScanAnalysis | undefined {
  const path = scanPath(evoDir, artifactId);
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ScanAnalysis;
  } catch {
    return undefined;
  }
}
