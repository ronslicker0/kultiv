import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import yaml from 'js-yaml';
import type { Challenge } from '../mutation/types.js';

/**
 * Load all challenge definitions from a directory of YAML files.
 * Each file represents one challenge. Files are sorted by difficulty ascending.
 *
 * @param challengesDir  Absolute or relative path to the challenges directory.
 * @returns Parsed challenges sorted by difficulty.
 */
export function loadChallenges(challengesDir: string): Challenge[] {
  const files = readdirSync(challengesDir).filter((f) => {
    const ext = extname(f).toLowerCase();
    return ext === '.yaml' || ext === '.yml';
  });

  const challenges: Challenge[] = [];

  for (const file of files) {
    const filePath = join(challengesDir, file);
    try {
      const challenge = loadChallenge(filePath);
      challenges.push(challenge);
    } catch {
      // Skip malformed challenge files — keep processing the rest
    }
  }

  // Sort by difficulty ascending
  challenges.sort((a, b) => a.difficulty - b.difficulty);

  return challenges;
}

/**
 * Load a single challenge from a YAML file.
 * The challenge id is derived from the filename (without extension) unless
 * explicitly provided in the YAML content.
 *
 * @param filePath  Path to the YAML challenge file.
 * @returns Parsed Challenge object.
 */
export function loadChallenge(filePath: string): Challenge {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = yaml.load(raw) as Record<string, unknown>;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid challenge file: ${filePath}`);
  }

  // Derive id from filename if not present in the YAML
  const fileId = basename(filePath, extname(filePath));

  const challenge: Challenge = {
    id: typeof parsed.id === 'string' ? parsed.id : fileId,
    name: typeof parsed.name === 'string' ? parsed.name : fileId,
    description: typeof parsed.description === 'string' ? parsed.description : '',
    difficulty: typeof parsed.difficulty === 'number' ? parsed.difficulty : 1,
    scorer_overrides: Array.isArray(parsed.scorer_overrides)
      ? (parsed.scorer_overrides as Challenge['scorer_overrides'])
      : undefined,
    tags: Array.isArray(parsed.tags)
      ? (parsed.tags as string[])
      : undefined,
  };

  return challenge;
}
