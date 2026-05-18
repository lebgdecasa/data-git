"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Brain,
  ChevronRight,
  DollarSign,
  Gauge,
  Layers,
  Map,
  Minus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/* ── BASELINE (HealthTrack AI) ───────────────── */
const BASELINE = {
  productName: "HealthTrack AI",
  users: 12_500,
  mrr: 48_000,
  cac: 42,
  ltv: 420,
  churn: 7.5,           // % monthly
  activation: 38,       // %
  retention: 42,        // % D30
  healthScore: 49,
  riskScore: 52,
  onboardingSteps: 7,
  arpu: 48_000 / 12_500,
  grossMargin: 0.78,
};

/* ── LEVERS ──────────────────────────────────── */
type Levers = {
  pricingIncrease: number;        // 0-40 %
  onboardingReduction: number;    // 0-6 steps (from 7 baseline)
  churnReductionTarget: number;   // 0-70 %
  activationTarget: number;       // 0-100 % improvement
  marketingBudget: number;        // 0-150 % increase
  complianceInvestment: number;   // 0-100 score
  featureComplexity: number;      // 0-100 score
};

const DEFAULT_LEVERS: Levers = {
  pricingIncrease: 0,
  onboardingReduction: 0,
  churnReductionTarget: 0,
  activationTarget: 0,
  marketingBudget: 0,
  complianceInvestment: 20,
  featureComplexity: 40,
};

/* ── SIMULATION ENGINE ───────────────────────── */
type Outcome = {
  users: number;
  mrr: number;
  cac: number;
  ltv: number;
  churn: number;
  activation: number;
  retention: number;
  healthScore: number;
  riskScore: number;
  ltvCac: number;
  mrrSeries: { month: string; Baseline: number; Simulated: number }[];
  riskBreakdown: {
    dimension: string;
    baseline: number;
    simulated: number;
  }[];
};

