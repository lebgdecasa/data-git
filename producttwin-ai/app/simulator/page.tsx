"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { NextStep } from "@/components/layout/next-step";
import { EmptyProfile } from "@/components/layout/empty-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sparkles, RotateCcw, ArrowRight, ArrowDown, ArrowUp, Minus,
  Save, Trash2, ChevronDown, Calculator, X, Plus,
  Zap, DollarSign, Repeat, TrendingUp, Megaphone, ShieldCheck, Layers,
} from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import {
  runScenario, defaultScenarioInputs,
  type ScenarioInputs, type ScenarioResults, type ScenarioDelta,
  type ComplianceInvestment, type FeatureComplexity,
} from "@/lib/profile";

// ─── Decision dictionary ──────────────────────────────────────────────────

type DecisionKey =
  | "onboarding" | "activation" | "churn"
  | "pricing" | "marketing" | "compliance" | "complexity";

type DecisionDef = {
  key: DecisionKey;
  label: string;
  description: string;
  Icon: React.ElementType;
  color: string;
};

const DECISIONS: DecisionDef[] = [
  { key: "onboarding", label: "Reduce onboarding steps",      Icon: Zap,          color: "text-violet-300",  description: "Highest leverage if activation is weak" },
  { key: "activation", label: "Improve activation directly",  Icon: Sparkles,     color: "text-indigo-300",  description: "For when onboarding isn't the issue" },
  { key: "churn",      label: "Reduce churn",                 Icon: Repeat,       color: "text-emerald-300", description: "Compounds into LTV; slow but powerful" },
  { key: "pricing",    label: "Raise pricing",                Icon: DollarSign,   color: "text-amber-300",   description: "Quick MRR lift, watch for churn" },
  { key: "marketing",  label: "Increase marketing budget",    Icon: Megaphone,    color: "text-pink-300",    description: "Only pays off if activation is healthy" },
  { key: "compliance", label: "Invest in compliance",         Icon: ShieldCheck,  color: "text-cyan-300",    description: "Unlocks enterprise; short-term drag" },
  { key: "complexity", label: "Change feature complexity",    Icon: Layers,       color: "text-zinc-300",    description: "Affects execution risk and churn" },
];

// Reset inputs to defaults except for the one named decision (preserves it)
function inputsForSingleDecision(
  base: ScenarioInputs,
  current: ScenarioInputs,
  key: DecisionKey,
): ScenarioInputs {
  return {
    ...base,
    reduceOnboardingTo:        key === "onboarding" ? current.reduceOnboardingTo        : base.reduceOnboardingTo,
    improveActivationBy:       key === "activation" ? current.improveActivationBy       : 0,
    reduceChurnBy:             key === "churn"      ? current.reduceChurnBy             : 0,
    increasePricingBy:         key === "pricing"    ? current.increasePricingBy         : 0,
    increaseMarketingBudgetBy: key === "marketing"  ? current.increaseMarketingBudgetBy : 0,
    complianceInvestment:      key === "compliance" ? current.complianceInvestment      : "None",
    featureComplexity:         key === "complexity" ? current.featureComplexity         : "Medium",
  };
}

