// Product profile, audit, and scenario simulation types + pure functions.
// All calculations live here — no React, no localStorage, no side effects.

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComplianceSensitivity = "Low" | "Medium" | "High";

export type ProductProfile = {
  // Product Context
  productName: string;
  industry: string;
  productType: string;        // e.g., "B2C SaaS", "B2B SaaS", "Marketplace"
  targetCustomer: string;

  // Business Model
  businessModel: string;
  pricingModel: string;

  // Product Metrics (financial)
  mrr: number;
  arr: number;
  payingUsers: number;
  arpu: number;
  cac: number;
  ltv: number;

  // Product Metrics (engagement)
  churnRate: number;            // % monthly
  activationRate: number;       // %
  retentionRate30: number;      // % at day 30
  onboardingSteps: number;
  onboardingCompletion: number; // %
  timeToFirstValue: number;     // days

  // UX Friction
  mainUserFriction: string;
  biggestBusinessChallenge: string;

  // Risk & Compliance
  complianceSensitivity: ComplianceSensitivity;
  complianceReadiness: number;  // 0-100
  roadmapComplexity: number;    // 0-100
  selectedFrameworks: string[]; // ["GDPR", "HIPAA", ...]
};

export type AuditDimension = {
  name: string;
  score: number;          // 0-100
  band: "Strong" | "Moderate" | "Weak";
  insight: string;
};

export type AuditRisk = {
  title: string;
  severity: "Low" | "Medium" | "High";
  implication: string;
};

export type AuditOpportunity = {
  title: string;
  effort: "Low" | "Med" | "High";
  impact: "Low" | "Med" | "High";
  description: string;
};

export type AuditResult = {
  overallScore: number;
  band: string;
  dimensions: AuditDimension[];
  risks: AuditRisk[];
  opportunities: AuditOpportunity[];
  recommendedNextAction: string;
  generatedAt: number; // epoch ms
};

export type ComplianceInvestment = "None" | "Light" | "Moderate" | "Heavy";
export type FeatureComplexity = "Low" | "Medium" | "High";

export type ScenarioInputs = {
  reduceOnboardingTo: number;        // new target step count
  improveActivationBy: number;       // pp delta
  reduceChurnBy: number;             // % relative reduction
  increasePricingBy: number;         // % delta
  increaseMarketingBudgetBy: number; // % delta
  complianceInvestment: ComplianceInvestment;
  featureComplexity: FeatureComplexity;
};

export type BaselineMetrics = {
  mrr: number;
  churn: number;
  activation: number;
  retention30: number;
  ltv: number;
  cac: number;
  healthScore: number;
  riskScore: number;
};

export type ScenarioDelta = {
  key: keyof BaselineMetrics;
  label: string;
  before: number;
  after: number;
  delta: number;
  pct: number;          // percent change
  goodIfUp: boolean;    // true for MRR, LTV, activation, retention, healthScore
  format: "currency" | "percent" | "score" | "number";
};

export type ScenarioResults = {
  before: BaselineMetrics;
  after: BaselineMetrics;
  deltas: ScenarioDelta[];
  financialImpact: string;
  growthImpact: string;
  riskImpact: string;
  recommendation: string;
};

// ─── Default / Demo data ──────────────────────────────────────────────────────

export const EMPTY_PROFILE: ProductProfile = {
  productName: "",
  industry: "",
  productType: "",
  targetCustomer: "",
  businessModel: "",
  pricingModel: "",
  mrr: 0,
  arr: 0,
  payingUsers: 0,
  arpu: 0,
  cac: 0,
  ltv: 0,
  churnRate: 0,
  activationRate: 0,
  retentionRate30: 0,
  onboardingSteps: 0,
  onboardingCompletion: 0,
  timeToFirstValue: 0,
  mainUserFriction: "",
  biggestBusinessChallenge: "",
  complianceSensitivity: "Medium",
  complianceReadiness: 50,
  roadmapComplexity: 50,
  selectedFrameworks: [],
};

