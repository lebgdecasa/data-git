export type ProductAssumptions = {
  productName: string;
  industry: string;
  stage: "idea" | "mvp" | "growth" | "scale";
  pricePerMonth: number; // ARPU
  monthlyChurn: number; // %
  cac: number; // $
  activationRate: number; // %
  retention30: number; // %
  monthlyTraffic: number; // visits
  conversionRate: number; // %
  onboardingFriction: number; // 0-100
  complianceRisk: number; // 0-100
  roadmapComplexity: number; // 0-100
  marketSize: number; // TAM in $M
  fixedCosts: number; // monthly $
  variableCostPerUser: number; // $/user/month
  teamSize: number;
};

export type SimulationResult = {
  months: number[];
  mrr: number[];
  users: number[];
  cumulativeRevenue: number[];
  burn: number[];
  ltv: number;
  ltvCacRatio: number;
  paybackMonths: number;
  grossMargin: number;
  monthlyGrowthRate: number;
  breakEvenMonth: number | null;
  projectedArrYear1: number;
  projectedArrYear3: number;
};

export type RiskScore = {
  overall: number; // 0-100, lower = riskier
  financial: number;
  market: number;
  execution: number;
  compliance: number;
  product: number;
  band: "critical" | "high" | "moderate" | "healthy" | "strong";
};

export type Recommendation = {
  id: string;
  title: string;
  category: "growth" | "retention" | "monetization" | "risk" | "team" | "product";
  priority: "high" | "medium" | "low";
  impact: number; // 0-100
  effort: number; // 0-100
  rationale: string;
  actions: string[];
};

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  impact: number; // 0-100
  effort: number; // 0-100
  confidence: number; // 0-100
  reach: number; // 0-100
  status: "now" | "next" | "later";
};
