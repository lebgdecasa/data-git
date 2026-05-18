import type { ProductAssumptions, RoadmapItem } from "./types";

export const DEFAULT_ASSUMPTIONS: ProductAssumptions = {
  productName: "Northwind Analytics",
  industry: "B2B SaaS",
  stage: "growth",
  pricePerMonth: 89,
  monthlyChurn: 4.2,
  cac: 320,
  activationRate: 48,
  retention30: 62,
  monthlyTraffic: 25000,
  conversionRate: 3.2,
  onboardingFriction: 42,
  complianceRisk: 28,
  roadmapComplexity: 55,
  marketSize: 4800, // $M
  fixedCosts: 38000,
  variableCostPerUser: 6,
  teamSize: 14,
};

export const INDUSTRIES = [
  "B2B SaaS",
  "Consumer Mobile",
  "Fintech",
  "Healthtech",
  "Marketplace",
  "Developer Tools",
  "AI / ML",
  "E-commerce",
  "EdTech",
  "Climate Tech",
];

export const DEFAULT_ROADMAP: RoadmapItem[] = [
  {
    id: "r1",
    title: "Self-serve onboarding flow",
    description:
      "Replace sales-gated demo with interactive product tour and template gallery.",
    impact: 88,
    effort: 55,
    confidence: 82,
    reach: 90,
    status: "now",
  },
  {
    id: "r2",
    title: "Usage-based pricing tier",
    description:
      "Introduce a metered tier alongside flat-rate to expand ICP coverage.",
    impact: 78,
    effort: 70,
    confidence: 70,
    reach: 75,
    status: "now",
  },
  {
    id: "r3",
    title: "SOC 2 Type II readiness",
    description:
      "Close enterprise objections by reaching SOC 2 Type II compliance.",
    impact: 72,
    effort: 85,
    confidence: 95,
    reach: 60,
    status: "next",
  },
  {
    id: "r4",
    title: "AI-assisted insights",
    description: "Surface anomaly detection and forecasting in the core dashboard.",
    impact: 92,
    effort: 78,
    confidence: 65,
    reach: 88,
    status: "next",
  },
  {
    id: "r5",
    title: "Slack & Teams integrations",
    description: "Push insights into the customer's collaboration surface.",
    impact: 64,
    effort: 35,
    confidence: 88,
    reach: 70,
    status: "next",
  },
  {
    id: "r6",
    title: "Mobile companion app",
    description: "Native iOS / Android read-only experience for executives.",
    impact: 48,
    effort: 80,
    confidence: 55,
    reach: 40,
    status: "later",
  },
  {
    id: "r7",
    title: "Partner marketplace",
    description: "Third-party connectors and templates with revenue share.",
    impact: 70,
    effort: 90,
    confidence: 50,
    reach: 65,
    status: "later",
  },
];

export const SAMPLE_COMPETITORS = [
  { name: "Northwind", price: 89, share: 14, rating: 4.6 },
  { name: "Lighthouse", price: 129, share: 22, rating: 4.4 },
  { name: "Pulseboard", price: 49, share: 9, rating: 4.1 },
  { name: "Metricly", price: 199, share: 31, rating: 4.7 },
  { name: "Open-source", price: 0, share: 18, rating: 3.9 },
];

export const RADAR_BENCHMARK = [
  { dimension: "Activation", you: 48, benchmark: 62 },
  { dimension: "Retention", you: 62, benchmark: 71 },
  { dimension: "Monetization", you: 73, benchmark: 65 },
  { dimension: "Differentiation", you: 68, benchmark: 58 },
  { dimension: "GTM Maturity", you: 54, benchmark: 60 },
  { dimension: "Operational", you: 70, benchmark: 64 },
];
