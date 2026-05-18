"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { useTwinStore } from "@/lib/store";
import { simulate } from "@/lib/engine";
import { formatCurrency } from "@/lib/utils";
import type { ProductAssumptions } from "@/lib/types";
import { Sparkles, Wand2, RotateCcw, TrendingUp, Zap } from "lucide-react";

type Tweaks = {
  pricing: number; // %
  churn: number; // %
  acquisition: number; // %
  activation: number; // %
};

const DEFAULT_TWEAKS: Tweaks = {
  pricing: 0,
  churn: 0,
  acquisition: 0,
  activation: 0,
};

function applyTweaks(base: ProductAssumptions, t: Tweaks): ProductAssumptions {
  return {
    ...base,
    pricePerMonth: Math.max(1, base.pricePerMonth * (1 + t.pricing / 100)),
    monthlyChurn: Math.max(0.1, base.monthlyChurn * (1 + t.churn / 100)),
    monthlyTraffic: Math.max(0, base.monthlyTraffic * (1 + t.acquisition / 100)),
    activationRate: Math.max(
      1,
      Math.min(100, base.activationRate * (1 + t.activation / 100)),
    ),
  };
}

const PRESETS: { label: string; icon: any; tweaks: Tweaks }[] = [
  {
    label: "Premium repricing",
    icon: TrendingUp,
    tweaks: { pricing: 25, churn: 8, acquisition: -5, activation: 0 },
  },
  {
    label: "Aggressive growth",
    icon: Zap,
    tweaks: { pricing: -10, churn: 0, acquisition: 60, activation: -5 },
  },
  {
    label: "Retention focus",
    icon: Sparkles,
    tweaks: { pricing: 0, churn: -40, acquisition: 0, activation: 20 },
  },
  {
    label: "Wartime cuts",
    icon: Wand2,
    tweaks: { pricing: 5, churn: 0, acquisition: -50, activation: 10 },
  },
];