function simulate(l: Levers): Outcome {
  const B = BASELINE;

  // Activation: onboarding reduction (each step = +5 activation) + direct target
  const onboardingBoost = l.onboardingReduction * 5;
  const directActivationBoost = (l.activationTarget / 100) * 35;
  const newActivation = Math.min(
    92,
    B.activation + onboardingBoost * 0.55 + directActivationBoost * 0.65,
  );

  // Churn: reduction target + activation halo - pricing penalty
  const activationChurnHalo = (newActivation - B.activation) * 0.045;
  const pricingChurnPenalty =
    l.pricingIncrease > 15 ? (l.pricingIncrease - 15) * 0.04 : 0;
  const newChurn = Math.max(
    1.5,
    B.churn * (1 - l.churnReductionTarget / 100) -
      activationChurnHalo +
      pricingChurnPenalty,
  );

  // Retention: driven by activation lift and lower churn
  const newRetention = Math.min(
    95,
    B.retention +
      (newActivation - B.activation) * 0.6 +
      (B.churn - newChurn) * 2.2,
  );

  // ARPU & LTV
  const newArpu = B.arpu * (1 + l.pricingIncrease / 100);
  const newLtv = B.ltv * (newArpu / B.arpu) * (B.churn / newChurn);

  // CAC (marketing spend has diminishing returns)
  const newCac =
    B.cac *
    (1 + (l.marketingBudget / 100) * 0.32) *
    (1 - l.complianceInvestment * 0.0008);

  // Users (marketing + churn + activation effects)
  const userGrowth =
    1 +
    (l.marketingBudget / 100) * 0.45 -
    (newChurn - B.churn) / 100 * 5.5 +
    ((newActivation - B.activation) / 100) * 0.35;
  const newUsers = Math.max(1_000, B.users * userGrowth);
  const newMrr = newUsers * newArpu;

  // Health Score (weighted composite)
  const ltvCac = newLtv / Math.max(newCac, 1);
  const monetizationScore = Math.min(100, 25 + ltvCac * 3.2);
  const activationScore = newActivation;
  const retentionScore = Math.min(
    100,
    newRetention + Math.max(0, 10 - newChurn) * 3.2,
  );
  const complianceScore = Math.min(100, 28 + l.complianceInvestment * 0.72);
  const executionScore = Math.max(15, 100 - l.featureComplexity * 0.72);

  const healthScore = Math.round(
    monetizationScore * 0.25 +
      activationScore * 0.25 +
      retentionScore * 0.25 +
      complianceScore * 0.1 +
      executionScore * 0.15,
  );

  // Risk dimensions (higher = healthier)
  const financialRisk = Math.min(100, 38 + (ltvCac - 3) * 5.5);
  const marketRisk = 62;
  const executionRisk = Math.max(12, 78 - l.featureComplexity * 0.55);
  const complianceRisk = Math.min(100, 28 + l.complianceInvestment * 0.7);
  const productRisk = (activationScore + retentionScore) / 2;

  const riskScore = Math.round(
    financialRisk * 0.28 +
      marketRisk * 0.18 +
      executionRisk * 0.18 +
      complianceRisk * 0.14 +
      productRisk * 0.22,
  );

  // 12-month MRR projection
  const baseGrowth = 0.015;
  const liftMultiplier = newMrr / B.mrr;
  const simulatedGrowth = baseGrowth + (liftMultiplier - 1) * 0.015;
  const mrrSeries = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    Baseline: Math.round(B.mrr * Math.pow(1 + baseGrowth, i)),
    Simulated: Math.round(
      B.mrr * liftMultiplier * Math.pow(1 + simulatedGrowth, i),
    ),
  }));

  return {
    users: Math.round(newUsers),
    mrr: Math.round(newMrr),
    cac: Math.round(newCac * 10) / 10,
    ltv: Math.round(newLtv),
    churn: Math.round(newChurn * 10) / 10,
    activation: Math.round(newActivation * 10) / 10,
    retention: Math.round(newRetention * 10) / 10,
    healthScore,
    riskScore,
    ltvCac: Math.round(ltvCac * 10) / 10,
    mrrSeries,
    riskBreakdown: [
      { dimension: "Financial", baseline: 56, simulated: Math.round(financialRisk) },
      { dimension: "Market", baseline: 60, simulated: Math.round(marketRisk) },
      { dimension: "Execution", baseline: 48, simulated: Math.round(executionRisk) },
      { dimension: "Compliance", baseline: 42, simulated: Math.round(complianceRisk) },
      { dimension: "Product", baseline: 40, simulated: Math.round(productRisk) },
    ],
  };
}

/* ── RECOMMENDATION ENGINE ───────────────────── */
function generateRecommendation(
  l: Levers,
  baseline: Outcome,
  current: Outcome,
): { headline: string; body: string; supporting: string[] } {
  // Sensitivity: try each lever maxed individually and measure healthScore lift
  const probes = [
    { key: "onboardingReduction" as const, max: 6, label: "Reducing onboarding from 7 to 1 step" },
    { key: "activationTarget" as const, max: 80, label: "Lifting activation by 80%" },
    { key: "churnReductionTarget" as const, max: 50, label: "Cutting churn by 50%" },
    { key: "pricingIncrease" as const, max: 25, label: "Increasing pricing by 25%" },
    { key: "marketingBudget" as const, max: 100, label: "Doubling marketing spend" },
  ];

  const impacts = probes.map((p) => {
    const test: Levers = { ...DEFAULT_LEVERS, [p.key]: p.max };
    const result = simulate(test);
    return {
      ...p,
      healthDelta: result.healthScore - baseline.healthScore,
      mrrDelta: result.mrr - baseline.mrr,
      ltvDelta: result.ltv - baseline.ltv,
    };
  });

  impacts.sort((a, b) => b.healthDelta - a.healthDelta);
  const winner = impacts[0];
  const runnerUp = impacts.find((i) => i.key !== winner.key) ?? impacts[1];

  // Determine the bottleneck from baseline
  const bottleneck =
    baseline.activation < 50
      ? "activation is the binding constraint - every other lever compounds on top of it"
      : baseline.churn > 5
        ? "churn is consuming top-of-funnel gains faster than acquisition can replace them"
        : "monetization efficiency is the bottleneck preventing healthy reinvestment in growth";

  const headline = `${winner.label} creates more impact than ${runnerUp.label.toLowerCase()} - because ${bottleneck}.`;

  const body =
    current.healthScore > baseline.healthScore + 5
      ? `Your current scenario lifts Product Health from ${baseline.healthScore} → ${current.healthScore} (+${current.healthScore - baseline.healthScore} pts) and MRR by ${formatMoney(current.mrr - baseline.mrr)}. Worth executing - but the simulator shows a higher-leverage combination is available.`
      : current.healthScore < baseline.healthScore - 2
        ? `Your current scenario reduces Product Health by ${baseline.healthScore - current.healthScore} points. This combination prioritizes the wrong levers given where the product is bottlenecked.`
        : `Your current scenario is roughly neutral. The simulator suggests the single biggest unlock is below - pair it with a churn target for a compounding effect.`;

  const supporting = impacts.slice(0, 4).map((i) =>
    `${i.label} → +${i.healthDelta} health · ${i.mrrDelta >= 0 ? "+" : ""}${formatMoney(i.mrrDelta)} MRR`,
  );

  return { headline, body, supporting };
}

