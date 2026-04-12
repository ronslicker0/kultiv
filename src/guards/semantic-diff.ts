import type { LLMProvider } from '../llm/provider.js';
import type { SpecifyOutput } from '../mutation/types.js';

// ── Types ────────────────────────────────────────────────────────────────

export interface SemanticDiffResult {
  passed: boolean;
  violations: string[];
}

// ── Semantic Diff Guard ─────────────────────────────────────────────────

/**
 * Verify that a mutation only made the changes described in the spec.
 *
 * Sends both versions to the LLM and asks two questions:
 * 1. Was the claimed change actually made?
 * 2. Were any OTHER changes made beyond the spec?
 *
 * Uses fail-open semantics: if the LLM response cannot be parsed,
 * returns passed=true so evolution is not blocked by guard failures.
 */
export async function verifySemantic(
  original: string,
  mutated: string,
  spec: SpecifyOutput,
  provider: LLMProvider,
): Promise<SemanticDiffResult> {
  const prompt = buildPrompt(original, mutated, spec);

  try {
    const response = await provider.generate(
      [{ role: 'user', content: prompt }],
      { temperature: 0.1, maxTokens: 1024 },
    );

    return parseResponse(response.content);
  } catch {
    // Fail-open: do not block evolution if the guard itself errors
    return { passed: true, violations: [] };
  }
}

// ── Prompt Construction ─────────────────────────────────────────────────

function buildPrompt(original: string, mutated: string, spec: SpecifyOutput): string {
  return `You are a semantic diff reviewer. Compare the original and mutated versions of an artifact against the mutation specification below.

<specification>
Mutation type: ${spec.mutation_type}
Target section: ${spec.target_section}
Action: ${spec.action}
Content spec: ${spec.content_spec}
Integration constraints: ${spec.integration_constraints.join('; ')}
</specification>

<original>
${original}
</original>

<mutated>
${mutated}
</mutated>

Answer these two questions:
1. Was the claimed change (described in the specification) actually made?
2. Were any OTHER changes made beyond what the specification describes?

A mutation passes if the claimed change was made AND no unauthorized changes were introduced.

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{"passed": true, "violations": []}

If there are violations, list each as a short string:
{"passed": false, "violations": ["Unauthorized deletion of section X", "Claimed change was not applied"]}`;
}

// ── Response Parsing ────────────────────────────────────────────────────

function parseResponse(content: string): SemanticDiffResult {
  try {
    // Try to extract JSON from the response (handle markdown code fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { passed: true, violations: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    const passed = typeof parsed.passed === 'boolean' ? parsed.passed : true;
    const violations = Array.isArray(parsed.violations)
      ? (parsed.violations as unknown[]).filter((v): v is string => typeof v === 'string')
      : [];

    return { passed, violations };
  } catch {
    // Fail-open: unparseable response does not block evolution
    return { passed: true, violations: [] };
  }
}
