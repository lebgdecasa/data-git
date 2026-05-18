"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sparkles, Play, RotateCcw, ArrowRight, ArrowDown, ArrowUp, Minus,
  Database, Info, ChevronDown, ChevronUp, Calculator, Zap, Shield,
  TrendingUp, Settings,
} from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import {
  runScenario,
  defaultScenarioInputs,
  type ScenarioInputs,
  type ScenarioResults,
  type ProductProfile,
  type ComplianceInvestment,
  type FeatureComplexity,
} from "@/lib/profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
function fmtScore(n: number): string {
  return `${Math.round(n)}`;
}
function fmtValue(n: number, format: string): string {
  if (format === "currency") return fmtCurrency(n);
  if (format === "percent")  return fmtPct(n);
  if (format === "score")    return fmtScore(n);
  return Math.round(n).toLocaleString();
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <p className="text-xs font-semibold text-zinc-300">{label}</p>
      {hint && <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const loadDemo = useProfileStore((s) => s.loadDemo);

  const populated = isProfilePopulated(profile);

  const [inputs, setInputs] = useState<ScenarioInputs>(() => defaultScenarioInputs(profile));
  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);

  // Refresh inputs default if profile changes onboarding steps (and current target equals old)
  React.useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      reduceOnboardingTo: Math.min(prev.reduceOnboardingTo, profile.onboardingSteps || prev.reduceOnboardingTo),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.onboardingSteps]);

  // Live preview re-runs on every change
  const livePreview = useMemo(
    () => (populated ? runScenario(profile, inputs) : null),
    [profile, inputs, populated],
  );

  const setInput = <K extends keyof ScenarioInputs>(k: K, v: ScenarioInputs[K]) =>
    setInputs((p) => ({ ...p, [k]: v }));

  const setProfileNum = (key: keyof ProductProfile, raw: string) => {
    const n = Number(raw);
    updateProfile({ [key]: Number.isFinite(n) ? n : 0 } as Partial<ProductProfile>);
  };

  const handleRun = () => {
    if (!populated) return;
    setResults(runScenario(profile, inputs));
    setTimeout(() => {
      document.getElementById("scenario-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleReset = () => {
    setInputs(defaultScenarioInputs(profile));
    setResults(null);
  };

  return (
    <AppShell title="Step 2 · Scenario Simulator" subtitle="Test the impact of a decision before you ship it.">
      <div className="space-y-6">

        {/* ── Source banner ─────────────────────────────────────── */}
        {populated ? (
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-zinc-900/40">
            <CardContent className="p-4 flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 grid place-items-center shrink-0">
                <Database className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Using saved product profile from your audit.</p>
                <p className="text-xs text-zinc-400">{profile.productName} · {profile.productType || "—"} · {profile.industry || "—"}</p>
              </div>
              <Link href="/audit">
                <Button size="sm" variant="outline">
                  Edit profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-zinc-900/40">
            <CardContent className="p-4 flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 grid place-items-center shrink-0">
                <Info className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">No saved profile yet.</p>
                <p className="text-xs text-zinc-400">Complete the Product Audit or load demo data to enable simulation.</p>
              </div>
              <Link href="/audit">
                <Button size="sm" variant="outline">Go to Product Audit</Button>
              </Link>
              <Button size="sm" onClick={loadDemo}>
                <Database className="h-3.5 w-3.5" /> Load NutriFlow Demo Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── ZONE A: Baseline data ─────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/80 grid place-items-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Zone A</p>
              <h2 className="text-base font-semibold text-white">Baseline Product Data</h2>
            </div>
            <span className="text-xs text-zinc-500 ml-auto">Edits here update your saved profile.</span>
          </div>

          <Card className="border-white/10">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <BaselineField label="Current MRR ($)" value={profile.mrr} field="mrr" onSet={setProfileNum} />
                <BaselineField label="Paying users" value={profile.payingUsers} field="payingUsers" onSet={setProfileNum} />
                <BaselineField label="ARPU ($)" value={profile.arpu} field="arpu" step={0.1} onSet={setProfileNum} />
                <BaselineField label="CAC ($)" value={profile.cac} field="cac" onSet={setProfileNum} />
                <BaselineField label="LTV ($)" value={profile.ltv} field="ltv" onSet={setProfileNum} />
                <BaselineField label="Monthly churn (%)" value={profile.churnRate} field="churnRate" step={0.1} onSet={setProfileNum} />
                <BaselineField label="Activation rate (%)" value={profile.activationRate} field="activationRate" onSet={setProfileNum} />
                <BaselineField label="30-day retention (%)" value={profile.retentionRate30} field="retentionRate30" onSet={setProfileNum} />
                <BaselineField label="Onboarding steps" value={profile.onboardingSteps} field="onboardingSteps" onSet={setProfileNum} />
                <BaselineField label="Onboarding completion (%)" value={profile.onboardingCompletion} field="onboardingCompletion" onSet={setProfileNum} />
                <BaselineField label="Compliance readiness (0-100)" value={profile.complianceReadiness} field="complianceReadiness" onSet={setProfileNum} />
                <BaselineField label="Roadmap complexity (0-100)" value={profile.roadmapComplexity} field="roadmapComplexity" onSet={setProfileNum} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── ZONE B: Decision levers ───────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/80 grid place-items-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Zone B</p>
              <h2 className="text-base font-semibold text-white">Decision Levers</h2>
            </div>
            <span className="text-xs text-zinc-500 ml-auto">Each lever has a plain-English effect on the model.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            <LeverCard
              title="Reduce onboarding steps to"
              effect="Each step removed lifts activation by ~4pp. Highest-leverage move when activation is low."
              defaultLabel={`Default: ${profile.onboardingSteps || 0} (no change)`}
              onReset={() => setInput("reduceOnboardingTo", profile.onboardingSteps || 0)}
            >
              <Input
                type="number"
                min={1}
                max={Math.max(1, profile.onboardingSteps || 1)}
                value={inputs.reduceOnboardingTo}
                onChange={(e) => setInput("reduceOnboardingTo", Math.max(1, Number(e.target.value) || 1))}
                className="w-24"
              />
              <span className="text-xs text-zinc-500">steps</span>
            </LeverCard>

            <LeverCard
              title="Improve activation by"
              effect="Direct lift in activation rate (in percentage points)."
              defaultLabel="Default: 0 (no change)"
              onReset={() => setInput("improveActivationBy", 0)}
            >
              <Input
                type="number"
                min={0}
                max={50}
                value={inputs.improveActivationBy}
                onChange={(e) => setInput("improveActivationBy", Math.max(0, Number(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-xs text-zinc-500">pp</span>
            </LeverCard>

            <LeverCard
              title="Reduce churn by"
              effect="Lower churn raises LTV directly: LTV ≈ ARPU / churn."
              defaultLabel="Default: 0% (no change)"
              onReset={() => setInput("reduceChurnBy", 0)}
            >
              <Input
                type="number"
                min={0}
                max={80}
                value={inputs.reduceChurnBy}
                onChange={(e) => setInput("reduceChurnBy", Math.max(0, Number(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-xs text-zinc-500">% relative</span>
            </LeverCard>

            <LeverCard
              title="Increase pricing by"
              effect="Raises ARPU and MRR, but adds a small churn penalty."
              defaultLabel="Default: 0% (no change)"
              onReset={() => setInput("increasePricingBy", 0)}
            >
              <Input
                type="number"
                min={0}
                max={100}
                value={inputs.increasePricingBy}
                onChange={(e) => setInput("increasePricingBy", Math.max(0, Number(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-xs text-zinc-500">%</span>
            </LeverCard>

            <LeverCard
              title="Increase marketing budget by"
              effect="Grows paying users (×0.5) but raises CAC sublinearly. Only pays off if activation is healthy."
              defaultLabel="Default: 0% (no change)"
              onReset={() => setInput("increaseMarketingBudgetBy", 0)}
            >
              <Input
                type="number"
                min={0}
                max={200}
                value={inputs.increaseMarketingBudgetBy}
                onChange={(e) => setInput("increaseMarketingBudgetBy", Math.max(0, Number(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-xs text-zinc-500">%</span>
            </LeverCard>

            <LeverCard
              title="Invest in compliance"
              effect="Reduces enterprise risk and unlocks deals. Heavy investment adds short-term churn drag."
              defaultLabel="Default: None"
              onReset={() => setInput("complianceInvestment", "None")}
            >
              <SegmentedControl
                value={inputs.complianceInvestment}
                options={["None", "Light", "Moderate", "Heavy"] as ComplianceInvestment[]}
                onChange={(v) => setInput("complianceInvestment", v)}
              />
            </LeverCard>

            <LeverCard
              title="Add new feature complexity"
              effect="High complexity raises execution risk and adds churn drag from instability."
              defaultLabel="Default: Medium"
              onReset={() => setInput("featureComplexity", "Medium")}
              full
            >
              <SegmentedControl
                value={inputs.featureComplexity}
                options={["Low", "Medium", "High"] as FeatureComplexity[]}
                onChange={(v) => setInput("featureComplexity", v)}
              />
            </LeverCard>

          </div>
        </div>

        {/* ── Run / Reset ─────────────────────────────────────── */}
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-purple-950/20">
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-white">Run the simulation</p>
              <p className="text-xs text-zinc-400">Apply your levers to the baseline and see before/after on 8 metrics.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset levers
              </Button>
              <Button size="lg" onClick={handleRun} disabled={!populated}>
                <Play className="h-4 w-4" /> Run Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Results ─────────────────────────────────────────── */}
        {results && (
          <div id="scenario-results" className="space-y-5 fade-up">

            <h2 className="text-lg font-semibold text-white">Simulation Results</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {results.deltas.map((d) => (
                <BeforeAfterCard key={d.key} delta={d} />
              ))}
            </div>

            {/* Impact summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ImpactCard
                title="Financial Impact"
                Icon={TrendingUp}
                color="border-emerald-500/30 bg-emerald-500/5"
                accentColor="text-emerald-300"
                body={results.financialImpact}
              />
              <ImpactCard
                title="Growth Impact"
                Icon={Zap}
                color="border-indigo-500/30 bg-indigo-500/5"
                accentColor="text-indigo-300"
                body={results.growthImpact}
              />
              <ImpactCard
                title="Risk Impact"
                Icon={Shield}
                color="border-amber-500/30 bg-amber-500/5"
                accentColor="text-amber-300"
                body={results.riskImpact}
              />
            </div>

            {/* AI recommendation */}
            <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/30">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">Strategic Recommendation</p>
                  <p className="text-sm text-white leading-relaxed">{results.recommendation}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Link href="/roadmap">
                <Button size="sm">
                  Turn into roadmap priority
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Live preview hint (no results yet) ─────────────── */}
        {!results && livePreview && (
          <Card className="border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-zinc-300">Live preview</p>
                <span className="text-[11px] text-zinc-500">Updates as you change inputs · Click "Run Simulation" to lock results.</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {livePreview.deltas.slice(0, 4).map((d) => (
                  <div key={d.key} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{d.label}</p>
                    <p className="text-sm font-bold text-white">{fmtValue(d.after, d.format)}</p>
                    <DeltaPill delta={d} small />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── How this is calculated ─────────────────────────── */}
        <Card className="border-white/10">
          <CardContent className="p-5">
            <button
              onClick={() => setShowFormulas((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-zinc-400" />
                <p className="text-sm font-semibold text-white">How this simulation is calculated</p>
              </div>
              {showFormulas ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>
            {showFormulas && (
              <div className="mt-4 space-y-3 text-sm text-zinc-300 leading-relaxed">
                <p>The simulator uses a deterministic, rule-based model. The relationships between levers and metrics are:</p>
                <ul className="space-y-1.5 list-disc pl-5 text-zinc-400">
                  <li><span className="text-white font-medium">Lower onboarding steps</span> → improves activation (~4pp per step removed).</li>
                  <li><span className="text-white font-medium">Higher activation</span> → improves 30-day retention and reduces churn (halo effect).</li>
                  <li><span className="text-white font-medium">Lower churn</span> → directly raises LTV (LTV = ARPU / churn).</li>
                  <li><span className="text-white font-medium">Price increase</span> → raises ARPU and MRR, but adds a small churn penalty.</li>
                  <li><span className="text-white font-medium">Marketing budget increase</span> → grows paying users (×0.5 of spend lift) and raises CAC sublinearly.</li>
                  <li><span className="text-white font-medium">Compliance investment</span> → reduces enterprise risk score (None=0, Light=8, Moderate=18, Heavy=30 points) but adds short-term churn drag.</li>
                  <li><span className="text-white font-medium">High feature complexity</span> → raises execution risk and adds churn drag.</li>
                </ul>
                <p className="text-xs text-zinc-500 italic mt-2">
                  This is a strategic simulation for portfolio demonstration, not financial advice. The model is intentionally simple
                  and deterministic; real product dynamics are noisier and depend on context not captured here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}

// ─── Baseline field ───────────────────────────────────────────────────────────

function BaselineField({
  label, value, field, step, onSet,
}: {
  label: string;
  value: number;
  field: keyof ProductProfile;
  step?: number;
  onSet: (k: keyof ProductProfile, raw: string) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} />
      <Input
        type="number"
        min={0}
        step={step}
        value={value || ""}
        onChange={(e) => onSet(field, e.target.value)}
        placeholder="0"
      />
    </div>
  );
}

// ─── Lever card ───────────────────────────────────────────────────────────────

function LeverCard({
  title, effect, defaultLabel, onReset, full, children,
}: {
  title: string;
  effect: string;
  defaultLabel: string;
  onReset: () => void;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("border-white/10", full && "md:col-span-2")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <p className="text-sm font-semibold text-white">{title}</p>
          <button onClick={onReset} className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
            Reset
          </button>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{effect}</p>
        <div className="flex items-center gap-2 mb-2">
          {children}
        </div>
        <p className="text-[10px] text-zinc-600">{defaultLabel}</p>
      </CardContent>
    </Card>
  );
}

// ─── Segmented control ───────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            value === opt
              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
              : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Before/After card ───────────────────────────────────────────────────────

function BeforeAfterCard({ delta }: { delta: any }) {
  const positive = (delta.delta > 0 && delta.goodIfUp) || (delta.delta < 0 && !delta.goodIfUp);
  const negative = (delta.delta < 0 && delta.goodIfUp) || (delta.delta > 0 && !delta.goodIfUp);
  const flat = delta.delta === 0 || Math.abs(delta.pct) < 0.5;

  const accent = flat ? "border-white/10" : positive ? "border-emerald-500/30" : "border-rose-500/30";

  return (
    <Card className={cn(accent)}>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">{delta.label}</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs text-zinc-500 line-through tabular-nums">{fmtValue(delta.before, delta.format)}</span>
          <ArrowRight className="h-3 w-3 text-zinc-600" />
          <span className={cn(
            "text-xl font-bold tabular-nums",
            flat ? "text-white" : positive ? "text-emerald-300" : "text-rose-300"
          )}>{fmtValue(delta.after, delta.format)}</span>
        </div>
        <DeltaPill delta={delta} />
      </CardContent>
    </Card>
  );
}

function DeltaPill({ delta, small }: { delta: any; small?: boolean }) {
  const positive = (delta.delta > 0 && delta.goodIfUp) || (delta.delta < 0 && !delta.goodIfUp);
  const flat = Math.abs(delta.pct) < 0.5;

  const Arrow = flat ? Minus : (delta.delta > 0 ? ArrowUp : ArrowDown);
  const color = flat ? "text-zinc-500" : positive ? "text-emerald-400" : "text-rose-400";

  return (
    <div className={cn("inline-flex items-center gap-1", color, small ? "text-[10px]" : "text-xs")}>
      <Arrow className={small ? "h-2.5 w-2.5" : "h-3 w-3"} />
      <span className="font-semibold tabular-nums">
        {delta.pct > 0 ? "+" : ""}{delta.pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── Impact card ─────────────────────────────────────────────────────────────

function ImpactCard({
  title, Icon, color, accentColor, body,
}: {
  title: string;
  Icon: React.ElementType;
  color: string;
  accentColor: string;
  body: string;
}) {
  return (
    <Card className={color}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", accentColor)} />
          <p className={cn("text-[10px] uppercase tracking-wider font-bold", accentColor)}>{title}</p>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}
