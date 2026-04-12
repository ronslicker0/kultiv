import type { ScorerChainItem } from '../core/config.js';
import type { Archive } from '../core/archive.js';
import type { LLMProvider } from '../llm/provider.js';
import { runChain } from './chain-runner.js';

// ── Types ────────────────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  name: string;
  description: string;
  scorer_overrides?: ScorerChainItem[];
}

export interface CrossValidationResult {
  challengeId: string;
  challengeName: string;
  score: number;
  max_score: number;
  regressed: boolean;
}

// ── Cross-Validation ────────────────────────────────────────────────────

/**
 * Score an artifact against a random subset of challenges to detect regressions.
 *
 * Selects `count` random challenges (excluding the current one being optimized),
 * runs the scorer chain for each, and returns per-challenge results.
 * The `regressed` field is always false here — the caller uses `detectRegression`
 * to compare against the archive and determine actual regressions.
 */
export async function crossValidate(
  artifactContent: string,
  artifactPath: string,
  challenges: Challenge[],
  count: number,
  currentChallengeId: string | null,
  defaultChain: ScorerChainItem[],
  projectRoot: string,
  provider: LLMProvider,
): Promise<CrossValidationResult[]> {
  // Filter out the current challenge to avoid self-validation
  const eligible = challenges.filter((c) => c.id !== currentChallengeId);

  if (eligible.length === 0) {
    return [];
  }

  // Select `count` random challenges using Fisher-Yates partial shuffle
  const selected = selectRandom(eligible, Math.min(count, eligible.length));

  const results: CrossValidationResult[] = [];

  for (const challenge of selected) {
    const chain = challenge.scorer_overrides ?? defaultChain;

    try {
      const scorecard = await runChain(chain, projectRoot, {
        provider,
        artifactContent,
        artifactPath,
      });

      results.push({
        challengeId: challenge.id,
        challengeName: challenge.name,
        score: scorecard.total_score,
        max_score: scorecard.max_score,
        regressed: false,
      });
    } catch {
      // If scoring fails for a challenge, record zero score rather than crashing
      results.push({
        challengeId: challenge.id,
        challengeName: challenge.name,
        score: 0,
        max_score: 0,
        regressed: false,
      });
    }
  }

  return results;
}

// ── Regression Detection ────────────────────────────────────────────────

/**
 * Check whether any cross-validation scores regressed beyond a threshold.
 *
 * For each challenge in `results`, looks up the most recent score for that
 * challenge in the archive. If the new score dropped by more than `threshold`
 * fraction of the previous score, the mutation is considered a regression.
 *
 * @param results - Cross-validation results from the current mutation
 * @param archive - The archive containing historical scores
 * @param artifactId - The artifact being evolved
 * @param threshold - Maximum allowed fractional drop (e.g. 0.05 = 5%)
 * @returns true if any challenge regressed beyond threshold
 */
export function detectRegression(
  results: CrossValidationResult[],
  archive: Archive,
  artifactId: string,
  threshold: number,
): boolean {
  const entries = archive.getByArtifact(artifactId);

  for (const result of results) {
    // Find the last known score for this challenge in the archive
    const lastEntry = findLastChallengeScore(entries, result.challengeId);

    if (lastEntry === null) {
      // No prior score for this challenge — cannot regress
      continue;
    }

    const previousScore = lastEntry.score;
    if (previousScore === null || previousScore === 0) {
      continue;
    }

    const drop = (previousScore - result.score) / previousScore;

    if (drop > threshold) {
      return true;
    }
  }

  return false;
}

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Find the most recent archive entry with a score for a specific challenge.
 */
function findLastChallengeScore(
  entries: ReadonlyArray<{ challenge: string | null; score: number | null }>,
  challengeId: string,
): { score: number | null } | null {
  // Walk backwards to find the most recent entry for this challenge
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.challenge === challengeId && entry.score !== null) {
      return entry;
    }
  }
  return null;
}

/**
 * Select `count` random elements from an array using Fisher-Yates partial shuffle.
 * Does not mutate the input array.
 */
function selectRandom<T>(items: T[], count: number): T[] {
  const copy = [...items];
  const n = Math.min(count, copy.length);

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, n);
}