export const NUTRIFLOW_PROFILE: ProductProfile = {
  productName: "NutriFlow",
  industry: "Digital Health / Nutrition SaaS",
  productType: "B2C SaaS",
  targetCustomer: "Busy professionals aged 25-45 trying to improve metabolic health",
  businessModel: "Freemium + subscription + enterprise pilots",
  pricingModel: "Free plan, Pro $19/month, Premium AI $49/month, Enterprise custom pricing",
  mrr: 62000,
  arr: 744000,
  payingUsers: 2470,
  arpu: 25.1,
  cac: 48,
  ltv: 310,
  churnRate: 8.5,
  activationRate: 36,
  retentionRate30: 43,
  onboardingSteps: 7,
  onboardingCompletion: 41,
  timeToFirstValue: 3.8,
  mainUserFriction: "Users feel overwhelmed during onboarding and fail to experience value quickly enough.",
  biggestBusinessChallenge: "Strong acquisition but weak activation and retention.",
  complianceSensitivity: "High",
  complianceReadiness: 42,
  roadmapComplexity: 74,
  selectedFrameworks: ["GDPR", "HIPAA", "SOC 2", "EU AI Act"],
};

export function defaultScenarioInputs(profile: ProductProfile): ScenarioInputs {
  return {
    reduceOnboardingTo: profile.onboardingSteps || 3,
    improveActivationBy: 0,
    reduceChurnBy: 0,
    increasePricingBy: 0,
    increaseMarketingBudgetBy: 0,
    complianceInvestment: "None",
    featureComplexity: "Medium",
  };
}

// ─── Small helpers ────────────────────────────────────────────────────────────

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const safeDiv = (a: number, b: number, fallback = 0) =>
  b === 0 ? fallback : a / b;

const round = (n: number, dp = 0) =>
  Math.round(n * 10 ** dp) / 10 ** dp;

// ─── Profile completeness ─────────────────────────────────────────────────────

const REQUIRED_TEXT_FIELDS: (keyof ProductProfile)[] = [
  "productName", "industry", "productType", "targetCustomer",
  "businessModel", "pricingModel",
  "mainUserFriction", "biggestBusinessChallenge",
];

const REQUIRED_NUMBER_FIELDS: (keyof ProductProfile)[] = [
  "mrr", "payingUsers", "cac", "ltv",
  "churnRate", "activationRate", "retentionRate30",
  "onboardingSteps", "onboardingCompletion",
];

export function profileCompleteness(p: ProductProfile): number {
  const total = REQUIRED_TEXT_FIELDS.length + REQUIRED_NUMBER_FIELDS.length;
  let filled = 0;
  REQUIRED_TEXT_FIELDS.forEach((k) => {
    if (typeof p[k] === "string" && (p[k] as string).trim().length > 1) filled++;
  });
  REQUIRED_NUMBER_FIELDS.forEach((k) => {
    if (typeof p[k] === "number" && (p[k] as number) > 0) filled++;
  });
  return Math.round((filled / total) * 100);
}

// ─── Core score calculations ──────────────────────────────────────────────────

/**
 * Health score is a weighted blend of monetization, activation, retention,
 * and execution signals. All inputs are normalized to a 0-100 scale.
 */
export function calculateHealthScore(p: {
  mrr: number; churn: number; activation: number;
  retention30: number; ltv: number; cac: number;
}): number {
  const ltvCacRatio = safeDiv(p.ltv, p.cac, 0);
  const monetization = clamp(0, 100, ltvCacRatio * 20);          // 5x = 100
  const activation   = clamp(0, 100, p.activation * 1.6);        // 62% = 100
  const retention    = clamp(0, 100, p.retention30 * 1.4);       // 71% = 100
  const churnHealth  = clamp(0, 100, 100 - p.churn * 8);         // 5% churn = 60
  const score =
    monetization * 0.30 +
    activation   * 0.25 +
    retention    * 0.25 +
    churnHealth  * 0.20;
  return Math.round(score);
}

/**
 * Risk score: higher = more risk. Combines compliance gap, roadmap
 * complexity, and sensitivity of regulatory exposure.
 */
export function calculateRiskScore(p: ProductProfile): number {
  const complianceGap = 100 - p.complianceReadiness;
  const sensitivityWeight = p.complianceSensitivity === "High" ? 1.3
    : p.complianceSensitivity === "Medium" ? 1.0 : 0.7;
  const frameworkPressure = clamp(0, 30, p.selectedFrameworks.length * 5);
  const raw =
    complianceGap * 0.55 +
    p.roadmapComplexity * 0.25 +
    frameworkPressure * 0.20;
  return Math.round(clamp(0, 100, raw * sensitivityWeight));
}