// ─── Formatters ────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtValue(n: number, format: string): string {
  if (format === "currency") return fmtCurrency(n);
  if (format === "percent")  return `${n.toFixed(1)}%`;
  if (format === "score")    return `${Math.round(n)}`;
  return Math.round(n).toLocaleString();
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function SimulationsPage() {
  const profile = useProfileStore((s) => s.profile);
  const populated = isProfilePopulated(profile);
  const loadDemo = useProfileStore((s) => s.loadDemo);
  const lastScenario = useProfileStore((s) => s.lastScenario);
  const setLastScenario = useProfileStore((s) => s.setLastScenario);
  const savedScenarios = useProfileStore((s) => s.savedScenarios);
  const saveScenario = useProfileStore((s) => s.saveScenario);
  const deleteScenario = useProfileStore((s) => s.deleteScenario);

  // Active decision (the single thing the user is testing)
  const [decisionKey, setDecisionKey] = useState<DecisionKey | null>(null);
  const [stacked, setStacked] = useState<DecisionKey[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inputs, setInputs] = useState<ScenarioInputs>(() => defaultScenarioInputs(profile));
  const [scenarioName, setScenarioName] = useState("");
  const [showFormulas, setShowFormulas] = useState(false);

  // Keep onboarding lever capped to profile.onboardingSteps when profile changes
  useEffect(() => {
    setInputs((p) => ({
      ...p,
      reduceOnboardingTo: Math.min(p.reduceOnboardingTo, profile.onboardingSteps || p.reduceOnboardingTo),
    }));
  }, [profile.onboardingSteps]);

  // Active decisions list (primary + stacked)
  const activeKeys = useMemo(() => decisionKey ? [decisionKey, ...stacked] : [], [decisionKey, stacked]);

  // Effective inputs: only the active decisions contribute; others are reset
  const effectiveInputs: ScenarioInputs = useMemo(() => {
    const base = defaultScenarioInputs(profile);
    if (activeKeys.length === 0) return base;
    let next = { ...base };
    for (const key of activeKeys) {
      const merged = inputsForSingleDecision(next, inputs, key);
      next = merged;
    }
    return next;
  }, [profile, inputs, activeKeys]);

  // Live impact projection (updates as inputs change)
  const liveResults: ScenarioResults | null = useMemo(
    () => (populated && activeKeys.length > 0 ? runScenario(profile, effectiveInputs) : null),
    [profile, effectiveInputs, populated, activeKeys.length],
  );

  // Persist last scenario when active decision changes
  useEffect(() => {
    setLastScenario(liveResults);
  }, [liveResults, setLastScenario]);

  // ── Empty state ─────────────────────────────────────────────
  if (!populated) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Simulations"
          title="Test a decision before you ship it"
          description="Pick a decision · see live impact projection. Load a product profile first."
        />
        <EmptyProfile
          pageLabel="Simulations"
          pageDescription="The simulator predicts the impact of your decisions against your saved product data."
        />
      </AppShell>
    );
  }

  const handleSelectDecision = (key: DecisionKey) => {
    setDecisionKey(key);
    setStacked([]);
    setDropdownOpen(false);
  };

  const handleAddStacked = (key: DecisionKey) => {
    if (!stacked.includes(key) && key !== decisionKey) {
      setStacked((s) => [...s, key]);
    }
  };

  const handleRemoveStacked = (key: DecisionKey) => {
    setStacked((s) => s.filter((k) => k !== key));
  };

  const handleReset = () => {
    setDecisionKey(null);
    setStacked([]);
    setInputs(defaultScenarioInputs(profile));
    setLastScenario(null);
  };

  const handleSaveScenario = () => {
    if (!liveResults || !decisionKey) return;
    const name = scenarioName.trim() || `${DECISIONS.find(d => d.key === decisionKey)?.label}`;
    saveScenario(name, effectiveInputs, liveResults);
    setScenarioName("");
  };

  const handleLoadScenario = (s: typeof savedScenarios[number]) => {
    setInputs(s.inputs);
    // Best-effort: detect which lever is non-default and select it
    const detected = detectActiveDecision(s.inputs, defaultScenarioInputs(profile));
    if (detected) setDecisionKey(detected);
    setLastScenario(s.results);
  };

  const decisionDef = decisionKey ? DECISIONS.find((d) => d.key === decisionKey)! : null;
  const availableForStacking = DECISIONS.filter((d) => d.key !== decisionKey && !stacked.includes(d.key));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Simulations"
        title="Test a decision before you ship it"
        description={`Choose a decision below to see its projected impact on ${profile.productName}.`}
        actions={
          activeKeys.length > 0 ? (
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          ) : undefined
        }
      />

      <div className="space-y-6">

        {/* ─────────────────────────────────────────────────────
            Two-column workspace: Decision (left) · Impact (right)
            ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* LEFT — Decision Builder */}
          <Card>
            <CardContent className="p-6">
              <p className="eyebrow mb-3">Decision</p>

              {/* Decision dropdown */}
              <div className="relative mb-5">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition",
                    decisionDef
                      ? "border-violet-500/40 bg-violet-500/[0.06] text-white"
                      : "border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.04] hover:border-white/20"
                  )}
                >
                  {decisionDef ? (
                    <span className="flex items-center gap-2.5">
                      <decisionDef.Icon className={cn("h-4 w-4", decisionDef.color)} />
                      <span className="text-sm font-medium">{decisionDef.label}</span>
                    </span>
                  ) : (
                    <span className="text-sm">Choose a decision to test…</span>
                  )}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-lg border border-white/10 bg-[hsl(240,8%,10%)] shadow-2xl overflow-hidden fade-up">
                    {DECISIONS.map((d) => {
                      const Icon = d.Icon;
                      return (
                        <button
                          key={d.key}
                          onClick={() => handleSelectDecision(d.key)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
                        >
                          <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", d.color)} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">{d.label}</p>
                            <p className="text-[11px] text-zinc-500 leading-snug">{d.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active control for the selected decision */}
              {decisionDef && (
                <div className="space-y-4 fade-up">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{decisionDef.description}</p>
                  <ActiveControl
                    decisionKey={decisionKey!}
                    inputs={inputs}
                    setInputs={setInputs}
                    profileOnboardingSteps={profile.onboardingSteps}
                  />
                </div>
              )}

              {/* Stacked decisions */}
              {activeKeys.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <p className="eyebrow mb-3">Stacked decisions ({stacked.length})</p>
                  <div className="space-y-2">
                    {stacked.map((key) => {
                      const d = DECISIONS.find((x) => x.key === key)!;
                      const Icon = d.Icon;
                      return (
                        <div key={key} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 fade-up">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2 text-sm text-white font-medium">
                              <Icon className={cn("h-3.5 w-3.5", d.color)} />
                              {d.label}
                            </span>
                            <button
                              onClick={() => handleRemoveStacked(key)}
                              className="text-zinc-500 hover:text-rose-400 transition-colors"
                              aria-label="Remove"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <ActiveControl
                            decisionKey={key}
                            inputs={inputs}
                            setInputs={setInputs}
                            profileOnboardingSteps={profile.onboardingSteps}
                            compact
                          />
                        </div>
                      );
                    })}
                  </div>

                  {availableForStacking.length > 0 && (
                    <details className="mt-3 group">
                      <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 list-none flex items-center gap-1.5">
                        <Plus className="h-3 w-3" />
                        Add another decision
                      </summary>
                      <div className="mt-2 space-y-1">
                        {availableForStacking.map((d) => {
                          const Icon = d.Icon;
                          return (
                            <button
                              key={d.key}
                              onClick={() => handleAddStacked(d.key)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                            >
                              <Icon className={cn("h-3.5 w-3.5", d.color)} />
                              <span>{d.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT — Live Impact */}
          <Card className={cn(liveResults ? "border-violet-500/20 glass-elevated" : "")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="eyebrow text-violet-300">Projected Impact</p>
                {liveResults && (
                  <span className="text-[10px] text-zinc-500 italic">Updates live</span>
                )}
              </div>

              {!liveResults ? (
                <div className="text-center py-12">
                  <Sparkles className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Choose a decision on the left to see the projection.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {liveResults.deltas.map((d) => <ImpactRow key={d.key} delta={d} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Why this works + save + saved scenarios */}
        {liveResults && (
          <>
            {/* Recommendation card */}
            <Card className="glass-elevated">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="eyebrow mb-1.5 text-violet-300">Why this works</p>
                  <p className="text-sm text-white leading-relaxed">{liveResults.recommendation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Save scenario */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  type="text"
                  placeholder="Name this scenario (optional)"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="h-9 text-sm max-w-xs"
                />
                <Button size="sm" variant="outline" onClick={handleSaveScenario}>
                  <Save className="h-3.5 w-3.5" />
                  Save scenario
                </Button>
              </div>
              <span className="text-[11px] text-zinc-500">{savedScenarios.length} saved</span>
            </div>
          </>
        )}

        {/* Saved scenarios */}
        {savedScenarios.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="eyebrow mb-3">Saved scenarios</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {savedScenarios.map((s) => (
                  <div key={s.id} className="surface-subtle p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                      <p className="text-[11px] text-zinc-500 tabular-numeric">
                        {fmtCurrency(s.results.after.mrr)} MRR · {s.results.after.churn.toFixed(1)}% churn · health {s.results.after.healthScore}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleLoadScenario(s)}>Load</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteScenario(s.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How this is calculated */}
        <Card>
          <CardContent className="p-5">
            <button
              type="button"
              onClick={() => setShowFormulas((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-medium text-white">How is this calculated?</span>
              </span>
              <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", showFormulas && "rotate-180")} />
            </button>
            {showFormulas && (
              <div className="mt-4 space-y-2 text-sm text-zinc-300 leading-relaxed fade-up">
                <p>Deterministic, rule-based. No external API.</p>
                <ul className="list-disc pl-5 text-zinc-400 space-y-1.5">
                  <li><span className="text-white">Lower onboarding steps</span> → activation ↑ (~4pp per step removed)</li>
                  <li><span className="text-white">Higher activation</span> → retention ↑ and churn ↓ (halo)</li>
                  <li><span className="text-white">Lower churn</span> → LTV ↑ (LTV = ARPU / churn)</li>
                  <li><span className="text-white">Price increase</span> → ARPU ↑ + small churn penalty</li>
                  <li><span className="text-white">Marketing budget</span> → users ↑ (×0.5) + CAC ↑ sublinearly</li>
                  <li><span className="text-white">Compliance investment</span> → enterprise risk ↓, short-term churn drag</li>
                  <li><span className="text-white">Feature complexity</span> → execution risk ↑ + churn drag</li>
                </ul>
                <p className="text-xs text-zinc-500 italic mt-2">
                  This is structured thought, not prediction. Use it to compare directions, not to forecast outcomes precisely.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <NextStep
        label="Turn this into an action item"
        description="When you've found a decision worth committing to, the Insights page is where it becomes a tracked task."
        href="/recommendations"
        disabled={!liveResults}
        disabledHint={!liveResults ? "Choose a decision first." : undefined}
      />
    </AppShell>
  );
}

// ─── Active control — surfaces the right UI for the chosen decision ──────

function ActiveControl({
  decisionKey, inputs, setInputs, profileOnboardingSteps, compact,
}: {
  decisionKey: DecisionKey;
  inputs: ScenarioInputs;
  setInputs: React.Dispatch<React.SetStateAction<ScenarioInputs>>;
  profileOnboardingSteps: number;
  compact?: boolean;
}) {
  const labelClass = "text-xs uppercase tracking-wider text-zinc-500 font-semibold";

  if (decisionKey === "onboarding") {
    const max = Math.max(1, profileOnboardingSteps || 7);
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className={labelClass}>Steps · from {profileOnboardingSteps || "—"} to</p>
          <span className="text-xl font-semibold text-white tabular-numeric">{inputs.reduceOnboardingTo}</span>
        </div>
        <input
          type="range"
          min={1}
          max={max}
          value={inputs.reduceOnboardingTo}
          onChange={(e) => setInputs((p) => ({ ...p, reduceOnboardingTo: Number(e.target.value) }))}
          className="w-full accent-violet-500"
        />
      </div>
    );
  }

  if (decisionKey === "activation") {
    return (
      <ValueInput
        label="Activation lift"
        suffix="pp"
        max={50}
        value={inputs.improveActivationBy}
        onChange={(v) => setInputs((p) => ({ ...p, improveActivationBy: v }))}
      />
    );
  }

  if (decisionKey === "churn") {
    return (
      <ValueInput
        label="Reduce churn by"
        suffix="%"
        max={80}
        value={inputs.reduceChurnBy}
        onChange={(v) => setInputs((p) => ({ ...p, reduceChurnBy: v }))}
      />
    );
  }

  if (decisionKey === "pricing") {
    return (
      <ValueInput
        label="Increase pricing by"
        suffix="%"
        max={100}
        value={inputs.increasePricingBy}
        onChange={(v) => setInputs((p) => ({ ...p, increasePricingBy: v }))}
      />
    );
  }

  if (decisionKey === "marketing") {
    return (
      <ValueInput
        label="Increase marketing budget by"
        suffix="%"
        max={200}
        value={inputs.increaseMarketingBudgetBy}
        onChange={(v) => setInputs((p) => ({ ...p, increaseMarketingBudgetBy: v }))}
      />
    );
  }

  if (decisionKey === "compliance") {
    return (
      <SegmentedControl
        label="Compliance investment"
        value={inputs.complianceInvestment}
        options={["None", "Light", "Moderate", "Heavy"] as ComplianceInvestment[]}
        onChange={(v) => setInputs((p) => ({ ...p, complianceInvestment: v as ComplianceInvestment }))}
      />
    );
  }

  if (decisionKey === "complexity") {
    return (
      <SegmentedControl
        label="Feature complexity"
        value={inputs.featureComplexity}
        options={["Low", "Medium", "High"] as FeatureComplexity[]}
        onChange={(v) => setInputs((p) => ({ ...p, featureComplexity: v as FeatureComplexity }))}
      />
    );
  }

  return null;
}

function ValueInput({
  label, suffix, max, value, onChange,
}: {
  label: string; suffix: string; max: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{label}</p>
        <span className="text-xl font-semibold text-white tabular-numeric">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-500"
      />
    </div>
  );
}

function SegmentedControl<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-2.5 py-2 rounded-lg text-xs font-medium border transition-all",
              value === opt
                ? "bg-violet-500/20 border-violet-500/50 text-white"
                : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Impact row ───────────────────────────────────────────────────────────

function ImpactRow({ delta }: { delta: ScenarioDelta }) {
  const positive = (delta.delta > 0 && delta.goodIfUp) || (delta.delta < 0 && !delta.goodIfUp);
  const flat = Math.abs(delta.pct) < 0.5;
  const Arrow = flat ? Minus : delta.delta > 0 ? ArrowUp : ArrowDown;
  const color = flat ? "text-zinc-500" : positive ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="flex items-center justify-between gap-2 py-2 px-2 rounded-md hover:bg-white/[0.025] transition-colors">
      <p className="text-xs text-zinc-400 leading-tight w-1/3 truncate">{delta.label}</p>
      <div className="flex items-baseline gap-2 flex-1 justify-end">
        <span className="text-xs text-zinc-500 line-through tabular-numeric">
          {fmtValue(delta.before, delta.format)}
        </span>
        <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />
        <span className={cn(
          "text-base font-semibold tabular-numeric",
          flat ? "text-white" : positive ? "text-emerald-300" : "text-rose-300"
        )}>
          {fmtValue(delta.after, delta.format)}
        </span>
        <div className={cn("flex items-center gap-0.5 text-xs font-semibold tabular-numeric w-16 justify-end", color)}>
          <Arrow className="h-3 w-3" />
          {delta.pct > 0 ? "+" : ""}{delta.pct.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

// ─── Best-effort: which lever was active in a saved scenario? ────────────

function detectActiveDecision(
  inputs: ScenarioInputs,
  defaults: ScenarioInputs,
): DecisionKey | null {
  if (inputs.reduceOnboardingTo !== defaults.reduceOnboardingTo) return "onboarding";
  if (inputs.improveActivationBy > 0) return "activation";
  if (inputs.reduceChurnBy > 0) return "churn";
  if (inputs.increasePricingBy > 0) return "pricing";
  if (inputs.increaseMarketingBudgetBy > 0) return "marketing";
  if (inputs.complianceInvestment !== "None") return "compliance";
  if (inputs.featureComplexity !== "Medium") return "complexity";
  return null;
}
