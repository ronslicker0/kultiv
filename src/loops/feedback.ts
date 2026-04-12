import type { Archive, ArchiveEntry } from '../core/archive.js';
import type { LLMProvider } from '../llm/provider.js';
import { detectAntiPatterns, type AntiPattern } from '../detection/anti-patterns.js';
import { detectPlateau, type PlateauResult } from '../detection/plateau.js';

// ── Types ────────────────────────────────────────────────────────────────

export interface FeedbackResult {
  antiPatterns: Array<{ type: string; message: string; severity: string }>;
  llmInsights: string[];
  strategyAdjustments: string[];
}

// ── Deterministic Feedback ──────────────────────────────────────────────

/**
 * Run deterministic (zero-LLM-token) feedback analysis on the archive.
 *
 * Combines anti-pattern detection with plateau detection to produce
 * a structured feedback result. This is fast, free, and always available.
 */
export async function runDeterministicFeedback(
  archive: Archive,
  artifactId: string,
): Promise<FeedbackResult> {
  const entries = archive.getByArtifact(artifactId);

  // Run anti-pattern detection
  const antiPatterns = detectAntiPatterns(entries, artifactId);

  // Run plateau detection on score history
  const scoreHistory = entries.map((e) => ({ score: e.score }));
  const plateauResult = detectPlateau(scoreHistory, 5);

  // Convert anti-patterns to feedback format
  const feedbackPatterns = antiPatterns.map((ap: AntiPattern) => ({
    type: ap.type,
    message: ap.message,
    severity: ap.severity,
  }));

  // Build strategy adjustments from suggestions
  const strategyAdjustments: string[] = [];

  for (const ap of antiPatterns) {
    if (ap.suggestion) {
      strategyAdjustments.push(ap.suggestion);
    }
  }

  if (plateauResult.detected && plateauResult.suggestion) {
    feedbackPatterns.push({
      type: 'plateau',
      message: `Score plateau detected: best recent ${plateauResult.bestRecent} vs prior best ${plateauResult.bestPrior}`,
      severity: 'high',
    });
    strategyAdjustments.push(plateauResult.suggestion);
  }

  return {
    antiPatterns: feedbackPatterns,
    llmInsights: [],
    strategyAdjustments,
  };
}

// ── LLM Reflection ──────────────────────────────────────────────────────

/**
 * Run LLM-assisted meta-learning reflection on the evolution archive.
 *
 * First runs deterministic feedback to gather baseline signals, then sends
 * the deterministic results plus recent archive data to the LLM for deeper
 * pattern analysis and strategy recommendations.
 */
export async function runLLMReflection(
  archive: Archive,
  artifactId: string,
  provider: LLMProvider,
): Promise<FeedbackResult> {
  // Start with deterministic analysis
  const deterministicResult = await runDeterministicFeedback(archive, artifactId);

  const entries = archive.getByArtifact(artifactId);

  // Get last 10 entries for context
  const recentEntries = entries.slice(-10);

  // Compute mutation type statistics
  const mutationStats = computeMutationStats(entries);

  // Build and send the reflection prompt
  const prompt = buildReflectionPrompt(
    deterministicResult,
    recentEntries,
    mutationStats,
  );

  try {
    const response = await provider.generate(
      [{ role: 'user', content: prompt }],
      { temperature: 0.3, maxTokens: 1024 },
    );

    const parsed = parseReflectionResponse(response.content);

    // Merge LLM insights with deterministic results
    return {
      antiPatterns: deterministicResult.antiPatterns,
      llmInsights: parsed.insights,
      strategyAdjustments: [
        ...deterministicResult.strategyAdjustments,
        ...parsed.strategyAdjustments,
      ],
    };
  } catch {
    // If LLM reflection fails, return deterministic results only
    return deterministicResult;
  }
}

// ── Prompt Construction ─────────────────────────────────────────────────

function buildReflectionPrompt(
  deterministicResult: FeedbackResult,
  recentEntries: ArchiveEntry[],
  mutationStats: Map<string, { count: number; avgScore: number; improvements: number }>,
): string {
  const patternsSection = deterministicResult.antiPatterns.length > 0
    ? deterministicResult.antiPatterns
        .map((p) => `- [${p.severity}] ${p.type}: ${p.message}`)
        .join('\n')
    : '(none detected)';

  const entriesSection = recentEntries
    .map((e) => {
      const score = e.score !== null ? `${e.score}/${e.max_score}` : 'N/A';
      return `  gen=${e.genid} type=${e.mutation_type} score=${score} status=${e.status}`;
    })
    .join('\n');

  const statsEntries: string[] = [];
  mutationStats.forEach((stats, type) => {
    statsEntries.push(`  ${type}: count=${stats.count} avg_score=${stats.avgScore.toFixed(1)} improvements=${stats.improvements}`);
  });
  const statsSection = statsEntries.join('\n');

  return `You are a meta-learning analyst. Review this evolution data and identify patterns, inefficiencies, and opportunities for improvement.

<detected_anti_patterns>
${patternsSection}
</detected_anti_patterns>

<recent_archive_entries>
${entriesSection}
</recent_archive_entries>

<mutation_type_statistics>
${statsSection}
</mutation_type_statistics>

Analyze the data above and provide:
1. Insights about the evolution trajectory — what is working and what is not
2. Concrete strategy adjustments to improve future mutations

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{"insights": ["insight 1", "insight 2"], "strategy_adjustments": ["adjustment 1", "adjustment 2"]}`;
}

// ── Response Parsing ────────────────────────────────────────────────────

function parseReflectionResponse(content: string): {
  insights: string[];
  strategyAdjustments: string[];
} {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { insights: [], strategyAdjustments: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    const insights = Array.isArray(parsed.insights)
      ? (parsed.insights as unknown[]).filter((v): v is string => typeof v === 'string')
      : [];

    const strategyAdjustments = Array.isArray(parsed.strategy_adjustments)
      ? (parsed.strategy_adjustments as unknown[]).filter((v): v is string => typeof v === 'string')
      : [];

    return { insights, strategyAdjustments };
  } catch {
    return { insights: [], strategyAdjustments: [] };
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Compute per-mutation-type statistics from archive entries.
 */
function computeMutationStats(
  entries: ReadonlyArray<ArchiveEntry>,
): Map<string, { count: number; avgScore: number; improvements: number }> {
  const stats = new Map<string, { count: number; totalScore: number; improvements: number }>();

  for (const entry of entries) {
    const type = entry.mutation_type;
    const existing = stats.get(type) ?? { count: 0, totalScore: 0, improvements: 0 };

    existing.count += 1;
    if (entry.score !== null) {
      existing.totalScore += entry.score;
    }
    if (entry.status === 'success') {
      existing.improvements += 1;
    }

    stats.set(type, existing);
  }

  // Convert totalScore to avgScore
  const result = new Map<string, { count: number; avgScore: number; improvements: number }>();
  stats.forEach((data, type) => {
    result.set(type, {
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0,
      improvements: data.improvements,
    });
  });

  return result;
}