/* ── HELPERS ─────────────────────────────────── */
function formatMoney(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${v < 0 ? "-" : ""}$${(abs / 1_000).toFixed(1)}k`;
  return `${v < 0 ? "-" : ""}$${abs.toFixed(0)}`;
}

function formatPct(v: number) {
  return `${v.toFixed(1)}%`;
}

function DeltaPill({ delta, suffix = "", invertGood = false }: { delta: number; suffix?: string; invertGood?: boolean }) {
  const positive = invertGood ? delta < 0 : delta > 0;
  const negative = invertGood ? delta > 0 : delta < 0;
  const Icon = delta > 0.01 ? ArrowUp : delta < -0.01 ? ArrowDown : Minus;
  const color = positive ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
    : negative ? "text-rose-300 bg-rose-500/10 border-rose-500/20"
    : "text-muted-foreground bg-white/[0.04] border-white/[0.06]";

  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tabular-nums", color)}>
      <Icon className="h-2.5 w-2.5" />
      {delta > 0 ? "+" : ""}{typeof delta === "number" && Math.abs(delta) >= 1000 ? formatMoney(delta).replace("$","").replace("-","") : Math.abs(delta).toFixed(1)}{suffix}
    </span>
  );
}

const LeverConfig = {
  pricingIncrease:      { label: "Pricing Increase",        unit: "%",  min: 0, max: 40,  step: 1, icon: DollarSign,    desc: "Higher ARPU, but may raise churn above 15%." },
  onboardingReduction:  { label: "Onboarding Steps Cut",    unit: " steps", min: 0, max: 6, step: 1, icon: Zap,        desc: "Each step removed lifts activation ~3 points." },
  churnReductionTarget: { label: "Churn Reduction Target",  unit: "%",  min: 0, max: 70,  step: 5, icon: TrendingUp,    desc: "Save-flow, downgrade tier, at-risk outreach." },
  activationTarget:     { label: "Activation Improvement",  unit: "%",  min: 0, max: 100, step: 5, icon: Sparkles,      desc: "Better first-session experience, sample data, checklist." },
  marketingBudget:      { label: "Marketing Budget Lift",   unit: "%",  min: 0, max: 150, step: 5, icon: Users,         desc: "Top-of-funnel growth with diminishing CAC returns." },
  complianceInvestment: { label: "Compliance Investment",   unit: "/100", min: 0, max: 100, step: 5, icon: ShieldCheck, desc: "SOC 2, GDPR, trust center, SSO + audit logs." },
  featureComplexity:    { label: "New Feature Complexity",  unit: "/100", min: 0, max: 100, step: 5, icon: Layers,      desc: "Cost of scope sprawl on execution velocity." },
};

/* ── PAGE ────────────────────────────────────── */
export default function SimulatorPage() {
  const [levers, setLevers] = useState<Levers>(DEFAULT_LEVERS);

  const baseline = useMemo(() => simulate(DEFAULT_LEVERS), []);
  const current = useMemo(() => simulate(levers), [levers]);
  const recommendation = useMemo(
    () => generateRecommendation(levers, baseline, current),
    [levers, baseline, current],
  );

  const set = (k: keyof Levers, v: number) => setLevers((s) => ({ ...s, [k]: v }));
  const reset = () => setLevers(DEFAULT_LEVERS);

  const presets = [
    { label: "Activation Sprint", icon: Zap, l: { ...DEFAULT_LEVERS, onboardingReduction: 4, activationTarget: 50 } },
    { label: "Retention Focus", icon: TrendingUp, l: { ...DEFAULT_LEVERS, churnReductionTarget: 40, activationTarget: 30 } },
    { label: "Aggressive Growth", icon: Users, l: { ...DEFAULT_LEVERS, marketingBudget: 100, pricingIncrease: 0, featureComplexity: 60 } },
    { label: "Enterprise Push", icon: ShieldCheck, l: { ...DEFAULT_LEVERS, complianceInvestment: 80, pricingIncrease: 15 } },
  ];

  // Metrics row (8 cards)
  const metrics = [
    { label: "MRR",            base: BASELINE.mrr,        sim: current.mrr,        format: (v: number) => formatMoney(v),        invertGood: false, icon: DollarSign },
    { label: "Active Users",   base: BASELINE.users,      sim: current.users,      format: (v: number) => v.toLocaleString(),    invertGood: false, icon: Users },
    { label: "CAC",            base: BASELINE.cac,        sim: current.cac,        format: (v: number) => `$${v.toFixed(0)}`,    invertGood: true,  icon: DollarSign },
    { label: "LTV",            base: BASELINE.ltv,        sim: current.ltv,        format: (v: number) => `$${v.toLocaleString()}`, invertGood: false, icon: TrendingUp },
    { label: "Churn",          base: BASELINE.churn,      sim: current.churn,      format: (v: number) => `${v.toFixed(1)}%`,    invertGood: true,  icon: ArrowDown },
    { label: "Activation",     base: BASELINE.activation, sim: current.activation, format: (v: number) => `${v.toFixed(0)}%`,    invertGood: false, icon: Zap },
    { label: "Retention D30",  base: BASELINE.retention,  sim: current.retention,  format: (v: number) => `${v.toFixed(0)}%`,    invertGood: false, icon: Sparkles },
    { label: "Health Score",   base: BASELINE.healthScore, sim: current.healthScore, format: (v: number) => `${v}/100`,          invertGood: false, icon: Gauge },
  ];

  const riskHeatmapBands = [
    { label: "Critical", range: [0, 25], color: "bg-rose-500/40 border-rose-400/40" },
    { label: "High Risk", range: [25, 45], color: "bg-orange-500/30 border-orange-400/30" },
    { label: "Moderate", range: [45, 60], color: "bg-amber-500/30 border-amber-400/30" },
    { label: "Healthy", range: [60, 80], color: "bg-emerald-500/30 border-emerald-400/30" },
    { label: "Strong", range: [80, 100], color: "bg-emerald-600/40 border-emerald-400/50" },
  ];

  const getBand = (score: number) => {
    if (score < 25) return 0;
    if (score < 45) return 1;
    if (score < 60) return 2;
    if (score < 80) return 3;
    return 4;
  };

  return (
    <AppShell
      title="Scenario Simulator"
      subtitle="Move the levers. Watch every metric, the health score, and the risk profile update in real time."
    >
      {/* ── TOP: AI RECOMMENDATION (HERO) ── */}
      <Card glow className="relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <CardContent className="relative p-6 lg:p-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4 flex-1 min-w-0 max-w-3xl">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-indigo-500/50 blur-xl rounded-xl animate-pulse" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg">
                  <Brain className="h-5.5 w-5.5 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Strategic Recommendation</p>
                  <Badge variant="default">Live</Badge>
                </div>
                <p className="text-lg lg:text-xl font-semibold leading-snug text-balance">
                  {recommendation.headline}
                </p>
                <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
                  {recommendation.body}
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-2">
                  {recommendation.supporting.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                      <ChevronRight className="h-3.5 w-3.5 text-indigo-300 mt-0.5 shrink-0" />
                      <span className="text-xs text-foreground/85">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="secondary" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset levers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── BEFORE / AFTER METRIC GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => {
          const delta = m.sim - m.base;
          const positive = m.invertGood ? delta < 0 : delta > 0;
          const Icon = m.icon;
          return (
            <Card key={m.label} className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                positive ? "from-emerald-500/[0.08]" : delta === 0 ? "from-white/[0.02]" : "from-rose-500/[0.08]",
                "to-transparent"
              )} />
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</p>
                  </div>
                  <DeltaPill delta={delta} invertGood={m.invertGood} />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="text-muted-foreground/60 text-xs">
                    <p className="text-[10px] uppercase tracking-widest">Now</p>
                    <p className="text-sm font-medium line-through opacity-60 mt-0.5">{m.format(m.base)}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 mb-1" />
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">After</p>
                    <p className={cn(
                      "text-xl font-semibold tabular-nums mt-0.5 transition-colors",
                      positive ? "gradient-text-blue" : delta === 0 ? "" : "text-rose-300"
                    )}>{m.format(m.sim)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── MAIN GRID: LEVERS (LEFT) + VISUALS (RIGHT) ── */}
      <div className="grid lg:grid-cols-12 gap-4">

        {/* ── LEVERS COLUMN ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Presets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-indigo-300" />
                Quick scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.label}
                    onClick={() => setLevers(p.l)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-400/20 transition text-left group"
                  >
                    <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500/25 to-purple-500/15 border border-white/[0.06] grid place-items-center group-hover:scale-105 transition-transform">
                      <Icon className="h-3 w-3 text-indigo-300" />
                    </div>
                    <span className="text-xs font-medium">{p.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Lever sliders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-300" />
                Decision levers
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                7 simultaneous moves · 36-month outlook
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {(Object.keys(LeverConfig) as (keyof Levers)[]).map((key) => {
                const cfg = LeverConfig[key];
                const Icon = cfg.icon;
                const value = levers[key];
                const isMoved = value !== DEFAULT_LEVERS[key];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", isMoved ? "text-indigo-300" : "text-muted-foreground/60")} />
                        <Label className={cn("transition-colors", isMoved && "text-foreground")}>{cfg.label}</Label>
                      </div>
                      <span className={cn(
                        "text-sm font-semibold tabular-nums px-2 py-0.5 rounded-md transition-all",
                        isMoved ? "text-indigo-300 bg-indigo-500/10" : "text-muted-foreground"
                      )}>
                        {value > 0 && key !== "complianceInvestment" && key !== "featureComplexity" ? "+" : ""}{value}{cfg.unit}
                      </span>
                    </div>
                    <Slider
                      value={[value]}
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                      onValueChange={(v) => set(key, v[0])}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">{cfg.desc}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* ── VISUALS COLUMN ── */}
        <div className="lg:col-span-7 space-y-4">

          {/* MRR Projection chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">MRR Projection</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    12-month outlook · baseline vs simulated scenario
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Year-end delta</p>
                  <p className={cn(
                    "text-lg font-semibold tabular-nums mt-0.5",
                    current.mrrSeries[11].Simulated - current.mrrSeries[11].Baseline > 0 ? "text-emerald-300" : current.mrrSeries[11].Simulated - current.mrrSeries[11].Baseline < 0 ? "text-rose-300" : "text-muted-foreground"
                  )}>
                    {current.mrrSeries[11].Simulated - current.mrrSeries[11].Baseline > 0 ? "+" : ""}
                    {formatMoney(current.mrrSeries[11].Simulated - current.mrrSeries[11].Baseline)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={current.mrrSeries}>
                  <defs>
                    <linearGradient id="sim-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="base-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-white/10 bg-[hsl(224,44%,10%)]/95 backdrop-blur-md px-3 py-2 shadow-2xl text-xs">
                          <p className="text-muted-foreground mb-1.5">{label}</p>
                          {payload.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 mt-0.5">
                              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                              <span className="text-muted-foreground">{p.name}</span>
                              <span className="ml-auto font-medium tabular-nums">{formatMoney(p.value as number)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="Baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fill="url(#base-gradient)" />
                  <Area type="monotone" dataKey="Simulated" stroke="#a78bfa" strokeWidth={2.5} fill="url(#sim-gradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Risk Heatmap</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scenario impact across all 5 risk dimensions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Composite</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm text-muted-foreground line-through opacity-60 tabular-nums">{baseline.riskScore}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                      "text-lg font-semibold tabular-nums",
                      current.riskScore > baseline.riskScore ? "text-emerald-300" : current.riskScore < baseline.riskScore ? "text-rose-300" : ""
                    )}>{current.riskScore}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Band legend */}
              <div className="grid grid-cols-5 gap-1 mb-3">
                {riskHeatmapBands.map((b) => (
                  <div key={b.label} className={cn("rounded-md border px-1.5 py-1 text-center", b.color)}>
                    <p className="text-[9px] uppercase tracking-wider text-white/90 font-medium">{b.label}</p>
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {current.riskBreakdown.map((r) => {
                const baseBand = getBand(r.baseline);
                const simBand = getBand(r.simulated);
                return (
                  <div key={r.dimension}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{r.dimension}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{r.baseline}</span>
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/60" />
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          r.simulated > r.baseline ? "text-emerald-300" : r.simulated < r.baseline ? "text-rose-300" : ""
                        )}>{r.simulated}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {riskHeatmapBands.map((b, idx) => {
                        const isBase = idx === baseBand;
                        const isSim = idx === simBand;
                        const isBoth = isBase && isSim;
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "h-7 rounded-md border relative transition-all duration-500",
                              isSim ? b.color : "bg-white/[0.02] border-white/[0.04]"
                            )}
                          >
                            {isBase && !isBoth && (
                              <div className="absolute inset-0 grid place-items-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                              </div>
                            )}
                            {isSim && (
                              <div className="absolute inset-0 grid place-items-center">
                                <div className="h-2 w-2 rounded-full bg-white shadow-lg" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-2 mt-2 border-t border-white/[0.04] text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span>Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-white shadow" />
                  <span>Simulated</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health + Risk summary bars */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Product Health Score", base: baseline.healthScore, sim: current.healthScore, icon: Gauge },
              { label: "Composite Risk Score", base: baseline.riskScore, sim: current.riskScore, icon: ShieldCheck },
            ].map((s) => {
              const delta = s.sim - s.base;
              const Icon = s.icon;
              return (
                <Card key={s.label} className="p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-indigo-300" />
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    </div>
                    <DeltaPill delta={delta} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-semibold tabular-nums">{s.sim}</span>
                    <span className="text-xs text-muted-foreground mb-1">/ 100</span>
                    <span className="text-xs text-muted-foreground line-through opacity-60 ml-auto mb-1 tabular-nums">{s.base}</span>
                  </div>
                  {/* Comparison bar */}
                  <div className="relative h-2 rounded-full bg-white/[0.06] mt-3 overflow-hidden">
                    <div
                      className="absolute h-full bg-white/15 transition-all"
                      style={{ width: `${s.base}%` }}
                    />
                    <div
                      className={cn(
                        "absolute h-full bg-gradient-to-r transition-all duration-700",
                        delta >= 0 ? "from-indigo-500 to-purple-500" : "from-rose-500 to-orange-500"
                      )}
                      style={{ width: `${s.sim}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
