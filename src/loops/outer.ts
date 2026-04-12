import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPatch } from 'diff';
import type { EvoConfig } from '../core/config.js';
import type { Archive, ArchiveEntry } from '../core/archive.js';
import type { LLMProvider } from '../llm/provider.js';
import { detectAntiPatterns } from '../detection/anti-patterns.js';
import { runChain } from '../scoring/chain-runner.js';

// ── Types ────────────────────────────────────────────────────────────────

export interface OuterLoopResult {
  updated: boolean;
  diff: string | null;
  tokenCost: number;
}

// ── Stats Computation ───────────────────────────────────────────────────

interface MutationTypeStats {
  type: string;
  total: number;
  successes: number;
  regressions: number;
  successRate: number;
}

interface ArtifactStats {
  artifact: string;
  total: number;
  successes: number;
  regressions: number;
  bestScore: number | null;
  latestScore: number | null;
}

function computeGlobalStats(entries: ReadonlyArray<ArchiveEntry>): {
  mutationTypes: MutationTypeStats[];
  artifacts: ArtifactStats[];
  overallSuccessRate: number;
  totalExperiments: number;
} {
  // Mutation type stats
  const typeMap = new Map<string, { total: number; successes: number; regressions: number }>();
  for (const e of entries) {
    if (e.status === 'crash') continue;
    const stats = typeMap.get(e.mutation_type) ?? { total: 0, successes: 0, regressions: 0 };
    stats.total++;
    if (e.status === 'success') stats.successes++;
    if (e.status === 'regression') stats.regressions++;
    typeMap.set(e.mutation_type, stats);
  }

  const mutationTypes: MutationTypeStats[] = [];
  for (const [type, stats] of typeMap) {
    mutationTypes.push({
      type,
      total: stats.total,
      successes: stats.successes,
      regressions: stats.regressions,
      successRate: stats.total > 0 ? stats.successes / stats.total : 0,
    });
  }
  mutationTypes.sort((a, b) => b.total - a.total);

  // Artifact stats
  const artifactMap = new Map<string, ArchiveEntry[]>();
  for (const e of entries) {
    const list = artifactMap.get(e.artifact) ?? [];
    list.push(e);
    artifactMap.set(e.artifact, list);
  }

  const artifacts: ArtifactStats[] = [];
  for (const [artifact, artEntries] of artifactMap) {
    const scored = artEntries.filter((e) => e.score !== null);
    artifacts.push({
      artifact,
      total: artEntries.length,
      successes: artEntries.filter((e) => e.status === 'success').length,
      regressions: artEntries.filter((e) => e.status === 'regression').length,
      bestScore: scored.length > 0 ? Math.max(...scored.map((e) => e.score as number)) : null,
      latestScore: scored.length > 0 ? scored[scored.length - 1].score : null,
    });
  }

  // Overall
  const nonCrash = entries.filter((e) => e.status !== 'crash');
  const overallSuccessRate =
    nonCrash.length > 0
      ? nonCrash.filter((e) => e.status === 'success').length / nonCrash.length
      : 0;

  return {
    mutationTypes,
    artifacts,
    overallSuccessRate,
    totalExperiments: entries.length,
  };
}

// ── Outer Loop ──────────────────────────────────────────────────────────

/**
 * Outer loop: revise the meta-strategy based on global archive statistics.
 *
 * Supports two modes:
 * - 'single': A single LLM call to revise the meta-strategy (original behavior).
 * - 'dialogue': A 3-round approach (Explore, Critique, Apply) with mini-batch
 *   validation to ensure the new strategy doesn't degrade performance.
 *
 * Flow (single mode):
 * 1. Read current meta-strategy
 * 2. Compute global stats from archive
 * 3. Detect anti-patterns across all artifacts
 * 4. Build prompt asking the LLM to revise the meta-strategy
 * 5. Parse updated strategy from response
 * 6. Write updated meta-strategy file (backup old one first)
 * 7. Return diff
 *
 * Flow (dialogue mode):
 * 1. Read current meta-strategy
 * 2. Compute global stats from archive
 * 3. Detect anti-patterns across all artifacts
 * 4. Explore: brainstorm 3 strategy improvements
 * 5. Critique: evaluate and pick the best
 * 6. Apply: rewrite the meta-strategy with that improvement
 * 7. Mini-batch validation: score a random artifact to verify no degradation
 * 8. Write updated meta-strategy file (backup old one first)
 * 9. Return diff
 */
