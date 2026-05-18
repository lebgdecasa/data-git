import type {
  ProductAssumptions,
  Recommendation,
  RiskScore,
  SimulationResult,
} from "./types";
import { clamp } from "./utils";

const HORIZON_MONTHS = 36;

export function simulate(a: ProductAssumptions): SimulationResult {
  const churn = a.monthlyChurn / 100;
  const conv = a.conversionRate / 100;
  const activation = a.activationRate / 100;
  const monthlyNewLeads = a.monthlyTraffic * conv;
  const monthlyNewActive = monthlyNewLeads * activation;

  const months: number[] = [];
  const users: number[] = [];
  const mrr: number[] = [];
  const cumulativeRevenue: number[] = [];
  const burn: number[] = [];

  let activeUsers = 0;
  let cumRev = 0;
  let breakEvenMonth: number | null = null;

  // light, deterministic growth ramp so visuals look credible
  for (let m = 1; m <= HORIZON_MONTHS; m++) {
    const rampFactor = 0.55 + Math.min(0.45, m * 0.02);
    const acquired = monthlyNewActive * rampFactor;
    activeUsers = activeUsers * (1 - churn) + acquired;
    const revenue = activeUsers * a.pricePerMonth;
    const variableCost = activeUsers * a.variableCostPerUser;
    const totalCost = a.fixedCosts + variableCost;
    const profit = revenue - totalCost;
    cumRev += revenue;

    months.push(m);
    users.push(Math.round(activeUsers));
    mrr.push(Math.round(revenue));
    cumulativeRevenue.push(Math.round(cumRev));
    burn.push(Math.round(totalCost - revenue));
    if (breakEvenMonth === null && profit >= 0) breakEvenMonth = m;
  }

  const arpu = a.pricePerMonth;
  const grossMargin = clamp(
    1 - a.variableCostPerUser / Math.max(a.pricePerMonth, 1),
    0,
    1,
  );
  const ltv = arpu * grossMargin * (1 / Math.max(churn, 0.005));
  const ltvCacRatio = ltv / Math.max(a.cac, 1);
  const paybackMonths = a.cac / Math.max(arpu * grossMargin, 1);

  const monthlyGrowthRate =
    mrr.length > 1 ? (mrr[mrr.length - 1] / Math.max(mrr[0], 1)) ** (1 / (mrr.length - 1)) - 1 : 0;

  const projectedArrYear1 = (mrr[11] ?? mrr[mrr.length - 1]) * 12;
  const projectedArrYear3 = (mrr[35] ?? mrr[mrr.length - 1]) * 12;

  return {
    months,
    users,
    mrr,
    cumulativeRevenue,
    burn,
    ltv: Math.round(ltv),
    ltvCacRatio: Number(ltvCacRatio.toFixed(2)),
    paybackMonths: Number(paybackMonths.toFixed(1)),
    grossMargin: Number((grossMargin * 100).toFixed(1)),
    monthlyGrowthRate: Number((monthlyGrowthRate * 100).toFixed(1)),
    breakEvenMonth,
    projectedArrYear1: Math.round(projectedArrYear1),
    projectedArrYear3: Math.round(projectedArrYear3),
  };
}

export function riskScore(a: ProductAssumptions, sim: SimulationResult): RiskScore {
  // each subscore is 0-100 where higher = healthier
  const financial = clamp(
    50 +
      (sim.ltvCacRatio - 3) * 12 -
      (sim.paybackMonths - 12) * 1.5 +
      (sim.breakEvenMonth ? (24 - sim.breakEvenMonth) * 1.5 : -15),
    0,
    100,
  );
  const market = clamp(
    30 + Math.log10(Math.max(a.marketSize, 1)) * 18 + (a.conversionRate - 2) * 4,
    0,
    100,
  );
  const execution = clamp(
    80 - a.roadmapComplexity * 0.5 - (a.teamSize < 5 ? 15 : 0) - (a.onboardingFriction - 30) * 0.3,
    0,
    100,
  );
  const compliance = clamp(100 - a.complianceRisk, 0, 100);
  const product = clamp(
    (a.activationRate + a.retention30) / 2 +
      (a.onboardingFriction < 35 ? 8 : -5) +
      (a.monthlyChurn < 4 ? 6 : -6),
    0,
    100,
  );

  const overall = Math.round(
    financial * 0.28 +
      market * 0.18 +
      execution * 0.18 +
      compliance * 0.14 +
      product * 0.22,
  );

  let band: RiskScore["band"] = "moderate";
  if (overall >= 80) band = "strong";
  else if (overall >= 65) band = "healthy";
  else if (overall >= 50) band = "moderate";
  else if (overall >= 35) band = "high";
  else band = "critical";

  return {
    overall,
    financial: Math.round(financial),
    market: Math.round(market),
    execution: Math.round(execution),
    compliance: Math.round(compliance),
    product: Math.round(product),
    band,
  };
}

