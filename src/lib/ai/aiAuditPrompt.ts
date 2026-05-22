import type {
  CategoryResult,
  DimensionResult,
  MaturityStage,
} from "@/lib/audit/auditTypes";
import { ALL_QUESTIONS } from "@/lib/audit/auditQuestions";
import type { AuditAnswers, BusinessProfile } from "@/lib/types";

/**
 * Everything the report generator needs. Derived from the deterministic
 * scoring result plus the user's business info and raw answers.
 */
export interface AuditReportInput {
  business: BusinessProfile;
  answers: AuditAnswers;
  finalScore: number;
  maturityStage: MaturityStage;
  categoryScores: CategoryResult[];
  /** Weakest dimensions (highest-priority gaps), most urgent first. */
  weakest: DimensionResult[];
  /** Strongest dimensions, strongest first. */
  strongest: DimensionResult[];
  /** All twelve scored dimensions. */
  dimensions: DimensionResult[];
}

/** The JSON contract the model must return. Keep in sync with AuditNarrative. */
export const REPORT_JSON_SCHEMA = `{
  "executiveSummary": string (3-5 sentences, founder-friendly),
  "productDiagnosis": string (what kind of shape the product is in and why),
  "scoreOverview": string (interpret the overall and category scores),
  "growthBottlenecks": string[] (3-5 specific bottlenecks holding back growth),
  "positioningAnalysis": string,
  "landingPageAnalysis": string,
  "onboardingAnalysis": string,
  "pricingAnalysis": string,
  "trustAnalysis": string,
  "pmfAnalysis": string,
  "topActions": [{ "title": string, "detail": string, "priority": "critical"|"high"|"medium"|"low" }] (exactly 10, ordered by impact),
  "roadmap30Day": [{ "timeframe": string, "focus": string, "actions": string[] }] (4 phases covering 30 days),
  "quickWins": string[] (3-6 high-impact, low-effort actions),
  "strategicRisks": string[] (3-5 risks if the gaps are not addressed),
  "finalRecommendation": string (the single most important thing to do next)
}`;

function formatScores(input: AuditReportInput): string {
  const cats = input.categoryScores
    .map((c) => `  - ${c.title}: ${c.score}/100 (${c.status})`)
    .join("\n");
  const dims = input.dimensions
    .map((d) => `  - ${d.title}: ${d.score}/100 (${d.status}, ${d.priority} priority)`)
    .join("\n");
  return `Overall score: ${input.finalScore}/100 — maturity stage: ${input.maturityStage}\n\nCategory scores:\n${cats}\n\nDimension scores:\n${dims}`;
}

/** Pull the qualitative (non-scale) answers — they carry product specifics. */
function formatContextAnswers(answers: AuditAnswers): string {
  const lines = ALL_QUESTIONS.filter((q) => q.type !== "scale")
    .map((q) => {
      const raw = answers[q.id];
      if (raw === undefined || raw === "") return null;
      const value = Array.isArray(raw) ? raw.join(", ") : raw;
      if (!value) return null;
      return `  - ${q.text} → ${value}`;
    })
    .filter(Boolean);
  return lines.length ? lines.join("\n") : "  (none provided)";
}

/**
 * Build the system + user prompt for the strategic audit report. The system
 * prompt fixes the persona and tone; the user prompt supplies the data and the
 * required JSON output shape.
 */
export function buildAuditReportPrompt(input: AuditReportInput): {
  system: string;
  user: string;
} {
  const system = [
    "You are a seasoned product and growth strategist who advises early-stage founders.",
    "You write like a sharp, experienced operator giving a trusted founder the real story.",
    "Tone: clear, strategic, practical and founder-friendly. Never generic, never academic, no fluff or buzzwords.",
    "Always be specific to THIS product: reference its actual scores, answers and weakest areas. Give concrete, doable advice with examples.",
    "Prioritise the highest-leverage moves. Be honest about weaknesses but constructive.",
    "Return ONLY valid JSON matching the requested schema. No markdown, no commentary.",
  ].join(" ");

  const b = input.business;
  const weakest = input.weakest
    .map((d) => `  - ${d.title} (${d.score}/100): ${d.explanation}`)
    .join("\n");
  const strongest = input.strongest
    .map((d) => `  - ${d.title} (${d.score}/100)`)
    .join("\n");

  const user = [
    "Write a complete strategic product audit report for the product below.",
    "",
    "## Business",
    `Product: ${b.productName}`,
    b.website ? `Website: ${b.website}` : null,
    b.industry ? `Industry: ${b.industry}` : null,
    b.stage ? `Stage: ${b.stage}` : null,
    b.targetAudience ? `Target audience: ${b.targetAudience}` : null,
    b.primaryGoal ? `Primary goal: ${b.primaryGoal}` : null,
    b.description ? `Description: ${b.description}` : null,
    "",
    "## Scores",
    formatScores(input),
    "",
    "## Weakest areas (focus here)",
    weakest || "  (none)",
    "",
    "## Strongest areas",
    strongest || "  (none)",
    "",
    "## Founder's qualitative answers",
    formatContextAnswers(input.answers),
    "",
    "## Output",
    "Return JSON exactly matching this schema:",
    REPORT_JSON_SCHEMA,
    "",
    "Make the six dimension analyses (positioning, landing page, onboarding, pricing, trust, PMF) specific to the scores and answers above.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { system, user };
}