export async function outerLoop(
  config: EvoConfig,
  archive: Archive,
  provider: LLMProvider,
  options?: { mode?: 'dialogue' | 'single'; validationBatchSize?: number },
): Promise<OuterLoopResult> {
  const strategyPath = resolve(config.meta_strategy_path);
  const mode = options?.mode ?? 'single';

  // 1. Read current meta-strategy
  let currentStrategy: string;
  try {
    currentStrategy = readFileSync(strategyPath, 'utf-8');
  } catch {
    currentStrategy = '(no meta-strategy file found)';
  }

  // 2. Compute global stats
  const allEntries = archive.getAll();
  if (allEntries.length < 3) {
    // Not enough data to meaningfully revise the strategy
    return { updated: false, diff: null, tokenCost: 0 };
  }

  const stats = computeGlobalStats(allEntries);

  // 3. Detect anti-patterns (across all artifacts)
  const artifactIds = [...new Set(allEntries.map((e) => e.artifact))];
  const antiPatterns = artifactIds.flatMap((id) =>
    detectAntiPatterns([...allEntries], id).map((p) => ({ ...p, artifact: id }))
  );

  if (mode === 'dialogue') {
    return dialogueOuterLoop(
      config, archive, provider, currentStrategy, stats, antiPatterns,
      strategyPath, options?.validationBatchSize ?? 1,
    );
  }

  return singleOuterLoop(
    config, currentStrategy, stats, antiPatterns, strategyPath, provider,
  );
}

// ── Single Mode (original behavior) ────────────────────────────────────

async function singleOuterLoop(
  config: EvoConfig,
  currentStrategy: string,
  stats: ReturnType<typeof computeGlobalStats>,
  antiPatterns: AntiPatternWithArtifact[],
  strategyPath: string,
  provider: LLMProvider,
): Promise<OuterLoopResult> {
  // 4. Build prompt
  const prompt = buildOuterPrompt(currentStrategy, stats, antiPatterns);

  const systemPreamble =
    'You are the meta-strategy optimizer for Kultiv, an agent improvement system. ' +
    'Your job is to revise the mutation strategy based on observed performance data. ' +
    'Respond with ONLY the updated meta-strategy markdown content. No wrapping code blocks.';

  const response = await provider.generate([
    { role: 'user', content: `${systemPreamble}\n\n${prompt}` },
  ]);

  const updatedStrategy = response.content.trim();
  const tokenCost = response.input_tokens + response.output_tokens;

  // 5. Check if meaningful change
  if (updatedStrategy === currentStrategy.trim()) {
    return { updated: false, diff: null, tokenCost };
  }

  // 6. Backup and write
  if (existsSync(strategyPath)) {
    copyFileSync(strategyPath, strategyPath + '.backup');
  }
  writeFileSync(strategyPath, updatedStrategy + '\n', 'utf-8');

  // 7. Compute diff
  const diff = createPatch(
    config.meta_strategy_path,
    currentStrategy,
    updatedStrategy + '\n',
    'previous',
    'updated',
  );

  return { updated: true, diff, tokenCost };
}

// ── Dialogue Mode (3-round approach) ───────────────────────────────────

