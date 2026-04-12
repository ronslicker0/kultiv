import type { Challenge } from '../mutation/types.js';
import type { Archive } from '../core/archive.js';

/**
 * Select the next challenge to evaluate an artifact against.
 *
 * Strategies:
 * - 'curriculum'    Zone of proximal development — prioritise challenges the artifact
 *                   is close to mastering but hasn't saturated yet.
 * - 'min_score'     Pick the challenge with the lowest recent average score.
 * - 'round_robin'   Cycle through challenges in order using roundIndex.
 */
export function selectChallenge(
  challenges: Challenge[],
  archive: Archive,
  artifactId: string,
  method: 'curriculum' | 'min_score' | 'round_robin',
  roundIndex?: number,
): Challenge {
  if (challenges.length === 0) {
    throw new Error('selectChallenge: no challenges provided');
  }

  if (challenges.length === 1) return challenges[0];

  switch (method) {
    case 'curriculum':
      return curriculumSelect(challenges, archive, artifactId);
    case 'min_score':
      return minScoreSelect(challenges, archive, artifactId);
    case 'round_robin':
      return challenges[(roundIndex ?? 0) % challenges.length];
  }
}

// ── Curriculum (zone of proximal development) ──────────────────────────

function curriculumSelect(
  challenges: Challenge[],
  archive: Archive,
  artifactId: string,
): Challenge {
  const stats = archive.getChallengeStats();
  const artifactEntries = archive.getByArtifact(artifactId);

  // Track which challenges have been attempted for this artifact
  const attemptedChallenges = new Set<string>();
  for (const entry of artifactEntries) {
    if (entry.challenge) attemptedChallenges.add(entry.challenge);
  }

  const priorities: Array<{ challenge: Challenge; priority: number }> = [];

  for (const challenge of challenges) {
    const stat = stats.get(challenge.id);

    if (!stat || !attemptedChallenges.has(challenge.id)) {
      // Never tested — highest priority
      priorities.push({ challenge, priority: 1000 });
      continue;
    }

    const ratio = stat.avgScore / (challenge.difficulty > 0 ? challenge.difficulty : 1);

    if (ratio > 0.95) {
      // Saturated — low priority
      priorities.push({ challenge, priority: 1 });
    } else if (ratio < 0.10 && stat.count >= 3) {
      // Too hard after multiple attempts — deprioritise
      priorities.push({ challenge, priority: 10 });
    } else {
      // Zone of proximal development
      // Higher priority for lower ratios (more room to grow)
      // Recency bonus: challenges not attempted recently get a boost
      const recencyBonus = computeRecencyBonus(challenge.id, artifactEntries);
      const zpd = (1 - ratio) * 100 + recencyBonus;
      priorities.push({ challenge, priority: zpd });
    }
  }

  // Softmax selection over priorities
  return softmaxSelect(priorities);
}

function computeRecencyBonus(
  challengeId: string,
  entries: ReadonlyArray<{ challenge: string | null; genid: number }>,
): number {
  // Find how many entries ago this challenge was last attempted
  const reversed = [...entries].reverse();
  for (let i = 0; i < reversed.length; i++) {
    if (reversed[i].challenge === challengeId) {
      // The further back, the higher the bonus (capped at 20)
      return Math.min(i * 2, 20);
    }
  }
  // Never attempted in artifact entries — big bonus
  return 20;
}

function softmaxSelect(
  items: Array<{ challenge: Challenge; priority: number }>,
): Challenge {
  if (items.length === 1) return items[0].challenge;

  const maxPriority = Math.max(...items.map((i) => i.priority));
  const weights = items.map((i) => Math.exp((i.priority - maxPriority) / 10));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const r = Math.random() * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) {
      return items[i].challenge;
    }
  }

  return items[items.length - 1].challenge;
}

// ── Min Score ──────────────────────────────────────────────────────────

function minScoreSelect(
  challenges: Challenge[],
  archive: Archive,
  _artifactId: string,
): Challenge {
  const stats = archive.getChallengeStats();

  let worst: Challenge | null = null;
  let worstScore = Infinity;

  for (const challenge of challenges) {
    const stat = stats.get(challenge.id);
    if (!stat) {
      // Never tested — return immediately
      return challenge;
    }
    // Use the most recent score for comparison
    if (stat.lastScore < worstScore) {
      worstScore = stat.lastScore;
      worst = challenge;
    }
  }

  return worst ?? challenges[0];
}
