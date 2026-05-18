"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTwinStore } from "@/lib/store";
import { INDUSTRIES } from "@/lib/mock-data";
import { simulate, riskScore } from "@/lib/engine";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Target,
  DollarSign,
  Users,
  Gauge,
  Map,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SliderRowProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
};

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
  hint,
}: SliderRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <span className="text-sm font-medium tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

function HealthRow({
  label,
  status,
  message,
}: {
  label: string;
  status: "good" | "warn" | "bad";
  message: string;
}) {
  const Icon =
    status === "good" ? CheckCircle2 : status === "warn" ? Info : AlertCircle;
  const color =
    status === "good"
      ? "text-emerald-300"
      : status === "warn"
        ? "text-amber-300"
        : "text-rose-300";
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", color)} />
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const { assumptions, update } = useTwinStore();
  const sim = useMemo(() => simulate(assumptions), [assumptions]);
  const risk = useMemo(() => riskScore(assumptions, sim), [assumptions, sim]);

  const checks: { label: string; status: "good" | "warn" | "bad"; message: string }[] = [
    {
      label: "Unit economics",
      status: sim.ltvCacRatio >= 3 ? "good" : sim.ltvCacRatio >= 2 ? "warn" : "bad",
      message: `LTV:CAC at ${sim.ltvCacRatio}x. Healthy SaaS sits above 3x.`,
    },
    {
      label: "Activation",
      status:
        assumptions.activationRate >= 60
          ? "good"
          : assumptions.activationRate >= 40
            ? "warn"
            : "bad",
      message: `${assumptions.activationRate}% of trials reach the aha moment.`,
    },
    {
      label: "Churn",
      status:
        assumptions.monthlyChurn <= 3
          ? "good"
          : assumptions.monthlyChurn <= 5
            ? "warn"
            : "bad",
      message: `Monthly churn of ${assumptions.monthlyChurn}%. Target below 3% for B2B SaaS.`,
    },
    {
      label: "Compliance",
      status:
        assumptions.complianceRisk <= 25
          ? "good"
          : assumptions.complianceRisk <= 50
            ? "warn"
            : "bad",
      message: `Risk score ${assumptions.complianceRisk}/100. Above 50 blocks enterprise procurement.`,
    },
    {
      label: "Onboarding friction",
      status:
        assumptions.onboardingFriction <= 30
          ? "good"
          : assumptions.onboardingFriction <= 55
            ? "warn"
            : "bad",
      message: `Friction at ${assumptions.onboardingFriction}/100. PLG benchmark is sub-30.`,
    },
  ];

  return (
    <AppShell
      title="Product audit"
      subtitle="Configure the assumptions powering every dashboard, simulation, and recommendation."
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-300" />
                Product identity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Product name</Label>
                <Input
                  value={assumptions.productName}
                  onChange={(e) => update({ productName: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2 block">Industry</Label>
                <Select
                  value={assumptions.industry}
                  onValueChange={(v) => update({ industry: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-2 block">Stage</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["idea", "mvp", "growth", "scale"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ stage: s })}
                      className={cn(
                        "px-3 py-2 text-sm rounded-lg border transition capitalize",
                        assumptions.stage === s
                          ? "border-indigo-400/40 bg-indigo-500/15 text-foreground"
                          : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-indigo-300" />
                Pricing & unit economics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              <SliderRow
                label="Price per month ($)"
                value={assumptions.pricePerMonth}
                onChange={(v) => update({ pricePerMonth: v })}
                min={0}
                max={500}
                suffix="$"
                hint="ARPU before discounts and annual prepay"
              />
              <SliderRow
                label="CAC ($)"
                value={assumptions.cac}
                onChange={(v) => update({ cac: v })}
                min={0}
                max={2500}
                step={10}
                suffix="$"
                hint="Blended customer acquisition cost"
              />
              <SliderRow
                label="Variable cost / user"
                value={assumptions.variableCostPerUser}
                onChange={(v) => update({ variableCostPerUser: v })}
                min={0}
                max={100}
                suffix="$"
              />
              <SliderRow
                label="Fixed monthly cost"
                value={assumptions.fixedCosts}
                onChange={(v) => update({ fixedCosts: v })}
                min={0}
                max={250000}
                step={1000}
                suffix="$"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-300" />
                Acquisition & engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              <SliderRow
                label="Monthly traffic"
                value={assumptions.monthlyTraffic}
                onChange={(v) => update({ monthlyTraffic: v })}
                min={0}
                max={500000}
                step={500}
                hint="Visits to your top-of-funnel"
              />
              <SliderRow
                label="Conversion rate"
                value={assumptions.conversionRate}
                onChange={(v) => update({ conversionRate: v })}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
              />
              <SliderRow
                label="Activation rate"
                value={assumptions.activationRate}
                onChange={(v) => update({ activationRate: v })}
                suffix="%"
                hint="% of new signups reaching aha"
              />
              <SliderRow
                label="30-day retention"
                value={assumptions.retention30}
                onChange={(v) => update({ retention30: v })}
                suffix="%"
              />
              <SliderRow
                label="Monthly churn"
                value={assumptions.monthlyChurn}
                onChange={(v) => update({ monthlyChurn: v })}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
              />
              <SliderRow
                label="Onboarding friction"
                value={assumptions.onboardingFriction}
                onChange={(v) => update({ onboardingFriction: v })}
                hint="0 = frictionless · 100 = sales-gated"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-4 w-4 text-indigo-300" />
                Execution & risk inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              <SliderRow
                label="Roadmap complexity"
                value={assumptions.roadmapComplexity}
                onChange={(v) => update({ roadmapComplexity: v })}
                hint="0 = tight focus · 100 = sprawl"
              />
              <SliderRow
                label="Compliance risk"
                value={assumptions.complianceRisk}
                onChange={(v) => update({ complianceRisk: v })}
                hint="0 = SOC2 / ISO ready · 100 = unaddressed"
              />
              <SliderRow
                label="Market size (TAM $M)"
                value={assumptions.marketSize}
                onChange={(v) => update({ marketSize: v })}
                min={10}
                max={50000}
                step={50}
              />
              <SliderRow
                label="Team size"
                value={assumptions.teamSize}
                onChange={(v) => update({ teamSize: v })}
                min={1}
                max={200}
              />
            </CardContent>
          </Card>
        </div>

        {/* live snapshot */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-indigo-300" />
                Live snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/5 border border-white/[0.06] p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Risk score
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-3xl font-semibold gradient-text">
                    {risk.overall}
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {risk.band}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["ARR Y1", formatCurrency(sim.projectedArrYear1, { compact: true })],
                  ["LTV:CAC", `${sim.ltvCacRatio}x`],
                  ["Payback", `${sim.paybackMonths} mo`],
                  ["GM", `${sim.grossMargin}%`],
                  ["LTV", formatCurrency(sim.ltv, { compact: true })],
                  [
                    "Break-even",
                    sim.breakEvenMonth ? `M${sim.breakEvenMonth}` : "36+",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {k}
                    </div>
                    <div className="text-sm font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-300" />
                Audit checks
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 divide-y divide-white/[0.04]">
              {checks.map((c) => (
                <HealthRow key={c.label} {...c} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