async function dialogueOuterLoop(
  config: EvoConfig,
  archive: Archive,
  provider: LLMProvider,
  currentStrategy: string,
  stats: ReturnType<typeof computeGlobalStats>,
  antiPatterns: AntiPatternWithArtifact[],
  strategyPath: string,
  validationBatchSize: number,
): Promise<OuterLoopResult> {
  let totalTokenCost = 0;

  const contextBlock = buildOuterPrompt(currentStrategy, stats, antiPatterns);

  // Round 1: Explore — brainstorm 3 strategy improvements
  const explorePrompt =
    'You are the meta-strategy optimizer for Kultiv, an agent improvement system.\n\n' +
    contextBlock + '\n\n' +
    'TASK: Brainstorm exactly 3 distinct improvements to the meta-strategy. ' +
    'For each improvement, describe:\n' +
    '1. The specific change to make\n' +
    '2. Which anti-pattern or weakness it addresses\n' +
    '3. Expected impact on success rate\n\n' +
    'Format as:\n' +
    'IMPROVEMENT 1: <title>\nChange: <what to change>\nAddresses: <problem>\nImpact: <expected effect>\n\n' +
    'IMPROVEMENT 2: ...\n\n' +
    'IMPROVEMENT 3: ...';

  const exploreResponse = await provider.generate([
    { role: 'user', content: explorePrompt },
  ], { temperature: 0.8 });
  totalTokenCost += exploreResponse.input_tokens + exploreResponse.output_tokens;

  // Round 2: Critique — evaluate and pick the best
  const critiquePrompt =
    'You are critiquing 3 proposed meta-strategy improvements.\n\n' +
    'Current meta-strategy:\n' + currentStrategy + '\n\n' +
    'Proposed improvements:\n' + exploreResponse.content + '\n\n' +
    'TASK: Evaluate each improvement on these criteria:\n' +
    '- Risk of regression (low/medium/high)\n' +
    '- Likelihood of improving success rate\n' +
    '- Compatibility with existing strategy structure\n\n' +
    'Select the BEST improvement. Respond with:\n' +
    'SELECTED: <1, 2, or 3>\n' +
    'REASONING: <why this is the best choice>\n' +
    'RISKS: <what to watch out for>';

  const critiqueResponse = await provider.generate([
    { role: 'user', content: critiquePrompt },
  ], { temperature: 0.3 });
  totalTokenCost += critiqueResponse.input_tokens + critiqueResponse.output_tokens;

  // Round 3: Apply — rewrite the meta-strategy with the selected improvement
  const applyPrompt =
    'You are applying a selected improvement to the Kultiv meta-strategy.\n\n' +
    'Current meta-strategy:\n' + currentStrategy + '\n\n' +
    'Selected improvement and reasoning:\n' + critiqueResponse.content + '\n\n' +
    'Original improvement details:\n' + exploreResponse.content + '\n\n' +
    'TASK: Rewrite the COMPLETE meta-strategy markdown incorporating the selected improvement. ' +
    'Keep the same markdown structure and sections. ' +
    'Respond with ONLY the updated meta-strategy markdown content. No wrapping code blocks.';

  const applyResponse = await provider.generate([
    { role: 'user', content: applyPrompt },
  ], { temperature: 0.2 });
  totalTokenCost += applyResponse.input_tokens + applyResponse.output_tokens;

  const updatedStrategy = applyResponse.content.trim();

  // Check if meaningful change
  if (updatedStrategy === currentStrategy.trim()) {
    return { updated: false, diff: null, tokenCost: totalTokenCost };
  }

  // Mini-batch validation: score a random artifact against the new strategy
  // to verify no degradation before committing the change
  const validationPassed = await validateStrategyChange(
    config, archive, provider, updatedStrategy, strategyPath, currentStrategy,
    validationBatchSize,
  );

  if (!validationPassed) {
    // Revert — the new strategy degraded performance
    return { updated: false, diff: null, tokenCost: totalTokenCost };
  }

  // Backup and write
  if (existsSync(strategyPath)) {
    copyFileSync(strategyPath, strategyPath + '.backup');
  }
  writeFileSync(strategyPath, updatedStrategy + '\n', 'utf-8');

  // Compute diff
  const diff = createPatch(
    config.meta_strategy_path,
    currentStrategy,
    updatedStrategy + '\n',
    'previous',
    'updated',
  );

  return { updated: true, diff, tokenCost: totalTokenCost };
}

// ── Mini-Batch Validation ──────────────────────────────────────────────

