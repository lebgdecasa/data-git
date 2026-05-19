// Derive downstream content (dashboard charts, KPI page data, final report)
// from the user's saved ProductProfile + AuditResult.
//
// This module is the connective tissue that makes the journey truthful:
// what the user enters in Step 1 flows through Steps 2-5 dynamically.

import type {
  ProductProfile,
  AuditResult,
  BaselineMetrics,
} from "./profile";
import { calculateHealthScore, calculateRiskScore } from "./profile";

// ─── Synthesized history (no real time-series data available) ──────────────

export type MonthPoint = { month: string; value: number };

const MONTHS_12 = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const MONTHS_6  = MONTHS_12.slice(-6);

/**
 * Synthesize an MRR ramp: smooth growth ending at current MRR.
 * If MRR is 0, returns flat zeros so charts still render.
 */
export function deriveMrrHistory(profile: ProductProfile) {
  if (!profile.mrr) return MONTHS_12.map((m) => ({ month: m, mrr: 0 }));
  // Assume a 55-65% trailing 12-month growth, so 12 months ago MRR was ~ current / 1.55
  const startMrr = profile.mrr / 1.55;
  return MONTHS_12.map((m, i) => {
    // Slightly compounding curve, plus tiny variance for visual interest
    const t = i / 11;
    const growth = startMrr + (profile.mrr - startMrr) * Math.pow(t, 1.15);
    const variance = (Math.sin(i * 1.3) * 0.015 * profile.mrr);
    return { month: m, mrr: Math.round(growth + variance) };
  });
}

/**
 * Synthesize churn history: small variance around current churn.
 */
export function deriveChurnHistory(profile: ProductProfile) {
  const c = profile.churnRate || 0;
  return MONTHS_6.map((m, i) => ({
    month: m,
    churn: Math.max(0.5, Number((c + Math.sin(i * 1.7) * 0.7).toFixed(1))),
  }));
}

/**
 * Funnel stages derived from activation + retention.
 * Visitors → Signups → Activated → Retained D30
 */
export function deriveFunnel(profile: ProductProfile) {
  const payingUsers = profile.payingUsers || 0;
  // Backsolve: if payingUsers represents activated converted, infer prior stages
  const activatedUsers = Math.max(payingUsers, Math.round(payingUsers / Math.max(0.3, profile.activationRate / 100)));
  const signups = Math.round(activatedUsers / Math.max(0.15, profile.activationRate / 100));
  const visitors = Math.round(signups / 0.15); // Assume 15% visitor → signup CVR
  return [
    { stage: "Visitors",     value: visitors,        pct: 100,                                    color: "#6366f1" },
    { stage: "Signups",      value: signups,         pct: Math.round((signups / visitors) * 100), color: "#8b5cf6" },
    { stage: "Activated",    value: activatedUsers,  pct: Math.round(profile.activationRate),     color: "#a855f7" },
    { stage: "Retained D30", value: Math.round(activatedUsers * (profile.retentionRate30 / 100)), pct: Math.round(profile.retentionRate30), color: "#d946ef" },
  ];
}

/**
 * Retention curve D1..D90 from the 30-day retention point.
 * Uses a typical SaaS decay shape calibrated to hit the user's D30.
 */
export function deriveRetentionCurve(profile: ProductProfile) {
  const d30 = profile.retentionRate30 || 30;
  // Calibrate exponential decay so that day 30 = d30
  // R(t) = 100 * e^(-k*t), with R(30) = d30 → k = ln(100/d30) / 30
  const k = Math.log(100 / Math.max(1, d30)) / 30;
  const days = [1, 3, 7, 14, 21, 30, 60, 90];
  return days.map((d) => ({
    day: `Day ${d}`,
    rate: Math.round(100 * Math.exp(-k * d)),
  }));
}

// ─── Diagnoses (contextual one-liners) ──────────────────────────────────────

export type Diagnosis = {
  tone: "good" | "warn" | "bad";
  title: string;
  body: string;
  iconName: "TrendingUp" | "Zap" | "TrendingDown" | "ShieldAlert" | "Map" | "Activity";
};