function baselineFromProfile(p: ProductProfile): BaselineMetrics {
  return {
    mrr: p.mrr,
    churn: p.churnRate,
    activation: p.activationRate,
    retention30: p.retentionRate30,
    ltv: p.ltv,
    cac: p.cac,
    healthScore: calculateHealthScore({
      mrr: p.mrr, churn: p.churnRate, activation: p.activationRate,
      retention30: p.retentionRate30, ltv: p.ltv, cac: p.cac,
    }),
    riskScore: calculateRiskScore(p),
  };
}

// ─── Scenario simulation ──────────────────────────────────────────────────────

const COMPLIANCE_BOOST: Record<ComplianceInvestment, number> = {
  None: 0, Light: 8, Moderate: 18, Heavy: 30,
};

const COMPLIANCE_CHURN_DRAG: Record<ComplianceInvestment, number> = {
  None: 0, Light: 0.1, Moderate: 0.25, Heavy: 0.5,
};

const COMPLEXITY_PENALTY: Record<FeatureComplexity, number> = {
  Low: 0, Medium: 0.4, High: 0.9,
};

export function runScenario(p: ProductProfile, inputs: ScenarioInputs): ScenarioResults {
  const before = baselineFromProfile(p);

  // ── Activation ─────────────────────────────────────────────
  // Each onboarding step removed adds ~4pp activation (capped).
  const stepsReduction = Math.max(0, p.onboardingSteps - inputs.reduceOnboardingTo);
  const activationFromSteps = stepsReduction * 4;
  const newActivation = clamp(
    0, 95,
    p.activationRate + activationFromSteps + inputs.improveActivationBy
  );

  // ── Churn ──────────────────────────────────────────────────
  // Activation has a halo effect on churn (each pp lifts ~0.15pp).
  // Pricing hikes add a small churn penalty.
  // Feature complexity adds drag. Compliance investment adds short-term drag.
  const activationHalo = (newActivation - p.activationRate) * 0.15;
  const pricingChurnPenalty = inputs.increasePricingBy * 0.04;
  const complexityChurn = COMPLEXITY_PENALTY[inputs.featureComplexity] * 0.6;
  const complianceChurn = COMPLIANCE_CHURN_DRAG[inputs.complianceInvestment];
  const newChurn = clamp(
    1.0, 30,
    p.churnRate * (1 - inputs.reduceChurnBy / 100)
      - activationHalo
      + pricingChurnPenalty
      + complexityChurn
      + complianceChurn
  );

  // ── Retention (30-day) ─────────────────────────────────────
  const retentionHalo = (newActivation - p.activationRate) * 0.35;
  const newRetention = clamp(
    0, 95,
    p.retentionRate30 + retentionHalo - pricingChurnPenalty * 0.5
  );

  // ── ARPU / LTV ─────────────────────────────────────────────
  const newArpu = p.arpu * (1 + inputs.increasePricingBy / 100);
  const newLtv = newChurn > 0 ? newArpu / (newChurn / 100) : p.ltv;

  // ── Marketing & paying users ───────────────────────────────
  // Marketing scales acquisition. Activation lift compounds the user base.
  const marketingLift = inputs.increaseMarketingBudgetBy / 100;
  const activationRatio = p.activationRate > 0 ? newActivation / p.activationRate : 1;
  const newPayingUsers = Math.round(p.payingUsers * (1 + marketingLift * 0.5) * activationRatio);

  // ── MRR ────────────────────────────────────────────────────
  const newMrr = newPayingUsers * newArpu;

  // ── CAC ────────────────────────────────────────────────────
  // Marketing increases CAC sublinearly (diminishing returns).
  const newCac = p.cac * (1 + marketingLift * 0.7);

  // ── Health & Risk scores ───────────────────────────────────
  const newHealthScore = calculateHealthScore({
    mrr: newMrr, churn: newChurn, activation: newActivation,
    retention30: newRetention, ltv: newLtv, cac: newCac,
  });

  const newComplianceReadiness = clamp(
    0, 100,
    p.complianceReadiness + COMPLIANCE_BOOST[inputs.complianceInvestment]
  );
  const adjustedProfileForRisk: ProductProfile = {
    ...p,
    complianceReadiness: newComplianceReadiness,
    roadmapComplexity: clamp(
      0, 100,
      p.roadmapComplexity + COMPLEXITY_PENALTY[inputs.featureComplexity] * 10
    ),
  };
  const newRisk = calculateRiskScore(adjustedProfileForRisk);

  const after: BaselineMetrics = {
    mrr: Math.round(newMrr),
    churn: round(newChurn, 1),
    activation: round(newActivation, 1),
    retention30: round(newRetention, 1),
    ltv: Math.round(newLtv),
    cac: Math.round(newCac),
    healthScore: newHealthScore,
    riskScore: newRisk,
  };

  // ── Deltas ─────────────────────────────────────────────────
  const buildDelta = (
    key: keyof BaselineMetrics,
    label: string,
    goodIfUp: boolean,
    format: "currency" | "percent" | "score" | "number",
  ): ScenarioDelta => {
    const b = before[key];
    const a = after[key];
    const delta = a - b;
    const pct = b === 0 ? 0 : (delta / b) * 100;
    return { key, label, before: b, after: a, delta, pct, goodIfUp, format };
  };

  const deltas: ScenarioDelta[] = [
    buildDelta("mrr",          "MRR",              true,  "currency"),
    buildDelta("churn",        "Monthly Churn",    false, "percent"),
    buildDelta("activation",   "Activation",       true,  "percent"),
    buildDelta("retention30",  "30-Day Retention", true,  "percent"),
    buildDelta("ltv",          "LTV",              true,  "currency"),
    buildDelta("cac",          "CAC",              false, "currency"),
    buildDelta("healthScore",  "Health Score",     true,  "score"),
    buildDelta("riskScore",    "Risk Score",       false, "score"),
  ];

  // ── Narrative summaries ────────────────────────────────────
  const mrrDelta = after.mrr - before.mrr;
  const financialImpact = mrrDelta >= 0
    ? `MRR projects from $${Math.round(before.mrr).toLocaleString()} to $${Math.round(after.mrr).toLocaleString()} (${pctFmt(mrrDelta, before.mrr)}). LTV moves from $${before.ltv} to $${after.ltv}.`
    : `MRR drops from $${Math.round(before.mrr).toLocaleString()} to $${Math.round(after.mrr).toLocaleString()} (${pctFmt(mrrDelta, before.mrr)}). Reassess the lever mix.`;

  const activationDelta = after.activation - before.activation;
  const growthImpact = activationDelta >= 1
    ? `Activation lifts ${activationDelta.toFixed(1)}pp to ${after.activation.toFixed(1)}%, with retention reaching ${after.retention30.toFixed(1)}%. This is the dominant growth driver.`
    : activationDelta <= -1
      ? `Activation falls ${Math.abs(activationDelta).toFixed(1)}pp. Growth becomes harder to sustain at these levels.`
      : `Activation stays roughly flat. Growth depends primarily on pricing and acquisition.`;

  const riskDelta = after.riskScore - before.riskScore;
  const riskImpact = riskDelta <= -3
    ? `Risk score improves ${Math.abs(riskDelta)} points to ${after.riskScore}/100. Compliance investment is paying off.`
    : riskDelta >= 3
      ? `Risk score climbs ${riskDelta} points to ${after.riskScore}/100. Feature complexity or weak compliance posture is amplifying exposure.`
      : `Risk score holds near ${after.riskScore}/100. No major change.`;

  const recommendation = generateRecommendation(p, inputs, before, after);

  return { before, after, deltas, financialImpact, growthImpact, riskImpact, recommendation };
}