/**
 * Validate that a strategy change doesn't degrade performance by scoring
 * a random artifact. Temporarily writes the new strategy, scores, then reverts.
 *
 * Returns true if the new strategy is at least as good as the old one.
 */
async function validateStrategyChange(
  config: EvoConfig,
  archive: Archive,
  provider: LLMProvider,
  _updatedStrategy: string,
  _strategyPath: string,
  _currentStrategy: string,
  validationBatchSize: number,
): Promise<boolean> {
  // Get a random artifact to test against
  const allEntries = archive.getAll();
  const artifactIds = [...new Set(allEntries.map((e) => e.artifact))];

  if (artifactIds.length === 0) return true;

  const projectRoot = resolve('.');
  const samplesToTest = Math.min(validationBatchSize, artifactIds.length);
  const shuffled = [...artifactIds].sort(() => Math.random() - 0.5);
  const testArtifactIds = shuffled.slice(0, samplesToTest);

  for (const artifactId of testArtifactIds) {
    const artifactConfig = config.artifacts[artifactId];
    if (!artifactConfig) continue;

    // Get the current best score for this artifact from archive
    const entries = archive.getByArtifact(artifactId);
    const scored = entries.filter((e) => e.score !== null);
    if (scored.length === 0) continue;

    const currentBestScore = Math.max(...scored.map((e) => e.score as number));

    // Score the artifact with the current content (strategy change is conceptual,
    // the scoring chain itself doesn't depend on the strategy file directly)
    try {
      const { loadArtifact } = await import('../core/artifact.js');
      const artifact = loadArtifact(artifactId, artifactConfig);
      const scorecard = await runChain(artifactConfig.scorer.chain, projectRoot, {
        provider,
        artifactContent: artifact.content,
        artifactPath: artifact.path,
      });

      // If scoring significantly drops from best known score, reject
      if (scorecard.total_score < currentBestScore * 0.9) {
        return false;
      }
    } catch {
      // If scoring fails during validation, allow the change (fail-open)
      continue;
    }
  }

  return true;
}

// ── Prompt Builder ──────────────────────────────────────────────────────

interface AntiPatternWithArtifact {
  type: string;
  message: string;
  severity: string;
  suggestion: string;
  artifact: string;
}

function buildOuterPrompt(
  currentStrategy: string,
  stats: ReturnType<typeof computeGlobalStats>,
  antiPatterns: AntiPatternWithArtifact[],
): string {
  const typeStatsBlock = stats.mutationTypes
    .map(
      (t) =>
        `  ${t.type}: ${t.total} total, ${t.successes} success (${Math.round(t.successRate * 100)}%), ${t.regressions} regression`
    )
    .join('\n');

  const artifactStatsBlock = stats.artifacts
    .map(
      (a) =>
        `  ${a.artifact}: ${a.total} experiments, best=${a.bestScore ?? 'n/a'}, latest=${a.latestScore ?? 'n/a'}, success=${a.successes}, regression=${a.regressions}`
    )
    .join('\n');

  const antiPatternBlock = antiPatterns.length > 0
    ? antiPatterns
        .map((p) => `  [${p.severity}] ${p.type} on ${p.artifact}: ${p.message}`)
        .join('\n')
    : '  (none detected)';

  return `## Current Meta-Strategy
${currentStrategy}

## Global Statistics (${stats.totalExperiments} total experiments, ${Math.round(stats.overallSuccessRate * 100)}% overall success rate)

### Mutation Type Performance
${typeStatsBlock}

### Artifact Performance
${artifactStatsBlock}

### Detected Anti-Patterns
${antiPatternBlock}

## Task
Revise the meta-strategy to improve overall success rate and address any anti-patterns.
Specific guidance:
- Deprioritize mutation types with low success rates
- Adjust strategies for artifacts that are struggling
- Add new diversity rules if type fixation is detected
- Update the "Current Biases" section with specific adjustments
- Keep the same markdown structure and sections

Respond with the COMPLETE updated meta-strategy markdown. No code blocks or extra formatting.`;
}