export default function SimulatorPage() {
  const { assumptions } = useTwinStore();
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);

  const baseline = useMemo(() => simulate(assumptions), [assumptions]);
  const scenario = useMemo(
    () => simulate(applyTweaks(assumptions, tweaks)),
    [assumptions, tweaks],
  );

  const data = baseline.months.map((m, i) => ({
    month: m,
    Baseline: baseline.mrr[i],
    Scenario: scenario.mrr[i],
  }));

  const deltaArr =
    ((scenario.projectedArrYear1 - baseline.projectedArrYear1) /
      Math.max(baseline.projectedArrYear1, 1)) *
    100;
  const deltaLtv =
    ((scenario.ltv - baseline.ltv) / Math.max(baseline.ltv, 1)) * 100;
  const deltaPayback = scenario.paybackMonths - baseline.paybackMonths;

  return (
    <AppShell
      title="Scenario simulator"
      subtitle="Stress-test pricing, churn, and acquisition moves. Compare against the baseline twin in real time."
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>MRR projection</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Scenario vs. baseline · 36 months
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Baseline</Badge>
              <Badge variant="default">Scenario</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(v) => formatCurrency(v, { compact: true })}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="Baseline"
                  stroke="rgba(148,163,184,0.6)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Scenario"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scenario outcome</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              vs. current baseline
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <DeltaRow
              label="ARR · Year 1"
              base={formatCurrency(baseline.projectedArrYear1, { compact: true })}
              scen={formatCurrency(scenario.projectedArrYear1, { compact: true })}
              delta={deltaArr}
              fmt="pct"
            />
            <DeltaRow
              label="ARR · Year 3"
              base={formatCurrency(baseline.projectedArrYear3, { compact: true })}
              scen={formatCurrency(scenario.projectedArrYear3, { compact: true })}
              delta={
                ((scenario.projectedArrYear3 - baseline.projectedArrYear3) /
                  Math.max(baseline.projectedArrYear3, 1)) *
                100
              }
              fmt="pct"
            />
            <DeltaRow
              label="LTV"
              base={formatCurrency(baseline.ltv)}
              scen={formatCurrency(scenario.ltv)}
              delta={deltaLtv}
              fmt="pct"
            />
            <DeltaRow
              label="LTV : CAC"
              base={`${baseline.ltvCacRatio}x`}
              scen={`${scenario.ltvCacRatio}x`}
              delta={scenario.ltvCacRatio - baseline.ltvCacRatio}
              fmt="abs"
              suffix="x"
            />
            <DeltaRow
              label="Payback"
              base={`${baseline.paybackMonths} mo`}
              scen={`${scenario.paybackMonths} mo`}
              delta={-deltaPayback}
              fmt="abs"
              suffix=" mo"
            />
            <DeltaRow
              label="Break-even"
              base={baseline.breakEvenMonth ? `M${baseline.breakEvenMonth}` : "36+"}
              scen={scenario.breakEvenMonth ? `M${scenario.breakEvenMonth}` : "36+"}
              delta={
                (baseline.breakEvenMonth ?? 36) -
                (scenario.breakEvenMonth ?? 36)
              }
              fmt="abs"
              suffix=" mo"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Levers</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setTweaks(DEFAULT_TWEAKS)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
            <LeverRow
              label="Pricing change"
              value={tweaks.pricing}
              onChange={(v) => setTweaks({ ...tweaks, pricing: v })}
              hint={`${assumptions.pricePerMonth}$ → ${(assumptions.pricePerMonth * (1 + tweaks.pricing / 100)).toFixed(0)}$`}
            />
            <LeverRow
              label="Churn change"
              value={tweaks.churn}
              onChange={(v) => setTweaks({ ...tweaks, churn: v })}
              hint={`${assumptions.monthlyChurn}% → ${(assumptions.monthlyChurn * (1 + tweaks.churn / 100)).toFixed(2)}%`}
              invertGood
            />
            <LeverRow
              label="Acquisition change"
              value={tweaks.acquisition}
              onChange={(v) => setTweaks({ ...tweaks, acquisition: v })}
              hint={`${assumptions.monthlyTraffic.toLocaleString()} → ${Math.round(assumptions.monthlyTraffic * (1 + tweaks.acquisition / 100)).toLocaleString()} visits/mo`}
            />
            <LeverRow
              label="Activation change"
              value={tweaks.activation}
              onChange={(v) => setTweaks({ ...tweaks, activation: v })}
              hint={`${assumptions.activationRate}% → ${Math.min(100, assumptions.activationRate * (1 + tweaks.activation / 100)).toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Presets</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              One-click scenarios
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => setTweaks(p.tweaks)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition text-left"
                >
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500/30 to-purple-500/20 grid place-items-center border border-white/[0.06]">
                    <Icon className="h-3.5 w-3.5 text-indigo-300" />
                  </div>
                  <div className="text-sm font-medium">{p.label}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function LeverRow({
  label,
  value,
  onChange,
  hint,
  invertGood = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  invertGood?: boolean;
}) {
  const positive = invertGood ? value < 0 : value > 0;
  const negative = invertGood ? value > 0 : value < 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <span
          className={`text-sm font-medium tabular-nums ${
            positive ? "text-emerald-300" : negative ? "text-rose-300" : ""
          }`}
        >
          {value > 0 ? "+" : ""}
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        min={-80}
        max={100}
        step={1}
        onValueChange={(v) => onChange(v[0])}
      />
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

function DeltaRow({
  label,
  base,
  scen,
  delta,
  fmt,
  suffix = "",
}: {
  label: string;
  base: string;
  scen: string;
  delta: number;
  fmt: "pct" | "abs";
  suffix?: string;
}) {
  const good = delta > 0.001;
  const bad = delta < -0.001;
  const formatted =
    fmt === "pct"
      ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`
      : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${suffix}`;
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`text-xs font-medium ${
            good ? "text-emerald-300" : bad ? "text-rose-300" : "text-muted-foreground"
          }`}
        >
          {formatted}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-3">
        <span className="text-base font-semibold">{scen}</span>
        <span className="text-xs text-muted-foreground line-through">{base}</span>
      </div>
    </div>
  );
}