export function deriveDiagnoses(profile: ProductProfile): Diagnosis[] {
  const out: Diagnosis[] = [];
  const ltvCac = profile.cac > 0 ? profile.ltv / profile.cac : 0;

  // Monetization
  if (ltvCac >= 5) {
    out.push({
      tone: "good", iconName: "TrendingUp",
      title: "Strong unit economics",
      body: `LTV/CAC ratio of ${ltvCac.toFixed(1)}x is healthy. Revenue efficiency is a moat - protect it as you scale.`,
    });
  } else if (ltvCac > 0 && ltvCac < 3) {
    out.push({
      tone: "bad", iconName: "TrendingDown",
      title: "Unit economics are weak",
      body: `LTV/CAC of ${ltvCac.toFixed(1)}x is below the 3x SaaS benchmark. Either reduce CAC or expand ARPU before scaling.`,
    });
  }

  // Activation
  if (profile.activationRate > 0 && profile.activationRate < 45) {
    out.push({
      tone: "bad", iconName: "Zap",
      title: "Activation is critically weak",
      body: `Only ${profile.activationRate}% of signups reach activation. This is the highest-leverage fix - 10 points here compounds across retention and LTV.`,
    });
  } else if (profile.activationRate >= 60) {
    out.push({
      tone: "good", iconName: "Zap",
      title: "Activation is healthy",
      body: `${profile.activationRate}% activation is at or above benchmark. The growth engine is working.`,
    });
  }

  // Churn
  if (profile.churnRate > 7) {
    const annualLoss = Math.round((1 - Math.pow(1 - profile.churnRate / 100, 12)) * 100);
    out.push({
      tone: "bad", iconName: "TrendingDown",
      title: "Churn is unsustainable",
      body: `${profile.churnRate}% monthly churn implies ~${annualLoss}% annual logo loss. Growth becomes a treadmill at this rate.`,
    });
  } else if (profile.churnRate > 0 && profile.churnRate <= 4) {
    out.push({
      tone: "good", iconName: "TrendingUp",
      title: "Churn is well-controlled",
      body: `${profile.churnRate}% monthly churn is best-in-class for ${profile.productType || "SaaS"}.`,
    });
  }

  // Compliance
  if (profile.complianceSensitivity === "High" && profile.complianceReadiness < 60) {
    out.push({
      tone: "warn", iconName: "ShieldAlert",
      title: "Compliance blocks enterprise",
      body: `${profile.complianceReadiness}% readiness with High sensitivity will block deals above $10K ACV until addressed.`,
    });
  }

  // Roadmap
  if (profile.roadmapComplexity > 65) {
    out.push({
      tone: "warn", iconName: "Map",
      title: "Roadmap is complexity-bound",
      body: `Complexity at ${profile.roadmapComplexity}/100 is a velocity killer. Freeze everything outside the top 3 bets.`,
    });
  }

  // Activation fallback if none added
  if (out.length < 3 && profile.activationRate >= 45 && profile.activationRate < 60) {
    out.push({
      tone: "warn", iconName: "Activity",
      title: "Activation has room to run",
      body: `${profile.activationRate}% is workable but not great. Each pp gained compounds across retention.`,
    });
  }

  return out.slice(0, 5);
}

// ─── Strategic Report ───────────────────────────────────────────────────────

export type ReportData = {
  product: string;
  industry: string;
  stage: string;
  date: string;
  preparedBy: string;
  executiveSummary: string;
  health: {
    score: number;
    band: string;
    strengths: string[];
    weaknesses: string[];
  };
  growthBottleneck: {
    title: string;
    metric: string;
    impact: string;
    rootCause: string;
    leverage: string;
  };
  retentionRisk: {
    title: string;
    metric: string;
    diagnosis: string;
    fix: string;
  };
  roadmapPriority: {
    title: string;
    riceScore: number;
    rationale: string;
    runnerUp: string;
  };
  compliance: {
    enterpriseScore: number;
    band: string;
    blockers: string[];
    recommendation: string;
  };
  thirtyDayPlan: { owner: string; task: string; impact: string }[];
  ninetyDayStrategyPillars: {
    pillar: string;
    desc: string;
    iconName: "Repeat" | "ShieldCheck" | "Rocket" | "Target";
    color: string;
  }[];
  survivalScore: {
    score: number;
    band: string;
    components: { label: string; value: number; weight: string }[];
    interpretation: string;
  };
  finalRecommendation: string;
};

const SHORT_DATE = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" });