function pctFmt(delta: number, base: number): string {
  if (base === 0) return "+0%";
  const pct = (delta / base) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function generateRecommendation(
  p: ProductProfile,
  inputs: ScenarioInputs,
  before: BaselineMetrics,
  after: BaselineMetrics,
): string {
  // Diagnose the biggest bottleneck from the baseline
  const activationGap = 60 - p.activationRate;
  const churnExcess = p.churnRate - 5;
  const complianceGap = 100 - p.complianceReadiness;

  // Find the strongest applied lever in the inputs
  const leverApplied = inputs.reduceOnboardingTo < p.onboardingSteps ||
                       inputs.improveActivationBy > 0 ||
                       inputs.reduceChurnBy > 0 ||
                       inputs.increasePricingBy > 0 ||
                       inputs.increaseMarketingBudgetBy > 0 ||
                       inputs.complianceInvestment !== "None";

  if (!leverApplied) {
    return "Adjust a decision lever to see the impact. Based on your baseline, simplifying onboarding has the highest leverage because activation is currently the biggest bottleneck.";
  }

  // Build a contextual sentence
  if (activationGap > 15 && inputs.reduceOnboardingTo < p.onboardingSteps) {
    return `Based on your baseline data, simplifying onboarding has a stronger impact than increasing acquisition spend because activation is currently the biggest bottleneck. Each step removed lifts activation by ~4pp and compounds through retention into LTV.`;
  }
  if (churnExcess > 3 && inputs.reduceChurnBy > 10) {
    return `Reducing churn is the right lever for your stage. With activation at ${p.activationRate}%, every churn point saved adds disproportionately to LTV. Pair this with onboarding simplification for compounding effect.`;
  }
  if (inputs.increasePricingBy > 10 && p.churnRate > 6) {
    return `Caution: pricing increases compound your churn problem. At ${p.churnRate}% baseline churn, a pricing hike of ${inputs.increasePricingBy}% risks net-negative MRR after activation falls. Fix activation first, then experiment with pricing.`;
  }
  if (complianceGap > 40 && inputs.complianceInvestment === "Heavy") {
    return `Heavy compliance investment is justified given your readiness gap of ${complianceGap} points. Expect short-term churn drag but long-term enterprise deal-unlock value.`;
  }
  if (inputs.increaseMarketingBudgetBy > 30 && p.activationRate < 50) {
    return `Increasing acquisition spend with activation at ${p.activationRate}% is inefficient — roughly ${(100 - p.activationRate)}% of new users will not convert. Fix activation first to make acquisition pay back.`;
  }

  // Default: report the dominant delta
  const healthDelta = after.healthScore - before.healthScore;
  return healthDelta >= 5
    ? `Your scenario lifts the composite health score by ${healthDelta} points to ${after.healthScore}/100. This is a credible direction — make sure execution capacity matches the implied roadmap.`
    : `The combined effect on the composite health score is modest (${healthDelta >= 0 ? "+" : ""}${healthDelta} points). Try a stronger lever — activation or churn typically dominates at this stage.`;
}

// ─── Audit generation ─────────────────────────────────────────────────────────

export function generateAudit(p: ProductProfile): AuditResult {
  const clarity = scoreClarity(p);
  const monetization = scoreMonetization(p);
  const friction = scoreFriction(p);
  const positioning = scorePositioning(p);
  const compliance = scoreCompliance(p);

  const dimensions: AuditDimension[] = [
    { name: "Clarity",       score: clarity,      band: bandOf(clarity),      insight: insightClarity(p, clarity) },
    { name: "Monetization",  score: monetization, band: bandOf(monetization), insight: insightMonetization(p, monetization) },
    { name: "Friction",      score: friction,     band: bandOf(friction),     insight: insightFriction(p, friction) },
    { name: "Positioning",   score: positioning,  band: bandOf(positioning),  insight: insightPositioning(p, positioning) },
    { name: "Compliance",    score: compliance,   band: bandOf(compliance),   insight: insightCompliance(p, compliance) },
  ];

  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );

  const band = overallScore >= 75 ? "Strong" : overallScore >= 50 ? "Promising" : overallScore >= 30 ? "Fragile" : "Critical";

  const risks: AuditRisk[] = [];
  if (p.onboardingSteps > 5) {
    risks.push({
      title: "Onboarding friction",
      severity: "High",
      implication: `${p.onboardingSteps}-step onboarding is well above best practice (3 steps). Activation will stay capped until this is addressed.`,
    });
  }
  if (p.churnRate > 7) {
    risks.push({
      title: "Churn is unsustainable",
      severity: "High",
      implication: `Monthly churn at ${p.churnRate}% means ~${Math.round((1 - Math.pow(1 - p.churnRate/100, 12)) * 100)}% annual logo loss. Growth becomes a treadmill.`,
    });
  }
  if (p.complianceSensitivity === "High" && p.complianceReadiness < 60) {
    risks.push({
      title: "Enterprise blocker",
      severity: "High",
      implication: `High compliance sensitivity with only ${p.complianceReadiness}/100 readiness will block any enterprise sales motion above $10K ACV.`,
    });
  }
  if (p.activationRate < 40) {
    risks.push({
      title: "Activation funnel collapse",
      severity: "High",
      implication: `Only ${p.activationRate}% of signups activate. Most of your acquisition spend is wasted at this rate.`,
    });
  }
  if (!p.pricingModel || p.pricingModel.trim().length < 4) {
    risks.push({
      title: "Monetization gap",
      severity: "Medium",
      implication: "Pricing model is undefined. Without a clear monetization strategy, revenue projections are speculative.",
    });
  }
  if (!p.mainUserFriction || p.mainUserFriction.trim().length < 8) {
    risks.push({
      title: "Unknown user friction",
      severity: "Medium",
      implication: "Main user friction is not articulated. Without this, prioritization decisions lack grounding.",
    });
  }

  const opportunities: AuditOpportunity[] = [];
  if (p.onboardingSteps > 5) {
    opportunities.push({
      title: `Reduce onboarding from ${p.onboardingSteps} to 3 steps`,
      effort: "Low",
      impact: "High",
      description: "Highest-leverage move. Each step removed typically adds 3-5pp activation, which compounds across retention and LTV.",
    });
  }
  if (p.activationRate < 50) {
    opportunities.push({
      title: "Front-load the aha moment",
      effort: "Med",
      impact: "High",
      description: "Move the product's highest-value feature to the first session. Defer everything else to a soft prompt later.",
    });
  }
  if (p.complianceReadiness < 60 && p.complianceSensitivity !== "Low") {
    opportunities.push({
      title: "Adopt an automated compliance platform",
      effort: "Med",
      impact: "High",
      description: "Vanta, Drata, or Secureframe accelerate SOC 2 / HIPAA evidence collection. Unlocks enterprise pipeline.",
    });
  }
  if (p.cac > 0 && p.ltv > 0 && p.ltv / p.cac < 3) {
    opportunities.push({
      title: "Improve LTV/CAC ratio",
      effort: "High",
      impact: "High",
      description: `Current LTV/CAC is ${(p.ltv / p.cac).toFixed(1)}x. Healthy SaaS targets ≥3x. Reduce churn or expand ARPU before scaling spend.`,
    });
  }
  if (opportunities.length < 3) {
    opportunities.push({
      title: "Define a clear North Star metric",
      effort: "Low",
      impact: "Med",
      description: "A single metric the team optimizes for accelerates decision-making and aligns roadmap priorities.",
    });
  }

  const recommendedNextAction = buildRecommendedAction(p, dimensions);

  return {
    overallScore,
    band,
    dimensions,
    risks: risks.slice(0, 4),
    opportunities: opportunities.slice(0, 4),
    recommendedNextAction,
    generatedAt: Date.now(),
  };
}

