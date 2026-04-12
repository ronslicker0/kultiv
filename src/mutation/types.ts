// ── Mutation Type Definitions ────────────────────────────────────────────

export const MUTATION_TYPES = [
  'ADD_RULE',
  'ADD_EXAMPLE',
  'ADD_NEGATIVE_EXAMPLE',
  'REORDER',
  'SIMPLIFY',
  'REPHRASE',
  'DELETE_RULE',
  'MERGE_RULES',
  'RESTRUCTURE',
] as const;

export type MutationType = (typeof MUTATION_TYPES)[number];

export interface MutationOutput {
  diagnosis: string;
  mutation_type: MutationType;
  target_section: string;
  action: 'add' | 'remove' | 'replace' | 'move';
  content: string;
  position: string;
  expected_impact: string;
  updated_artifact: string;
}

export interface MutationResult {
  output: MutationOutput;
  diff: string;
  input_tokens: number;
  output_tokens: number;
  dialogue_trace?: DialogueTrace;
  variants?: string[];
}

// ── Beam & Cross-Validation Types ──────────────────────────────────────

export interface BeamVariant {
  content: string;
  variant_index: number;
}

export interface CrossValidationResult {
  challenge_id: string;
  score: number;
  max_score: number;
  regressed: boolean;
}

// ── Challenge Types ────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  scorer_overrides?: Array<{
    name: string;
    command?: string;
    type?: string;
    rules_file?: string;
    weight: number;
  }>;
  tags?: string[];
}

// ── Dialogue Mode Types ─────────────────────────────────────────────────

export type MutationMode = 'single' | 'dialogue';

export interface ExploreCandidate {
  mutation_type: MutationType;
  target: string;
  rationale: string;
  regression_risk: 'low' | 'medium' | 'high';
}

export interface CritiqueOutput {
  selected_index: number;
  selected: ExploreCandidate;
  reasoning: string;
  rejected_reasons: Record<number, string>;
}

export interface SpecifyOutput {
  mutation_type: MutationType;
  target_section: string;
  action: 'add' | 'remove' | 'replace' | 'move';
  content_spec: string;
  integration_constraints: string[];
  expected_score_deltas: Record<string, number>;
}

export interface DialogueTrace {
  explore_candidates: ExploreCandidate[];
  selected_candidate: ExploreCandidate;
  critique_reasoning: string;
  specification: string;
  rounds_completed: number;
  total_input_tokens: number;
  total_output_tokens: number;
  beam_variants_count?: number;
  selected_variant_index?: number;
}

// ── Failure Context ─────────────────────────────────────────────────────

export interface FailureContext {
  recentErrors: Array<{
    error: string;
    category: string;
    timestamp: string;
    errorPatterns?: string[];
  }>;
}

// ── Scan Analysis ───────────────────────────────────────────────────────

export interface ScanAnalysis {
  artifactId: string;
  scannedAt: string;
  purpose: string;
  domain: string;
  sections: Array<{ name: string; lineCount: number; assessment: string }>;
  recommendations: Array<{
    type: 'trim' | 'expand' | 'combine' | 'split' | 'restructure' | 'add_examples';
    target: string;
    rationale: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  hasExamples: boolean;
  hasNegativeExamples: boolean;
  hasDecisionTrees: boolean;
}