function fmtPct(n: number, signed = true): string {
  const sign = signed && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function buildStrategicReport(
  profile: ProductProfile,
  audit: AuditResult | null,
): ReportData {
  const ltvCac = profile.cac > 0 ? profile.ltv / profile.cac : 0;
  const annualChurnLoss = profile.churnRate > 0
    ? Math.round((1 - Math.pow(1 - profile.churnRate / 100, 12)) * 100) : 0;

  const healthScore = calculateHealthScore({
    mrr: profile.mrr, churn: profile.churnRate, activation: profile.activationRate,
    retention30: profile.retentionRate30, ltv: profile.ltv, cac: profile.cac,
  });

  const riskScore = calculateRiskScore(profile);

  // ── Health diagnosis ────────────────────────────────────────────
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (ltvCac >= 4) strengths.push(`LTV/CAC at ${ltvCac.toFixed(1)}x - strong unit economics`);
  if (profile.mrr >= 50_000) strengths.push(`${fmtCurrency(profile.mrr)} MRR - meaningful revenue base`);
  if (profile.activationRate >= 55) strengths.push(`${profile.activationRate}% activation - growth engine is working`);
  if (profile.churnRate <= 4 && profile.churnRate > 0) strengths.push(`${profile.churnRate}% monthly churn - retention is healthy`);
  if (profile.retentionRate30 >= 50) strengths.push(`${profile.retentionRate30}% D30 retention - product stickiness is real`);
  if (strengths.length === 0) strengths.push("Building foundational data discipline - the audit is itself a strength");

  if (profile.activationRate > 0 && profile.activationRate < 50)
    weaknesses.push(`Activation at ${profile.activationRate}% - ${100 - profile.activationRate}% of signups produce no revenue`);
  if (profile.churnRate > 6)
    weaknesses.push(`Churn at ${profile.churnRate}% - compresses LTV and turns growth into a treadmill`);
  if (profile.retentionRate30 > 0 && profile.retentionRate30 < 45)
    weaknesses.push(`D30 retention at ${profile.retentionRate30}% - well below the 45% SaaS benchmark`);
  if (profile.complianceSensitivity === "High" && profile.complianceReadiness < 55)
    weaknesses.push(`Compliance readiness at ${profile.complianceReadiness}% - blocks enterprise sales motion`);
  if (ltvCac > 0 && ltvCac < 3)
    weaknesses.push(`LTV/CAC at ${ltvCac.toFixed(1)}x - below sustainable threshold`);
  if (weaknesses.length === 0) weaknesses.push("No critical weaknesses surfaced - focus shifts from defense to growth");

  // ── Bottleneck identification ──────────────────────────────────
  const bottleneckCandidates = [
    { id: "activation", score: profile.activationRate < 50 ? 100 - profile.activationRate : 0 },
    { id: "churn",      score: profile.churnRate > 5 ? profile.churnRate * 8 : 0 },
    { id: "retention",  score: profile.retentionRate30 < 45 ? 100 - profile.retentionRate30 : 0 },
    { id: "compliance", score: profile.complianceSensitivity === "High" && profile.complianceReadiness < 60 ? 100 - profile.complianceReadiness : 0 },
    { id: "monetization", score: ltvCac > 0 && ltvCac < 3 ? (3 - ltvCac) * 30 : 0 },
  ];
  const winner = bottleneckCandidates.sort((a, b) => b.score - a.score)[0];

  // ── Growth bottleneck section ──────────────────────────────────
  const growthBottleneck = buildGrowthBottleneck(profile, winner.id, ltvCac);

  // ── Retention risk section ─────────────────────────────────────
  const retentionRisk = {
    title: profile.retentionRate30 < 40
      ? "Steep cohort decay in the first 30 days"
      : profile.churnRate > 6
        ? "Monthly churn is compressing LTV"
        : "Retention is reasonable but watch for drift",
    metric: `Day 30 retention ${profile.retentionRate30}% · monthly churn ${profile.churnRate}%`,
    diagnosis: profile.retentionRate30 < 40
      ? `Losing ${100 - profile.retentionRate30}% of new users in the first month means the product is not delivering its core value moment before users disengage. This typically points to a gap between signup and the "aha" experience.`
      : profile.churnRate > 6
        ? `${profile.churnRate}% monthly churn implies ${annualChurnLoss}% annual logo loss. Even strong acquisition can't outrun this leak.`
        : `Retention metrics are within healthy bands. Maintain the engagement loops that produced these numbers.`,
    fix: profile.onboardingSteps > 4
      ? `Reduce onboarding from ${profile.onboardingSteps} to 3 steps, front-load the highest-value action, defer everything else to a Day-2 soft prompt.`
      : `Investigate the day-3 to day-7 drop-off. Add a re-engagement loop tied to the core value moment.`,
  };

  // ── Roadmap priority (use audit opportunity if available) ──────
  const auditTop = audit?.opportunities?.[0];
  const roadmapPriority = {
    title: auditTop?.title || (profile.onboardingSteps > 4 ? `Reduce onboarding from ${profile.onboardingSteps} to 3 steps` : "Improve the activation moment"),
    riceScore: estimateRice(profile, auditTop?.title),
    rationale: auditTop?.description ||
      `Simplifying onboarding improves activation, retention, time-to-value, and CAC payback simultaneously. This single change compounds across the funnel.`,
    runnerUp: audit?.opportunities?.[1]?.title || "Personalized recommendation engine (queue as next priority).",
  };

  // ── Compliance section ─────────────────────────────────────────
  const enterpriseScore = Math.round((profile.complianceReadiness * 0.7) + ((100 - riskScore) * 0.3));
  const compliance = {
    enterpriseScore,
    band: enterpriseScore >= 75 ? "Enterprise Ready" : enterpriseScore >= 55 ? "Partially Ready" : "Not Enterprise Ready",
    blockers: buildComplianceBlockers(profile),
    recommendation: profile.complianceSensitivity === "High" && profile.complianceReadiness < 60
      ? `Before any enterprise sales motion: (1) adopt an automated compliance platform like Vanta or Drata for ${profile.selectedFrameworks.slice(0, 2).join(" + ") || "SOC 2"}, (2) draft DPA templates for ${profile.selectedFrameworks.includes("GDPR") ? "EU and " : ""}US buyers, (3) commission a regulatory gap analysis covering ${profile.selectedFrameworks.slice(0, 3).join(", ") || "your applicable frameworks"}.`
      : `Maintain current compliance posture and refresh it quarterly as the product expands.`,
  };

  // ── 30-day plan ────────────────────────────────────────────────
  const thirtyDayPlan = build30DayPlan(profile, winner.id);

  // ── 90-day strategy ────────────────────────────────────────────
  const ninetyDayStrategyPillars = build90DayPillars(profile, winner.id);

  // ── Survival score ────────────────────────────────────────────
  const survivalScore = buildSurvivalScore(profile, ltvCac, healthScore, riskScore);

  // ── Executive summary (synthesis) ──────────────────────────────
  const executiveSummary = buildExecutiveSummary(profile, healthScore, winner.id, ltvCac);

  // ── Final recommendation ───────────────────────────────────────
  const finalRecommendation = buildFinalRecommendation(profile, winner.id);

  return {
    product: profile.productName,
    industry: profile.industry || "Software · SaaS",
    stage: profile.productType || "Early Growth",
    date: SHORT_DATE,
    preparedBy: "ProductTwin",
    executiveSummary,
    health: {
      score: healthScore,
      band: healthScore >= 75 ? "Strong with focused refinement needed"
           : healthScore >= 55 ? "Healthy with structural risks"
           : healthScore >= 35 ? "Fragile - act on the bottlenecks"
           : "Critical - foundational repair needed",
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
    },
    growthBottleneck,
    retentionRisk,
    roadmapPriority,
    compliance,
    thirtyDayPlan,
    ninetyDayStrategyPillars,
    survivalScore,
    finalRecommendation,
  };
}

// ─── Subbuilders ──────────────────────────────────────────────────────────

function buildGrowthBottleneck(p: ProductProfile, kind: string, ltvCac: number) {
  switch (kind) {
    case "activation":
      return {
        title: "Activation funnel collapse",
        metric: `Only ${p.activationRate}% of new signups reach activation`,
        impact: `${100 - p.activationRate}% of acquisition spend is currently wasted at activation.`,
        rootCause: `Onboarding has ${p.onboardingSteps} steps (industry best practice is 3). Time-to-value is ${p.timeToFirstValue} days. ${p.mainUserFriction || "The core value moment is buried behind setup friction."}`,
        leverage: `Reducing onboarding to 3 steps typically lifts activation 12-18pp, reduces time-to-value below 1 day, and compounds across retention and LTV.`,
      };
    case "churn":
      return {
        title: "Monthly churn compresses LTV",
        metric: `${p.churnRate}% monthly churn`,
        impact: `LTV is constrained to ${fmtCurrency(p.ltv)}; every churn point saved adds disproportionately to revenue.`,
        rootCause: `${p.biggestBusinessChallenge || "Churn rises when activation is weak and the value moment is unclear."} The core ${p.mainUserFriction ? "friction" : "issue"} is upstream of the cancel button.`,
        leverage: `A 30% relative churn reduction (from ${p.churnRate}% to ${(p.churnRate * 0.7).toFixed(1)}%) translates to ~43% higher LTV with no other change.`,
      };
    case "retention":
      return {
        title: "D30 retention sits below benchmark",
        metric: `${p.retentionRate30}% at Day 30 (benchmark: 45%)`,
        impact: `Acquisition is paying for users who churn before payback.`,
        rootCause: `The early-week engagement loop is missing. Users sign up, sample, and disengage before forming a habit.`,
        leverage: `Closing the gap to 45% would raise CAC payback efficiency by an estimated 25-30%.`,
      };
    case "compliance":
      return {
        title: "Compliance gap blocks enterprise expansion",
        metric: `${p.complianceReadiness}/100 readiness with ${p.complianceSensitivity} sensitivity`,
        impact: `Every enterprise deal currently stalls at security review.`,
        rootCause: `${p.selectedFrameworks.length === 0 ? "No frameworks formally tracked." : `Active frameworks (${p.selectedFrameworks.join(", ")}) are not fully evidenced.`} Audit logs, DPA templates, and incident response procedures are typically incomplete.`,
        leverage: `Closing the gap unlocks the enterprise tier of the pricing model (${p.pricingModel.includes("nterprise") ? "as defined" : "if defined"}) and shifts the revenue mix toward higher-ACV deals.`,
      };
    case "monetization":
      return {
        title: "Unit economics are below the sustainable threshold",
        metric: `LTV/CAC at ${ltvCac.toFixed(1)}x (target: ≥3x)`,
        impact: `Each new customer is unprofitable over their lifetime - growth burns capital.`,
        rootCause: `Either CAC is too high (${fmtCurrency(p.cac)}) or LTV is too low (${fmtCurrency(p.ltv)}). Both are structurally upstream of churn and ARPU.`,
        leverage: `Reducing churn raises LTV directly; reducing CAC requires channel reallocation. Activation is typically the fastest path to both.`,
      };
    default:
      return {
        title: "No single dominant bottleneck",
        metric: `Composite picture is balanced`,
        impact: `The product is in optimization mode rather than triage mode.`,
        rootCause: `No dimension is critically off. Focus shifts to compounding what already works.`,
        leverage: `Marginal improvements across activation and retention will continue to lift LTV. Look for the next 10x lever in product-led growth or expansion revenue.`,
      };
  }
}

function buildComplianceBlockers(p: ProductProfile): string[] {
  const blockers: string[] = [];
  if (p.complianceReadiness < 60) blockers.push(`Compliance readiness at ${p.complianceReadiness}/100 - foundational evidence collection missing`);
  if (p.complianceSensitivity === "High" && p.selectedFrameworks.length === 0)
    blockers.push("High regulatory sensitivity with no frameworks formally tracked");
  if (p.complianceSensitivity === "High" && !p.selectedFrameworks.includes("SOC 2"))
    blockers.push("No SOC 2 program - most common US enterprise gate");
  if (p.complianceSensitivity === "High" && p.selectedFrameworks.includes("HIPAA"))
    blockers.push("HIPAA-relevant data requires signed BAAs - currently missing");
  if (p.roadmapComplexity > 70)
    blockers.push(`Roadmap complexity at ${p.roadmapComplexity}/100 amplifies operational risk`);
  if (blockers.length === 0) blockers.push("No critical blockers - compliance posture is on track");
  return blockers.slice(0, 3);
}

function build30DayPlan(p: ProductProfile, kind: string): { owner: string; task: string; impact: string }[] {
  const plan = [];
  if (kind === "activation" || p.onboardingSteps > 4) {
    plan.push({ owner: "Product", task: `Ship ${Math.min(3, p.onboardingSteps - 1)}-step onboarding (down from ${p.onboardingSteps})`, impact: "Activation +12-15pp" });
  }
  if (kind === "churn" || p.churnRate > 6) {
    plan.push({ owner: "Product", task: "Add cancel-flow exit survey + retention offer", impact: `Churn -${(p.churnRate * 0.15).toFixed(1)}pp` });
  }
  if (kind === "compliance" && p.complianceReadiness < 60) {
    plan.push({ owner: "Engineering", task: "Implement audit logs for admin actions and data access events", impact: "Audit Readiness +18 points" });
  }
  plan.push({ owner: "Growth", task: `Pause paid acquisition above ${fmtCurrency(p.cac * 1.1)} CAC until activation > 50%`, impact: "Save acquisition waste" });
  plan.push({ owner: "Engineering", task: "Implement rate limiting + enforce MFA on all routes", impact: "Security risk reduced" });
  if (p.payingUsers > 1000) {
    plan.push({ owner: "GTM", task: `Launch referral mechanic for power users`, impact: "CAC -15% from organic lift" });
  }
  return plan.slice(0, 5);
}

function build90DayPillars(p: ProductProfile, kind: string) {
  const pillars = [];
  pillars.push({
    pillar: kind === "activation" ? "Activation First" : kind === "churn" ? "Retention First" : "Foundation First",
    desc: kind === "activation"
      ? `Get activation from ${p.activationRate}% to 55%. Owner: Product. Measured weekly.`
      : kind === "churn"
        ? `Get monthly churn from ${p.churnRate}% to ${(p.churnRate * 0.75).toFixed(1)}%. Owner: Product. Measured weekly.`
        : `Strengthen the weakest dimension surfaced in the audit. Owner: Product. Measured weekly.`,
    iconName: kind === "activation" || kind === "churn" ? "Repeat" as const : "Target" as const,
    color: "from-emerald-500 to-teal-600",
  });
  if (p.complianceSensitivity === "High" && p.complianceReadiness < 70) {
    pillars.push({
      pillar: "Compliance Foundation",
      desc: `Begin ${p.selectedFrameworks.includes("SOC 2") ? "SOC 2 Type I" : "SOC 2"} evidence collection. Draft DPA templates. Engage counsel on ${p.selectedFrameworks.slice(0, 2).join(" + ") || "applicable frameworks"}.`,
      iconName: "ShieldCheck" as const,
      color: "from-amber-500 to-orange-600",
    });
  }
  pillars.push({
    pillar: "Disciplined Growth",
    desc: `Hold CAC under ${fmtCurrency(p.cac * 1.1)}. Channel mix shifts toward organic. No new geographies until activation > 55%.`,
    iconName: "Rocket" as const,
    color: "from-indigo-500 to-purple-600",
  });
  pillars.push({
    pillar: p.complianceSensitivity === "High" ? "Enterprise Pilot Path" : "Expansion Revenue",
    desc: p.complianceSensitivity === "High"
      ? `Identify 2 design-partner enterprise customers in ${p.industry || "your space"}. Co-build compliance evidence as a side-effect of sales.`
      : `Test pricing tier expansion or usage-based add-ons to lift ARPU beyond ${fmtCurrency(p.arpu)}.`,
    iconName: "Target" as const,
    color: "from-rose-500 to-pink-600",
  });
  return pillars.slice(0, 4);
}

function buildSurvivalScore(
  p: ProductProfile, ltvCac: number, healthScore: number, riskScore: number,
) {
  const unitEcon = Math.round(Math.min(100, ltvCac * 20));
  const growth = Math.round(Math.min(100, p.mrr / 1000));
  const pmf = Math.round((p.activationRate + p.retentionRate30) / 2);
  const retention = Math.round(Math.max(0, 100 - p.churnRate * 8));
  const compliance = p.complianceReadiness;
  const ops = Math.round(Math.max(0, 100 - p.roadmapComplexity * 0.6));

  const score = Math.round(
    unitEcon * 0.25 +
    growth * 0.20 +
    pmf * 0.20 +
    retention * 0.15 +
    compliance * 0.10 +
    ops * 0.10
  );

  return {
    score,
    band: score >= 80 ? "Fundable Series A band"
      : score >= 65 ? "Above the survival threshold"
      : score >= 50 ? "Survival risk - act on bottlenecks"
      : "Critical - operational reset required",
    components: [
      { label: "Unit Economics",         value: unitEcon,   weight: "25%" },
      { label: "Growth Trajectory",      value: growth,     weight: "20%" },
      { label: "Product-Market Fit",     value: pmf,        weight: "20%" },
      { label: "Retention Health",       value: retention,  weight: "15%" },
      { label: "Compliance Readiness",   value: compliance, weight: "10%" },
      { label: "Operational Resilience", value: ops,        weight: "10%" },
    ],
    interpretation: score >= 65
      ? `At ${score}/100, ${p.productName} is above the typical seed-stage survival threshold of 60. The current plan is designed to push the composite into the 80+ "fundable Series A" band.`
      : `At ${score}/100, ${p.productName} sits below the seed-stage survival threshold. The 90-day plan above is designed to lift the weakest dimensions before runway pressure mounts.`,
  };
}

function buildExecutiveSummary(p: ProductProfile, healthScore: number, kind: string, ltvCac: number): string {
  const ltvCacText = ltvCac > 0 ? `LTV/CAC of ${ltvCac.toFixed(1)}x` : "early-stage unit economics";
  const strength = ltvCac >= 4 ? `strong ${ltvCacText}` : `improving ${ltvCacText}`;
  const constraint =
    kind === "activation" ? `weak activation (${p.activationRate}%)`
    : kind === "churn" ? `monthly churn at ${p.churnRate}%`
    : kind === "retention" ? `D30 retention at ${p.retentionRate30}%`
    : kind === "compliance" ? `compliance readiness at ${p.complianceReadiness}/100`
    : kind === "monetization" ? `unit economics below threshold`
    : "scaling discipline";

  const compliancePhrase = p.complianceSensitivity === "High" && p.complianceReadiness < 60
    ? " Compliance and audit readiness are the lowest-scoring dimensions and will block enterprise expansion until addressed."
    : "";

  return `${p.productName} shows ${strength}, but is structurally constrained by ${constraint}.${compliancePhrase} The product is in a critical 90-day window where fixing the bottleneck will compound across retention, LTV, and CAC payback - before any further acquisition spend.`;
}

function buildFinalRecommendation(p: ProductProfile, kind: string): string {
  const focus =
    kind === "activation" ? "prioritizing onboarding simplification before increasing acquisition spend"
    : kind === "churn" ? "reducing churn before scaling acquisition"
    : kind === "retention" ? "rebuilding the early engagement loop before optimizing top-of-funnel"
    : kind === "compliance" ? "closing the compliance gap before targeting enterprise customers"
    : kind === "monetization" ? "rebuilding unit economics before scaling spend"
    : "compounding the activation and retention loops that are already working";

  const enterprise = p.complianceSensitivity === "High" && p.complianceReadiness < 65
    ? " Compliance readiness should be improved in parallel before targeting enterprise customers - not as an afterthought."
    : "";

  return `${p.productName} recommends ${focus}. The current product has monetization potential and an addressable funnel, but the bottleneck identified above is the single limiting factor.${enterprise}`;
}

function estimateRice(p: ProductProfile, title?: string): number {
  // Quick estimate: high-impact moves get 80-120; medium 40-80
  const name = (title || "").toLowerCase();
  if (name.includes("onboarding") || name.includes("activation") || name.includes("aha")) return 108;
  if (name.includes("compliance") || name.includes("audit")) return 72;
  if (name.includes("referral") || name.includes("acquisition")) return 65;
  return 60;
}

// ─── LinkedIn Summary ──────────────────────────────────────────────────────

export function buildLinkedInSummary(profile: ProductProfile, audit: AuditResult | null): string {
  if (!profile.productName) {
    return "Run an analysis in ProductTwin to generate your LinkedIn share text.";
  }
  const ltvCac = profile.cac > 0 ? profile.ltv / profile.cac : 0;
  const report = buildStrategicReport(profile, audit);

  return `🎯 Strategic product diagnosis I ran on ${profile.productName} using ProductTwin:

📊 The numbers:
• MRR: ${fmtCurrency(profile.mrr)}
• LTV/CAC: ${ltvCac > 0 ? ltvCac.toFixed(1) + "x" : "—"}
• Activation: ${profile.activationRate}% · Churn: ${profile.churnRate}%

🔍 The bottleneck:
${report.growthBottleneck.title}. ${report.growthBottleneck.impact}

💡 The recommendation:
${report.finalRecommendation}

🛡️ Compliance & risk:
Enterprise Readiness: ${report.compliance.enterpriseScore}/100 (${report.compliance.band}).

✨ The big lesson:
The best growth lever is rarely "more marketing." It's almost always upstream of acquisition - in activation, retention, or the value moment.

#productmanagement #startups #productstrategy`;
}