function bandOf(score: number): "Strong" | "Moderate" | "Weak" {
  return score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";
}

function scoreClarity(p: ProductProfile): number {
  let score = 30;
  if (p.productName.trim().length > 2) score += 15;
  if (p.industry.trim().length > 3) score += 10;
  if (p.targetCustomer.trim().length > 10) score += 20;
  if (p.biggestBusinessChallenge.trim().length > 10) score += 15;
  if (p.productType.trim().length > 3) score += 10;
  return clamp(0, 100, score);
}

function scoreMonetization(p: ProductProfile): number {
  if (p.cac === 0 || p.ltv === 0) return 30;
  const ratio = p.ltv / p.cac;
  const ratioScore = clamp(0, 60, ratio * 12);
  const mrrScore = p.mrr > 0 ? 20 : 0;
  const pricingClarity = p.pricingModel.length > 8 ? 20 : 0;
  return Math.round(clamp(0, 100, ratioScore + mrrScore + pricingClarity));
}

function scoreFriction(p: ProductProfile): number {
  const stepsPenalty = Math.max(0, p.onboardingSteps - 3) * 8;
  const completionScore = p.onboardingCompletion * 0.6;
  const ttvPenalty = Math.max(0, p.timeToFirstValue - 1) * 6;
  return Math.round(clamp(0, 100, 80 - stepsPenalty - ttvPenalty + (completionScore - 24)));
}