export function generateRecommendations(
  a: ProductAssumptions,
  sim: SimulationResult,
  risk: RiskScore,
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (sim.ltvCacRatio < 3) {
    recs.push({
      id: "ltv-cac",
      title: "Rebalance LTV : CAC before scaling paid acquisition",
      category: "growth",
      priority: "high",
      impact: 92,
      effort: 55,
      rationale: `Your LTV:CAC of ${sim.ltvCacRatio} is below the 3.0 SaaS benchmark. Scaling spend now compounds losses rather than growth.`,
      actions: [
        "Pause non-attributable paid channels for 30 days and rebuild attribution.",
        "Test a 15-20% price increase on new logos with anchored value framing.",
        "Refocus marketing on the 2 highest-converting personas only.",
      ],
    });
  }

  if (a.monthlyChurn > 4) {
    recs.push({
      id: "churn",
      title: "Attack churn before adding top-of-funnel volume",
      category: "retention",
      priority: "high",
      impact: 88,
      effort: 50,
      rationale: `Monthly churn of ${a.monthlyChurn}% caps your steady-state user count and erodes payback. Every point of churn is worth ~$${Math.round(sim.mrr[11] * 0.12 || 1000)} in year-1 MRR.`,
      actions: [
        "Run win/loss interviews on the last 20 churned accounts.",
        "Ship a save-flow with downgrade tier and pause option.",
        "Add a 14-day at-risk health score and assign CSM outreach.",
      ],
    });
  }

  if (a.activationRate < 60) {
    recs.push({
      id: "activation",
      title: "Compress time-to-value in the first session",
      category: "product",
      priority: "high",
      impact: 84,
      effort: 45,
      rationale: `Activation at ${a.activationRate}% means more than half of trials never see core value. A 10pt lift translates roughly to ${Math.round(sim.mrr[5] * 0.1).toLocaleString()} MRR by month 6.`,
      actions: [
        "Define an 'aha' event and instrument it as the primary north-star.",
        "Replace empty states with prefilled sample workspaces.",
        "Add a 3-step onboarding checklist with a single primary action per step.",
      ],
    });
  }

  if (a.onboardingFriction > 50) {
    recs.push({
      id: "friction",
      title: "Remove onboarding friction blocking PLG motion",
      category: "product",
      priority: "medium",
      impact: 72,
      effort: 35,
      rationale: `An onboarding friction score of ${a.onboardingFriction} is the silent killer of word-of-mouth. PLG companies typically operate below 30.`,
      actions: [
        "Replace credit-card-up-front with a 14-day no-CC trial.",
        "Cut required signup fields by 50%.",
        "Auto-provision a starter project on first login.",
      ],
    });
  }

  if (a.complianceRisk > 40) {
    recs.push({
      id: "compliance",
      title: "Pull compliance forward to unlock enterprise deals",
      category: "risk",
      priority: "medium",
      impact: 70,
      effort: 80,
      rationale: `Compliance risk at ${a.complianceRisk}/100 will block 60-70% of enterprise procurement. The cost of waiting is one full enterprise sales cycle.`,
      actions: [
        "Start a SOC 2 Type I engagement this quarter.",
        "Publish a public trust center with subprocessor and DPA links.",
        "Add SSO + audit logs to the highest paid tier.",
      ],
    });
  }

  if (sim.paybackMonths > 18) {
    recs.push({
      id: "payback",
      title: "Shorten payback period with annual prepay incentives",
      category: "monetization",
      priority: "medium",
      impact: 68,
      effort: 25,
      rationale: `Payback of ${sim.paybackMonths} months ties up cash and exposes you to churn before recovery. Healthy SaaS sits at 12-15 months.`,
      actions: [
        "Offer 2 months free on annual prepay to shift mix toward 12-mo terms.",
        "Add a usage-based add-on to lift ARPU on existing accounts.",
        "Bundle implementation into a paid onboarding SKU.",
      ],
    });
  }

  if (a.roadmapComplexity > 65) {
    recs.push({
      id: "roadmap",
      title: "Cut roadmap surface area by 30% this quarter",
      category: "team",
      priority: "medium",
      impact: 64,
      effort: 30,
      rationale: `A roadmap complexity score of ${a.roadmapComplexity} signals scope sprawl. Each in-flight initiative beyond 5 reduces shipping velocity by ~15%.`,
      actions: [
        "Force-rank the backlog by ICE and freeze anything below the top 5.",
        "Set a 'kill or ship' deadline on every initiative older than 60 days.",
        "Move 'maybe later' items to a public roadmap rather than a sprint.",
      ],
    });
  }

  if (risk.market < 50) {
    recs.push({
      id: "market",
      title: "Re-validate ICP before next funding cycle",
      category: "growth",
      priority: "low",
      impact: 58,
      effort: 40,
      rationale: `Market subscore of ${risk.market}/100 suggests narrow TAM or weak demand signal. Investors will discount the round if this isn't clarified.`,
      actions: [
        "Run 15 ICP interviews to confirm the top urgent pain.",
        "Build a willingness-to-pay survey across 3 adjacent segments.",
        "Sharpen the one-line positioning and test 3 variants on cold outbound.",
      ],
    });
  }

  // ensure at least 3 recs even if everything looks healthy
  if (recs.length < 3) {
    recs.push({
      id: "expand",
      title: "Expand from beachhead into adjacent ICP",
      category: "growth",
      priority: "medium",
      impact: 70,
      effort: 50,
      rationale:
        "Fundamentals look healthy. The next risk is over-fitting to the initial ICP. Build a second wedge.",
      actions: [
        "Pick one adjacent segment with 2x more accounts than today's ICP.",
        "Build a focused landing page and a 3-week paid pilot offer.",
        "Hire one AE dedicated to the new segment for a 90-day test.",
      ],
    });
  }

  return recs.sort((x, y) => y.impact - x.impact).slice(0, 6);
}

export function unitEconomicsSummary(a: ProductAssumptions, sim: SimulationResult) {
  return [
    { label: "ARPU", value: `$${a.pricePerMonth}` },
    { label: "Gross Margin", value: `${sim.grossMargin}%` },
    { label: "LTV", value: `$${sim.ltv.toLocaleString()}` },
    { label: "LTV : CAC", value: `${sim.ltvCacRatio}x` },
    { label: "Payback", value: `${sim.paybackMonths} mo` },
    {
      label: "Break-even",
      value: sim.breakEvenMonth ? `Month ${sim.breakEvenMonth}` : "Beyond 36 mo",
    },
  ];
}
