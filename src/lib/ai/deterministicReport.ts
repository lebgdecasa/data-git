import type {
  AuditNarrative,
  DimensionId,
  DimensionResult,
  RecommendedAction,
  RoadmapPhase,
} from "@/lib/audit/auditTypes";
import { dimensionRisk, maturitySummary } from "@/lib/audit/recommendationEngine";
import type { AuditReportInput } from "@/lib/ai/aiAuditPrompt";

/**
 * Deterministic strategic report. Produces the full 15-section narrative from
 * the scoring engine output — no AI required. Used as the fallback whenever an
 * AI provider/key is not configured (and as the safety net if a call fails).
 */

function statusWord(d: DimensionResult): string {
  if (d.status === "green") return "a genuine strength";
  if (d.status === "yellow") return "a work in progress";
  return "a critical gap";
}

function find(input: AuditReportInput, id: DimensionId): DimensionResult {
  return (
    input.dimensions.find((d) => d.id === id) ?? input.dimensions[0]
  );
}

function analysis(d: DimensionResult): string {
  const lead = `${d.title} scores ${d.score}/100 — ${statusWord(d)}. ${d.explanation}`;
  const rec = d.recommendations[0] ? ` The highest-leverage move: ${lower(d.recommendations[0])}` : "";
  return lead + rec;
}

function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function buildDeterministicNarrative(
  input: AuditReportInput,
): AuditNarrative {
  const name = input.business.productName || "Your product";
  const weakest = input.weakest;
  const strongest = input.strongest;

  const strongestLine = strongest.length
    ? `Its strongest areas are ${strongest
        .slice(0, 2)
        .map((d) => d.title.toLowerCase())
        .join(" and ")}.`
    : "";
  const weakestLine = weakest.length
    ? `The biggest drags on growth are ${weakest
        .slice(0, 2)
        .map((d) => d.title.toLowerCase())
        .join(" and ")}.`
    : "";

  const executiveSummary = `${name} is at the "${input.maturityStage}" stage with an overall audit score of ${input.finalScore}/100. ${strongestLine} ${weakestLine} ${maturitySummary(input.maturityStage)} The fastest path forward is to fix ${weakest[0]?.title.toLowerCase() ?? "your weakest area"} first.`;

  const sortedCats = [...input.categoryScores].sort((a, b) => b.score - a.score);
  const productDiagnosis = `Across the four categories, ${name} is strongest in ${sortedCats[0]?.title} (${sortedCats[0]?.score}/100) and weakest in ${sortedCats[sortedCats.length - 1]?.title} (${sortedCats[sortedCats.length - 1]?.score}/100). ${
    input.finalScore >= 70
      ? "The fundamentals are largely in place; the work now is optimisation and scale."
      : input.finalScore >= 50
        ? "There's a real core to build on, but a few high-leverage gaps are capping momentum."
        : "Several fundamentals still need to be aligned before pouring fuel on growth."
  }`;

  const scoreOverview = `Overall: ${input.finalScore}/100 (${input.maturityStage}). By category — ${input.categoryScores
    .map((c) => `${c.title}: ${c.score}`)
    .join(", ")}. ${input.dimensions.filter((d) => d.status === "red").length} dimension(s) are red, ${input.dimensions.filter((d) => d.status === "yellow").length} yellow and ${input.dimensions.filter((d) => d.status === "green").length} green.`;

  const growthBottlenecks = weakest
    .slice(0, 4)
    .map((d) => `${d.title} (${d.score}/100): ${d.explanation}`);

  // Top 10 actions, prioritised across dimensions.
  const topActions: RecommendedAction[] = [];
  for (const d of input.dimensions
    .slice()
    .sort((a, b) => priorityRank(a) - priorityRank(b) || a.score - b.score)) {
    for (const rec of d.recommendations) {
      if (topActions.length >= 10) break;
      topActions.push({
        title: rec,
        detail: `${d.title} · ${d.priority} priority (${d.score}/100)`,
        priority: d.priority,
      });
    }
    if (topActions.length >= 10) break;
  }

  // 30-day roadmap.
  const w1 = weakest[0];
  const w2 = weakest[1];
  const roadmap30Day: RoadmapPhase[] = [
    {
      timeframe: "Days 1–7",
      focus: "Quick wins & critical fixes",
      actions: dedupe([
        ...(w1?.nextActions ?? []),
        ...(weakest[0]?.recommendations.slice(0, 1) ?? []),
      ]).slice(0, 4),
    },
    {
      timeframe: "Days 8–14",
      focus: w1 ? `Fix ${w1.title}` : "Strengthen the weakest area",
      actions: (w1?.recommendations ?? []).slice(0, 3),
    },
    {
      timeframe: "Days 15–21",
      focus: w2 ? `Improve ${w2.title}` : "Tackle the second priority",
      actions: (w2?.recommendations ?? []).slice(0, 3),
    },
    {
      timeframe: "Days 22–30",
      focus: "Measure, validate & re-audit",
      actions: [
        "Instrument the metrics behind your weakest dimensions so progress is visible.",
        "Talk to 5 customers to validate the changes you shipped.",
        "Re-run this audit to confirm the scores moved.",
      ],
    },
  ];

  const quickWins = dedupe(
    weakest.flatMap((d) => d.nextActions),
  ).slice(0, 6);

  const reds = input.dimensions.filter((d) => d.status === "red");
  const riskSource = reds.length ? reds : weakest;
  const strategicRisks = riskSource
    .slice(0, 5)
    .map(
      (d) =>
        `If ${d.title} stays at ${d.score}/100, expect ${dimensionRisk(d.id)}.`,
    );

  const finalRecommendation = `Focus relentlessly on ${weakest[0]?.title ?? "your weakest area"} over the next 30 days — it's the single biggest lever on your score right now. ${
    input.finalScore >= 70
      ? "You're close to scale-ready; tightening this unlocks compounding growth."
      : "Nail this before broadening focus, and the rest of the funnel will follow."
  }`;

  return {
    executiveSummary,
    productDiagnosis,
    scoreOverview,
    growthBottlenecks,
    positioningAnalysis: analysis(find(input, "positioning_clarity")),
    landingPageAnalysis: analysis(find(input, "landing_conversion")),
    onboardingAnalysis: analysis(find(input, "onboarding_friction")),
    pricingAnalysis: analysis(find(input, "pricing_logic")),
    trustAnalysis: analysis(find(input, "trust_credibility")),
    pmfAnalysis: analysis(find(input, "pmf_signals")),
    topActions,
    roadmap30Day,
    quickWins,
    strategicRisks,
    finalRecommendation,
    generatedAt: new Date().toISOString(),
    engine: "deterministic",
  };
}

function priorityRank(d: DimensionResult): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[d.priority];
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
