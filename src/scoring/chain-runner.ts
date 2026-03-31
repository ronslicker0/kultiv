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
        const artifactPath = options?.artifactContent
          ? '' // Will use content if we refactor later; for now rules_file scorer reads from disk
          : '';
        // Pattern scorer reads the artifact file directly. The path should come
        // from the chain item or the artifact config. For now we use the command
        // field as a path override, or fall back to projectRoot-relative rules_file.
        const filePath = item.command ?? `${projectRoot}`;
        result = runPatternScorer(
          item.name,
          filePath,
          item.rules_file,
          item.weight,
        );
        // Suppress unused variable
        void artifactPath;
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
        result = await runLLMJudge(
          item.name,
          options.artifactContent,
          item.weight,
          {
            provider: options.provider,
            rubric: item.rules_file, // Reuse rules_file as rubric path/text
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
    total_score: weightedScoreSum,
    max_score: weightedMaxSum,
    percentage,
    evaluators,
    timestamp: new Date().toISOString(),
  };
}
