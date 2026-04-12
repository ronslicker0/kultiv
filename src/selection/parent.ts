import type { ArchiveEntry } from '../core/archive.js';

/**
 * Select a parent entry from the archive for the next mutation round.
 *
 * - 'greedy': always returns the highest-scoring entry.
 * - 'tournament': softmax-weighted roulette selection with diversity enforcement.
 *
 * @param entries        Candidate archive entries to choose from.
 * @param method         Selection strategy.
 * @param temperature    Softmax temperature (higher = more exploration).
 * @param recentParentIds  List of recent parent genids (most recent last) used for diversity.
 * @returns The selected entry, or null if no valid candidates exist.
 */
export function selectParent(
  entries: ArchiveEntry[],
  method: 'tournament' | 'greedy',
  temperature: number,
  recentParentIds?: number[],
): ArchiveEntry | null {
  // Filter to scoreable, non-crashed entries
  const candidates = entries.filter(
    (e) => e.status !== 'crash' && e.score !== null,
  );

  if (candidates.length === 0) return null;

  if (method === 'greedy') {
    return greedySelect(candidates);
  }

  return tournamentSelect(candidates, temperature, recentParentIds);
}

// ── Greedy ──────────────────────────────────────────────────────────────

function greedySelect(candidates: ArchiveEntry[]): ArchiveEntry {
  let best = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    if ((candidates[i].score as number) > (best.score as number)) {
      best = candidates[i];
    }
  }
  return best;
}

// ── Tournament (softmax roulette) ───────────────────────────────────────

function tournamentSelect(
  candidates: ArchiveEntry[],
  temperature: number,
  recentParentIds?: number[],
): ArchiveEntry {
  let pool = candidates;

  // Diversity enforcement: if the same parent was selected 3 times consecutively,
  // exclude it from the pool (only if alternatives exist).
  if (recentParentIds && recentParentIds.length >= 3) {
    const lastThree = recentParentIds.slice(-3);
    const allSame = lastThree.every((id) => id === lastThree[0]);

    if (allSame) {
      const excludedId = lastThree[0];
      const filtered = pool.filter((e) => e.genid !== excludedId);
      if (filtered.length > 0) {
        pool = filtered;
      }
    }
  }

  // Single candidate — skip the math
  if (pool.length === 1) return pool[0];

  // Compute softmax weights: weight_i = exp((score_i - minScore) / temperature)
  const scores = pool.map((e) => e.score as number);
  const minScore = Math.min(...scores);

  const weights = scores.map((s) => Math.exp((s - minScore) / temperature));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Roulette wheel selection
  const r = Math.random() * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < pool.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) {
      return pool[i];
    }
  }

  // Fallback (floating-point edge case)
  return pool[pool.length - 1];
}
