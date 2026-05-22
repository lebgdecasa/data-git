/**
 * Product Audit Studio — audit framework types.
 *
 * This module is framework-pure: no React, no database, no side effects.
 * It defines the shape of the 12-dimension audit, the diagnostic questions,
 * and the deterministic scoring/recommendation output.
 */

// ---------------------------------------------------------------------------
// Dimensions & categories
// ---------------------------------------------------------------------------

/** The twelve dimensions a product is evaluated against. */
export type DimensionId =
  | "positioning_clarity"
  | "target_customer"
  | "problem_urgency"
  | "value_proposition"
  | "landing_conversion"
  | "onboarding_friction"
  | "feature_clarity"
  | "pricing_logic"
  | "trust_credibility"
  | "retention_potential"
  | "gtm_readiness"
  | "pmf_signals";

/** Dimensions roll up into four scoring categories. */
export type CategoryId = "clarity" | "market" | "experience" | "growth";

// ---------------------------------------------------------------------------
// Status, priority & maturity
// ---------------------------------------------------------------------------

/** Red / yellow / green health signal. */
export type RagStatus = "red" | "yellow" | "green";

/** How urgently a dimension should be addressed. */
export type Priority = "critical" | "high" | "medium" | "low";

/** Overall product maturity stage derived from the final score. */
export type MaturityStage =
  | "Confused"
  | "Early Validation"
  | "Promising"
  | "Growth Ready"
  | "Scale Ready";

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/** A point on the 5-point diagnostic scale. */
export interface ScalePoint {
  value: 1 | 2 | 3 | 4 | 5;
  label: string;
}

/**
 * Supported question input types in the questionnaire UI.
 *
 * Only `scale` questions feed the deterministic score. Every other type is
 * qualitative context that enriches the audit (and the future AI layer).
 */
export type QuestionType =
  | "scale"
  | "text"
  | "textarea"
  | "radio"
  | "checkbox"
  | "url"
  | "file";

/** An option for `radio` and `checkbox` questions. */
export interface QuestionOption {
  value: string;
  label: string;
}

/**
 * A diagnostic question. `scale` questions are phrased as positive statements
 * rated on the shared 5-point scale, which keeps scoring deterministic and
 * comparable. Other types capture qualitative context.
 */
export interface DiagnosticQuestion {
  id: string;
  dimension: DimensionId;
  text: string;
  type: QuestionType;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  /** Options for `radio` / `checkbox` questions. */
  options?: QuestionOption[];
  /** Relative weight within its dimension. Only used for `scale` questions. */
  weight: number;
}

/** A dimension definition: metadata + its diagnostic questions. */
export interface Dimension {
  id: DimensionId;
  title: string;
  description: string;
  /** Friendly, consultant-voice intro shown at the top of the section. */
  intro: string;
  category: CategoryId;
  /** Relative weight of this dimension in the overall (0-100) score. */
  weight: number;
  questions: DiagnosticQuestion[];
}

export interface CategoryMeta {
  id: CategoryId;
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

/**
 * Raw answers as they arrive from the UI / database. Values are 1-5 (or the
 * string equivalent), or null/undefined when unanswered. The scoring engine
 * coerces these safely.
 */
export type RawAnswers = Record<
  string,
  string | number | string[] | null | undefined
>;

// ---------------------------------------------------------------------------
// Scoring output
// ---------------------------------------------------------------------------

/** Pure numeric scoring output for a single dimension. */
export interface DimensionScore {
  id: DimensionId;
  /** 0-100. */
  score: number;
  /** 1-5 weighted average of answered questions. */
  rawAverage: number;
  status: RagStatus;
  weight: number;
  answeredCount: number;
  questionCount: number;
}

/** A dimension score enriched with qualitative guidance. */
export interface DimensionResult extends DimensionScore {
  title: string;
  category: CategoryId;
  priority: Priority;
  explanation: string;
  recommendations: string[];
  nextActions: string[];
}

export interface CategoryResult {
  id: CategoryId;
  title: string;
  /** 0-100. */
  score: number;
  status: RagStatus;
  dimensionIds: DimensionId[];
}

/** The complete, deterministic audit result. Stored as the audit `report`. */
export interface AuditResult {
  /** Final score out of 100. */
  overallScore: number;
  maturityStage: MaturityStage;
  maturitySummary: string;
  headline: string;
  summary: string;
  /** Percentage of diagnostic questions answered (0-100). */
  completeness: number;
  categories: CategoryResult[];
  dimensions: DimensionResult[];
  /** Highest-priority dimensions to act on, ordered most urgent first. */
  topPriorities: DimensionResult[];
  /** Dimensions performing well, ordered strongest first. */
  strengths: DimensionResult[];
  generatedAt: string;
  engine: "deterministic" | "ai";
}
