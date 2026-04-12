import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import type { LLMProvider } from '../llm/provider.js';
import type { Challenge, ScanAnalysis } from '../mutation/types.js';
import type { ScorecardCheck } from '../core/archive.js';

/**
 * Use an LLM to generate new challenge definitions that target weak criteria.
 *
 * The generator builds a prompt describing the artifact, its known weaknesses,
 * and any existing challenges, then asks the LLM to produce 3 new challenge
 * YAML objects that focus on the weakest areas.
 *
 * @param artifact            The current artifact content.
 * @param scanAnalysis        Optional structural analysis of the artifact.
 * @param weakCriteria        Scorecard checks that scored poorly.
 * @param existingChallenges  Already-defined challenges (to avoid duplicates).
 * @param provider            LLM provider for generation.
 * @returns Array of newly generated Challenge objects.
 */
export async function generateChallenges(
  artifact: string,
  scanAnalysis: ScanAnalysis | undefined,
  weakCriteria: ScorecardCheck[],
  existingChallenges: Challenge[],
  provider: LLMProvider,
): Promise<Challenge[]> {
  const existingNames = existingChallenges.map((c) => c.name).join(', ');
  const weakList = weakCriteria
    .map((c) => `- ${c.name}: ${c.score}/${c.max}${c.note ? ` (${c.note})` : ''}`)
    .join('\n');

  const scanContext = scanAnalysis
    ? `\nArtifact analysis:\n- Purpose: ${scanAnalysis.purpose}\n- Domain: ${scanAnalysis.domain}\n- Recommendations: ${scanAnalysis.recommendations.map((r) => `${r.type} ${r.target}: ${r.rationale}`).join('; ')}`
    : '';

  const prompt = `You are generating evaluation challenges for an evolving artifact.

Artifact (first 2000 chars):
\`\`\`
${artifact.slice(0, 2000)}
\`\`\`
${scanContext}

Weak criteria that need improvement:
${weakList || '(none identified yet)'}

Existing challenges (avoid duplicates): ${existingNames || '(none)'}

Generate exactly 3 new challenge definitions as a YAML array. Each challenge should:
1. Target one or more of the weak criteria listed above.
2. Have a clear, measurable description.
3. Include a difficulty rating from 1 (easy) to 10 (hard).
4. Include relevant tags.

Respond with ONLY a YAML array (no markdown fences), where each item has these fields:
- id: a kebab-case identifier
- name: short human-readable name
- description: what the challenge tests
- difficulty: integer 1-10
- tags: list of relevant tag strings

Example format:
- id: edge-case-handling
  name: Edge Case Handling
  description: Tests the artifact's ability to handle unusual inputs gracefully
  difficulty: 5
  tags:
    - robustness
    - edge-cases`;

  const response = await provider.generate(
    [{ role: 'user', content: prompt }],
    { maxTokens: 2000, temperature: 0.7 },
  );

  return parseChallengesFromResponse(response.content);
}

/**
 * Parse the LLM response into Challenge objects.
 */
function parseChallengesFromResponse(content: string): Challenge[] {
  // Strip markdown fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:ya?ml)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(cleaned);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const challenges: Challenge[] = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;

    const challenge: Challenge = {
      id: typeof obj.id === 'string' ? obj.id : `generated-${Date.now()}-${challenges.length}`,
      name: typeof obj.name === 'string' ? obj.name : 'Unnamed Challenge',
      description: typeof obj.description === 'string' ? obj.description : '',
      difficulty: typeof obj.difficulty === 'number' ? obj.difficulty : 5,
      tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
    };

    challenges.push(challenge);
  }

  return challenges;
}

/**
 * Save challenge definitions to YAML files in the specified directory.
 * Each challenge is written to its own file named by its id.
 *
 * @param challengesDir  Directory to write challenge files into.
 * @param challenges     Challenge objects to persist.
 */
export function saveChallenges(challengesDir: string, challenges: Challenge[]): void {
  if (!existsSync(challengesDir)) {
    mkdirSync(challengesDir, { recursive: true });
  }

  for (const challenge of challenges) {
    const filePath = join(challengesDir, `${challenge.id}.yaml`);
    const content = yaml.dump(challenge, {
      lineWidth: 100,
      noRefs: true,
      sortKeys: false,
    });
    writeFileSync(filePath, content, 'utf-8');
  }
}
