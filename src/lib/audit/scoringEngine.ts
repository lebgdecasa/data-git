import {
  type AuditResult,
  type CategoryResult,
  type Dimension,
  type DimensionResult,
  type DimensionScore,
  type MaturityStage,
  type Priority,
  type RagStatus,
  type RawAnswers,
} from "@/lib/audit/auditTypes";
import {
  CATEGORIES,
  DIMENSIONS,
  dimensionsForCategory,
} from "@/lib/audit/auditQuestions";
import {
  buildNarrative,
  enrichDimension,
  maturitySummary,
} from "@/lib/audit/recommendationEngine";

/**
 * Deterministic scoring engine. Same answers always produce the same scores,
 * statuses and maturity stage. The AI layer can be layered on top later
 * without changing this contract.
 */

// ---------------------------------------------------------------------------
// Tunable thresholds
// ---------------------------------------------------------------------------

/** RAG status cutoffs on the 0-100 dimension score. */
export const STATUS_THRESHOLDS = {
  green: 70,
  yellow: 45,
} as const;

/** Lower bound (inclusive) of each maturity stage on the 0-100 overall score. */
export const MATURITY_THRESHOLDS: { min: number; stage: MaturityStage }[] = [
  { min: 85, stage: "Scale Ready" },
  { min: 70, stage: "Growth Ready" },
  { min: 50, stage: "Promising" },
  { min: 30, stage: "Early Validation" },
  { min: 0, stage: "Confused" },
];

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Coerce a raw answer into a 1-5 integer, or null when unanswered/invalid. */
function coerceAnswer(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function statusFromScore(score: number): RagStatus {
  if (score >= STATUS_THRESHOLDS.green) return "green";
  if (score >= STATUS_THRESHOLDS.yellow) return "yellow";
  return "red";
}

export function maturityFromScore(score: number): MaturityStage {
  return (
    MATURITY_THRESHOLDS.find((t) => score >= t.min)?.stage ?? "Confused"
  );
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Score a single dimension from raw answers. */
export function scoreDimension(
  dimension: Dimension,
  answers: RawAnswers,
): DimensionScore {
  let weightedSum = 0;
  let weightTotal = 0;
  let answeredCount = 0;

  for (const question of dimension.questions) {
    const value = coerceAnswer(answers[question.id]);
    if (value === null) continue;
    weightedSum += value * question.weight;
    weightTotal += question.weight;
    answeredCount += 1;
  }

  const rawAverage = weightTotal > 0 ? weightedSum / weightTotal : 0;
  // Map a 1-5 average onto 0-100. Unanswered dimensions score 0.
  const score =
    answeredCount > 0 ? clamp(Math.round(((rawAverage - 1) / 4) * 100)) : 0;

  return {
    id: dimension.id,
    score,
    rawAverage: Math.round(rawAverage * 100) / 100,
    status: statusFromScore(score),
    weight: dimension.weight,
    answeredCount,
    questionCount: dimension.questions.length,
  };
}

/** Weighted roll-up of a set of dimension scores into a 0-100 score. */
function weightedScore(scores: DimensionScore[]): number {
  const weightTotal = scores.reduce((sum, s) => sum + s.weight, 0);
  if (weightTotal === 0) return 0;
  const weighted = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  return clamp(Math.round(weighted / weightTotal));
}

function buildCategories(results: DimensionResult[]): CategoryResult[] {
  return CATEGORIES.map((category) => {
    const members = results.filter((r) => r.category === category.id);
    const score = weightedScore(members);
    return {
      id: category.id,
      title: category.title,
      score,
      status: statusFromScore(score),
      dimensionIds: dimensionsForCategory(category.id).map((d) => d.id),
    };
  });
}

/**
 * Run the full deterministic audit. This is the single public entry point the
 * rest of the app calls.
 */
export function runAudit(
  answers: RawAnswers,
  options: { productName?: string } = {},
): AuditResult {
  const productName = options.productName?.trim() || "Your product";

  const dimensionScores = DIMENSIONS.map((d) => scoreDimension(d, answers));
  const dimensions: DimensionResult[] = dimensionScores.map(enrichDimension);

  const overallScore = weightedScore(dimensionScores);
  const stage = maturityFromScore(overallScore);
  const categories = buildCategories(dimensions);

  const answeredTotal = dimensionScores.reduce(
    (sum, s) => sum + s.answeredCount,
    0,
  );
  const questionTotal = dimensionScores.reduce(
    (sum, s) => sum + s.questionCount,
    0,
  );
  const completeness = questionTotal
    ? Math.round((answeredTotal / questionTotal) * 100)
    : 0;

  const topPriorities = dimensions
    .filter((d) => d.status !== "green")
    .sort(
      (a, b) =>
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        b.weight - a.weight ||
        a.score - b.score,
    )
    .slice(0, 5);

  const strengths = dimensions
    .filter((d) => d.status === "green")
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const { headline, summary } = buildNarrative({
    productName,
    overallScore,
    stage,
    topPriorities,
    strengths,
  });

  return {
    overallScore,
    maturityStage: stage,
    maturitySummary: maturitySummary(stage),
    headline,
    summary,
    completeness,
    categories,
    dimensions,
    topPriorities,
    strengths,
    generatedAt: new Date().toISOString(),
    engine: "deterministic",
  };
}
