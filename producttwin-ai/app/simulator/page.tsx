"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { NextStep } from "@/components/layout/next-step";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sparkles, Play, RotateCcw, ArrowRight, ArrowDown, ArrowUp, Minus,
  Database, Info, ChevronDown, ChevronUp, Calculator, Zap, Shield,
  TrendingUp, Settings, BarChart3,
} from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import {
  runScenario,
  defaultScenarioInputs,
  type ScenarioInputs,
  type ScenarioResults,
  type ScenarioDelta,
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
function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }
function fmtScore(n: number): string { return `${Math.round(n)}`; }
function fmtValue(n: number, format: string): string {
  if (format === "currency") return fmtCurrency(n);
  if (format === "percent")  return fmtPct(n);
  if (format === "score")    return fmtScore(n);
  return Math.round(n).toLocaleString();
}

function FieldLabel({ label }: { label: string }) {
  return <p className="text-[11px] font-medium text-zinc-400 mb-1">{label}</p>;
}

function ColumnHeader({
  num, title, subtitle, Icon, color,
}: {
  num: string; title: string; subtitle: string; Icon: React.ElementType; color: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow mb-0.5">Column {num}</p>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const loadDemo = useProfileStore((s) => s.loadDemo);
  const lastScenario = useProfileStore((s) => s.lastScenario);
  const setLastScenario = useProfileStore((s) => s.setLastScenario);
  const savedScenarios = useProfileStore((s) => s.savedScenarios);
  const saveScenario = useProfileStore((s) => s.saveScenario);
  const deleteScenario = useProfileStore((s) => s.deleteScenario);

  const populated = isProfilePopulated(profile);

  const [inputs, setInputs] = useState<ScenarioInputs>(() => defaultScenarioInputs(profile));
  const [results, setResults] = useState<ScenarioResults | null>(() => lastScenario);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [scenarioName, setScenarioName] = useState("");

  React.useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      reduceOnboardingTo: Math.min(prev.reduceOnboardingTo, profile.onboardingSteps || prev.reduceOnboardingTo),
    }));
  }, [profile.onboardingSteps]);

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
    const r = runScenario(profile, inputs);
    setResults(r);
    setLastScenario(r);
    setTimeout(() => {
      document.getElementById("scenario-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleReset = () => {
    setInputs(defaultScenarioInputs(profile));
    setResults(null);
    setLastScenario(null);
  };

  const handleSaveScenario = () => {
    if (!results) return;
    const name = scenarioName.trim() || `Scenario ${savedScenarios.length + 1}`;
    saveScenario(name, inputs, results);
    setScenarioName("");
  };

  const handleLoadScenario = (s: typeof savedScenarios[number]) => {
    setInputs(s.inputs);
    setResults(s.results);
    setLastScenario(s.results);
  };

  return (
    <AppShell>
      <PageHeader
        step={3}
        eyebrow="Scenario Simulator"
        title="Test a decision before you ship it"
        description="Adjust the levers on the right to simulate the impact on revenue, retention, and risk. The center column tracks your live projection in real time."
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={handleRun} disabled={!populated}>
              <Play className="h-3.5 w-3.5" /> Run Simulation
            </Button>
          </>
        }
      />

      <div className="space-y-6">

        {/* ── Source banner ─────────────────────────────────────── */}
        {populated ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 grid place-items-center shrink-0">
              <Database className="h-3.5 w-3.5 text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Using saved profile</p>
              <p className="text-[11px] text-zinc-500 truncate">
                {profile.productName} · {profile.productType || "—"} · {profile.industry || "—"}
              </p>
            </div>
            <Link href="/audit">
              <Button size="sm" variant="ghost">Edit profile</Button>
            </Link>
          </div>
        ) : (
          <Card className="border-amber-500/30">
            <CardContent className="p-5 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 grid place-items-center shrink-0">
                <Info className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">No saved profile yet</p>
                <p className="text-xs text-zinc-400">Complete the Business Profile or load demo data to enable simulation.</p>
              </div>
              <Link href="/audit"><Button size="sm" variant="outline">Go to Profile</Button></Link>
              <Button size="sm" onClick={loadDemo}>
                <Database className="h-3.5 w-3.5" /> Load NutriFlow Demo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Three-column workspace ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT — Current Business Metrics */}
          <Card className="lg:col-span-4">
            <CardContent className="p-5">
              <ColumnHeader
                num="01"
                title="Current Business Metrics"
                subtitle="Edits here update your saved profile."
                Icon={Settings}
                color="bg-indigo-500/80"
              />
              <div className="space-y-3">
                <CompactField label="Current MRR ($)" value={profile.mrr} field="mrr" onSet={setProfileNum} />
                <CompactField label="Paying users" value={profile.payingUsers} field="payingUsers" onSet={setProfileNum} />
                <CompactField label="ARPU ($)" value={profile.arpu} field="arpu" step={0.1} onSet={setProfileNum} />
                <CompactField label="CAC ($)" value={profile.cac} field="cac" onSet={setProfileNum} />
                <CompactField label="LTV ($)" value={profile.ltv} field="ltv" onSet={setProfileNum} />
                <CompactField label="Monthly churn (%)" value={profile.churnRate} field="churnRate" step={0.1} onSet={setProfileNum} />
                <CompactField label="Activation rate (%)" value={profile.activationRate} field="activationRate" onSet={setProfileNum} />
                <CompactField label="30-day retention (%)" value={profile.retentionRate30} field="retentionRate30" onSet={setProfileNum} />
                <CompactField label="Onboarding steps" value={profile.onboardingSteps} field="onboardingSteps" onSet={setProfileNum} />
                <CompactField label="Onboarding completion (%)" value={profile.onboardingCompletion} field="onboardingCompletion" onSet={setProfileNum} />
                <CompactField label="Compliance readiness (0-100)" value={profile.complianceReadiness} field="complianceReadiness" onSet={setProfileNum} />
                <CompactField label="Roadmap complexity (0-100)" value={profile.roadmapComplexity} field="roadmapComplexity" onSet={setProfileNum} />
              </div>
            </CardContent>
          </Card>

          {/* CENTER — Decision Levers */}
          <Card className="lg:col-span-4">
            <CardContent className="p-5">
              <ColumnHeader
                num="02"
                title="Simulation Controls"
                subtitle="Move the levers to test product decisions."
                Icon={Sparkles}
                color="bg-purple-500/80"
              />
              <div className="space-y-4">

                <LeverRow
                  title="Reduce onboarding steps to"
                  effect="Each step removed lifts activation ~4pp."
                  onReset={() => setInput("reduceOnboardingTo", profile.onboardingSteps || 0)}
                >
                  <Input
                    type="number"
                    min={1}
                    max={Math.max(1, profile.onboardingSteps || 1)}
                    value={inputs.reduceOnboardingTo}
                    onChange={(e) => setInput("reduceOnboardingTo", Math.max(1, Number(e.target.value) || 1))}
                    className="h-8 w-20 text-sm"
                  />
                  <span className="text-xs text-zinc-500">steps</span>
                </LeverRow>

                <LeverRow
                  title="Improve activation by"
                  effect="Direct lift in activation rate (pp)."
                  onReset={() => setInput("improveActivationBy", 0)}
                >
                  <Input
                    type="number" min={0} max={50}
                    value={inputs.improveActivationBy}
                    onChange={(e) => setInput("improveActivationBy", Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 w-20 text-sm"
                  />
                  <span className="text-xs text-zinc-500">pp</span>
                </LeverRow>

                <LeverRow
                  title="Reduce churn by"
                  effect="Raises LTV directly: LTV ≈ ARPU / churn."
                  onReset={() => setInput("reduceChurnBy", 0)}
                >
                  <Input
                    type="number" min={0} max={80}
                    value={inputs.reduceChurnBy}
                    onChange={(e) => setInput("reduceChurnBy", Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 w-20 text-sm"
                  />
                  <span className="text-xs text-zinc-500">%</span>
                </LeverRow>

                <LeverRow
                  title="Increase pricing by"
                  effect="Raises ARPU, adds small churn penalty."
                  onReset={() => setInput("increasePricingBy", 0)}
                >
                  <Input
                    type="number" min={0} max={100}
                    value={inputs.increasePricingBy}
                    onChange={(e) => setInput("increasePricingBy", Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 w-20 text-sm"
                  />
                  <span className="text-xs text-zinc-500">%</span>
                </LeverRow>

                <LeverRow
                  title="Increase marketing budget by"
                  effect="Grows users; raises CAC sublinearly."
                  onReset={() => setInput("increaseMarketingBudgetBy", 0)}
                >
                  <Input
                    type="number" min={0} max={200}
                    value={inputs.increaseMarketingBudgetBy}
                    onChange={(e) => setInput("increaseMarketingBudgetBy", Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 w-20 text-sm"
                  />
                  <span className="text-xs text-zinc-500">%</span>
                </LeverRow>

                <LeverRow
                  title="Invest in compliance"
                  effect="Reduces enterprise risk; small short-term drag."
                  onReset={() => setInput("complianceInvestment", "None")}
                  stacked
                >
                  <SegmentedControl
                    value={inputs.complianceInvestment}
                    options={["None", "Light", "Moderate", "Heavy"] as ComplianceInvestment[]}
                    onChange={(v) => setInput("complianceInvestment", v)}
                  />
                </LeverRow>

                <LeverRow
                  title="New feature complexity"
                  effect="High complexity raises execution risk."
                  onReset={() => setInput("featureComplexity", "Medium")}
                  stacked
                >
                  <SegmentedControl
                    value={inputs.featureComplexity}
                    options={["Low", "Medium", "High"] as FeatureComplexity[]}
                    onChange={(v) => setInput("featureComplexity", v)}
                  />
                </LeverRow>

              </div>
            </CardContent>
          </Card>

          {/* RIGHT — Live Projected Impact */}
          <Card className="lg:col-span-4 glass-elevated">
            <CardContent className="p-5">
              <ColumnHeader
                num="03"
                title="Projected Impact"
                subtitle="Updates live as you change inputs."
                Icon={BarChart3}
                color="bg-cyan-500/80"
              />
              {livePreview ? (
                <div className="space-y-2">
                  {livePreview.deltas.map((d) => (
                    <LiveImpactRow key={d.key} delta={d} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg surface-subtle p-4 text-center">
                  <p className="text-xs text-zinc-500">Load a profile to see projected impact.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Run reminder ─────────────────────────────────────── */}
        {populated && !results && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-300">Live preview</span> is showing above.
              Click <span className="text-white font-medium">Run Simulation</span> to lock results, see full impact summaries, and unlock the recommendation.
            </p>
            <Button size="sm" onClick={handleRun}>
              <Play className="h-3.5 w-3.5" /> Run Simulation
            </Button>
          </div>
        )}

        {/* ── Locked Results ──────────────────────────────────────── */}
        {results && (
          <div id="scenario-results" className="space-y-6 fade-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-white">Simulation Results</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  type="text"
                  placeholder="Name this scenario (optional)"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="h-8 w-48 text-xs"
                />
                <Button size="sm" variant="outline" onClick={handleSaveScenario}>
                  Save scenario
                </Button>
                <span className="text-[11px] text-zinc-500">Locked from your last Run</span>
              </div>
            </div>

            {/* Saved scenarios drawer */}
            {savedScenarios.length > 0 && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <button
                  type="button"
                  onClick={() => setShowScenarios((v) => !v)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <p className="text-sm font-semibold text-white">
                    Saved scenarios <span className="text-zinc-500 font-normal">({savedScenarios.length})</span>
                  </p>
                  {showScenarios ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                </button>
                {showScenarios && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {savedScenarios.map((s) => (
                      <div key={s.id} className="surface-subtle p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                          <p className="text-[11px] text-zinc-500 tabular-numeric">
                            {fmtCurrency(s.results.after.mrr)} MRR · {s.results.after.churn.toFixed(1)}% churn · health {s.results.after.healthScore}
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            {new Date(s.savedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleLoadScenario(s)}>Load</Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteScenario(s.id)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {results.deltas.map((d) => (
                <BeforeAfterCard key={d.key} delta={d} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ImpactCard
                title="Financial Impact"
                Icon={TrendingUp}
                color="border-emerald-500/30"
                accentColor="text-emerald-300"
                body={results.financialImpact}
              />
              <ImpactCard
                title="Growth Impact"
                Icon={Zap}
                color="border-indigo-500/30"
                accentColor="text-indigo-300"
                body={results.growthImpact}
              />
              <ImpactCard
                title="Risk Impact"
                Icon={Shield}
                color="border-amber-500/30"
                accentColor="text-amber-300"
                body={results.riskImpact}
              />
            </div>

            {/* Strategic Recommendation */}
            <Card className="glass-elevated border-indigo-500/30">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="eyebrow mb-1.5 text-indigo-300">Strategic Recommendation</p>
                  <p className="text-base text-white leading-relaxed">{results.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Formulas explainer ──────────────────────────────────── */}
        <Card>
          <CardContent className="p-5">
            <button
              type="button"
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
                <p>The simulator uses a deterministic, rule-based model. The relationships between levers and metrics:</p>
                <ul className="space-y-1.5 list-disc pl-5 text-zinc-400">
                  <li><span className="text-white font-medium">Lower onboarding steps</span> → improves activation (~4pp per step removed).</li>
                  <li><span className="text-white font-medium">Higher activation</span> → improves 30-day retention and reduces churn.</li>
                  <li><span className="text-white font-medium">Lower churn</span> → directly raises LTV (LTV = ARPU / churn).</li>
                  <li><span className="text-white font-medium">Price increase</span> → raises ARPU and MRR, but adds a small churn penalty.</li>
                  <li><span className="text-white font-medium">Marketing budget increase</span> → grows paying users (×0.5 of spend lift) and raises CAC sublinearly.</li>
                  <li><span className="text-white font-medium">Compliance investment</span> → reduces enterprise risk; adds short-term churn drag.</li>
                  <li><span className="text-white font-medium">High feature complexity</span> → raises execution risk and adds churn drag.</li>
                </ul>
                <p className="text-xs text-zinc-500 italic mt-2">
                  Strategic simulation for portfolio demonstration, not financial advice. The model is intentionally simple
                  and deterministic; real product dynamics are noisier.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <NextStep
        label={results ? "See your full impact results" : "Run a simulation first"}
        description={
          results
            ? "Review your projected KPIs across acquisition, activation, retention, and revenue with strategic interpretation."
            : "Once you run a simulation, you can move on to see your full impact analysis."
        }
        href="/kpi"
        disabled={!populated}
        disabledHint={!populated ? "Load a product profile to enable the simulator." : undefined}
      />
    </AppShell>
  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function CompactField({
  label, value, field, step, onSet,
}: {
  label: string;
  value: number;
  field: keyof ProductProfile;
  step?: number;
  onSet: (k: keyof ProductProfile, raw: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <FieldLabel label={label} />
      <Input
        type="number"
        min={0}
        step={step}
        value={value || ""}
        onChange={(e) => onSet(field, e.target.value)}
        placeholder="0"
        className="h-8 w-24 text-right text-sm tabular-numeric"
      />
    </div>
  );
}

function LeverRow({
  title, effect, onReset, stacked, children,
}: {
  title: string;
  effect: string;
  onReset: () => void;
  stacked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-subtle p-3">
      <div className="flex items-start justify-between mb-1 gap-2">
        <p className="text-xs font-semibold text-white leading-snug">{title}</p>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
        >
          Reset
        </button>
      </div>
      <p className="text-[10px] text-zinc-500 leading-snug mb-2">{effect}</p>
      <div className={cn("flex items-center gap-2", stacked && "flex-wrap")}>
        {children}
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all",
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

function LiveImpactRow({ delta }: { delta: ScenarioDelta }) {
  const positive = (delta.delta > 0 && delta.goodIfUp) || (delta.delta < 0 && !delta.goodIfUp);
  const flat = Math.abs(delta.pct) < 0.5;
  const Arrow = flat ? Minus : (delta.delta > 0 ? ArrowUp : ArrowDown);
  const color = flat ? "text-zinc-500" : positive ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-white/[0.025] transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-zinc-400 leading-tight">{delta.label}</p>
        <p className="text-sm font-semibold text-white tabular-numeric leading-tight">
          {fmtValue(delta.after, delta.format)}
        </p>
      </div>
      <div className={cn("flex items-center gap-1 text-xs font-semibold tabular-numeric", color)}>
        <Arrow className="h-3 w-3" />
        {delta.pct > 0 ? "+" : ""}{delta.pct.toFixed(1)}%
      </div>
    </div>
  );
}

function BeforeAfterCard({ delta }: { delta: ScenarioDelta }) {
  const positive = (delta.delta > 0 && delta.goodIfUp) || (delta.delta < 0 && !delta.goodIfUp);
  const flat = Math.abs(delta.pct) < 0.5;
  const accent = flat ? "border-white/10" : positive ? "border-emerald-500/30" : "border-rose-500/30";
  const Arrow = flat ? Minus : (delta.delta > 0 ? ArrowUp : ArrowDown);
  const arrowColor = flat ? "text-zinc-500" : positive ? "text-emerald-400" : "text-rose-400";

  return (
    <Card className={cn(accent)}>
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">{delta.label}</p>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-xs text-zinc-500 line-through tabular-numeric">{fmtValue(delta.before, delta.format)}</span>
          <ArrowRight className="h-3 w-3 text-zinc-600" />
          <span className={cn(
            "text-xl font-bold tabular-numeric",
            flat ? "text-white" : positive ? "text-emerald-300" : "text-rose-300"
          )}>{fmtValue(delta.after, delta.format)}</span>
        </div>
        <div className={cn("inline-flex items-center gap-1 text-xs font-semibold tabular-numeric", arrowColor)}>
          <Arrow className="h-3 w-3" />
          {delta.pct > 0 ? "+" : ""}{delta.pct.toFixed(1)}%
        </div>
      </CardContent>
    </Card>
  );
}

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
          <p className={cn("eyebrow", accentColor)}>{title}</p>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}