function scorePositioning(p: ProductProfile): number {
  let score = 30;
  if (p.targetCustomer.trim().length > 20) score += 25;
  if (p.industry.trim().length > 5) score += 15;
  if (p.businessModel.trim().length > 8) score += 15;
  if (p.pricingModel.trim().length > 15) score += 15;
  return clamp(0, 100, score);
}

function scoreCompliance(p: ProductProfile): number {
  const sensitivityFactor = p.complianceSensitivity === "Low" ? 1.1
    : p.complianceSensitivity === "Medium" ? 1.0 : 0.85;
  const readiness = p.complianceReadiness * sensitivityFactor;
  const frameworkBonus = Math.min(15, p.selectedFrameworks.length * 3);
  return Math.round(clamp(0, 100, readiness + frameworkBonus));
}

function insightClarity(p: ProductProfile, s: number): string {
  if (s >= 70) return "Product positioning and target customer are clearly articulated. The team can communicate the value prop succinctly.";
  if (s >= 40) return "Positioning is partially defined. Sharpening the target customer description would strengthen GTM execution.";
  return "Positioning is too vague. Without a clear target customer and challenge, downstream decisions lack grounding.";
}
function insightMonetization(p: ProductProfile, s: number): string {
  const ratio = p.cac > 0 ? (p.ltv / p.cac).toFixed(1) : "—";
  if (s >= 70) return `Unit economics are strong: LTV/CAC of ${ratio}x. Pricing model is clearly defined.`;
  if (s >= 40) return `Unit economics are workable but unoptimized. LTV/CAC of ${ratio}x leaves room for improvement.`;
  return `Monetization needs attention. LTV/CAC ratio is too low (${ratio}x) for sustainable growth.`;
}
function insightFriction(p: ProductProfile, s: number): string {
  if (s >= 70) return "Onboarding friction is low. Users reach value quickly and complete the funnel.";
  if (s >= 40) return `Onboarding is workable but has friction: ${p.onboardingSteps} steps, ${p.onboardingCompletion}% completion. Simplification would unlock activation.`;
  return `Onboarding friction is high. ${p.onboardingSteps} steps with only ${p.onboardingCompletion}% completion is bleeding users at the funnel top.`;
}
function insightPositioning(p: ProductProfile, s: number): string {
  if (s >= 70) return "Product is well-positioned with clear ICP, business model, and pricing.";
  if (s >= 40) return "Positioning is partially clear. Tighter ICP definition would improve sales velocity.";
  return "Positioning lacks clarity. Sharpen ICP, business model, and pricing before scaling.";
}
function insightCompliance(p: ProductProfile, s: number): string {
  if (s >= 70) return `Compliance posture matches sensitivity level (${p.complianceSensitivity}). Enterprise-ready.`;
  if (s >= 40) return `Compliance is partial. With ${p.complianceSensitivity} sensitivity, ${p.selectedFrameworks.length} frameworks active, gaps will surface in enterprise security reviews.`;
  return `Compliance is the most urgent gap. ${p.complianceSensitivity} sensitivity with ${p.complianceReadiness}/100 readiness blocks any enterprise motion.`;
}

function buildRecommendedAction(p: ProductProfile, dims: AuditDimension[]): string {
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0];
  const mapping: Record<string, string> = {
    Clarity: "Sharpen the product positioning and target customer definition before any further GTM investment.",
    Monetization: "Improve unit economics (LTV/CAC) before scaling acquisition spend. Focus on reducing churn or increasing ARPU.",
    Friction: `Reduce onboarding from ${p.onboardingSteps} to 3 steps. This is the single highest-leverage move and unlocks activation, retention, and LTV simultaneously.`,
    Positioning: "Tighten ICP, business model, and pricing model. Each undefined element compounds downstream uncertainty.",
    Compliance: "Adopt an automated compliance platform (Vanta/Drata) and draft DPA templates before pursuing enterprise deals.",
  };
  return mapping[weakest.name] || "Focus on your weakest dimension first; the others compound from there.";
}
