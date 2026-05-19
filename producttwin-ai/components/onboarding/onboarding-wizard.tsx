"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkle, Sparkles, ArrowRight, ArrowLeft, Database, Check } from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import {
  EMPTY_PROFILE, NUTRIFLOW_PROFILE, generateAudit,
  type ProductProfile,
} from "@/lib/profile";
import {
  computeCompositeBusinessScore, computeAllSectionScores, generateActionItems,
} from "@/lib/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * 4-screen onboarding wizard per NIKA spec.
 * Does NOT explain features. Collects 5 inputs, generates value immediately.
 *
 * Screen 1 - Product name
 * Screen 2 - Stage + Type (preselected)
 * Screen 3 - MRR + Churn + Activation
 * Screen 4 - The reveal: composite + bottleneck + first recommended move
 */
export function OnboardingWizard() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const hasSeenWelcome = useProfileStore((s) => s.hasSeenWelcome);
  const markSeen = useProfileStore((s) => s.markWelcomeSeen);
  const setProfile = useProfileStore((s) => s.setProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const loadDemo = useProfileStore((s) => s.loadDemo);
  const saveAudit = useProfileStore((s) => s.saveAudit);
  const addActionItems = useProfileStore((s) => s.addActionItems);
  const logKpiSnapshot = useProfileStore((s) => s.logKpiSnapshot);

  const populated = isProfilePopulated(profile);
  const show = !hasSeenWelcome && !populated;

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({
    productName: "",
    productType: "B2B SaaS" as string,
    stage: "Early growth" as string,
    mrr: "" as string | number,
    churnRate: "" as string | number,
    activationRate: "" as string | number,
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") markSeen(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [show, markSeen]);

  // Compute reveal data based on draft inputs
  const previewProfile: ProductProfile = useMemo(() => ({
    ...EMPTY_PROFILE,
    productName: draft.productName || "Your product",
    productType: draft.productType,
    mrr: Number(draft.mrr) || 0,
    arr: (Number(draft.mrr) || 0) * 12,
    churnRate: Number(draft.churnRate) || 0,
    activationRate: Number(draft.activationRate) || 0,
    // Reasonable inferences from the 3 numbers
    payingUsers: Math.max(50, Math.round((Number(draft.mrr) || 0) / 25)),
    arpu: 25,
    cac: 50,
    ltv: Number(draft.churnRate) > 0 ? Math.round(25 / (Number(draft.churnRate) / 100)) : 300,
    retentionRate30: Math.max(20, (Number(draft.activationRate) || 30) + 8),
    onboardingSteps: 5,
    onboardingCompletion: 50,
    timeToFirstValue: 2,
    complianceSensitivity: "Medium",
    complianceReadiness: 55,
    roadmapComplexity: 55,
  }), [draft]);

  const compositeScore = useMemo(() => computeCompositeBusinessScore(previewProfile), [previewProfile]);
  const weakest = useMemo(() => {
    const scores = computeAllSectionScores(previewProfile);
    return [...scores].sort((a, b) => a.score - b.score)[0];
  }, [previewProfile]);
  const suggestedMove = useMemo(() => suggestMove(previewProfile), [previewProfile]);

  if (!show) return null;

  const handleLoadDemo = () => {
    loadDemo();
    markSeen();
  };

  const canContinue =
    (step === 1 && draft.productName.trim().length > 1) ||
    (step === 2) ||
    (step === 3 && Number(draft.mrr) > 0) ||
    step === 4;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setProfile(previewProfile);
      const result = generateAudit(previewProfile);
      saveAudit(result, compositeScore);
      logKpiSnapshot();
      const items = generateActionItems(previewProfile);
      addActionItems(items);
      setGenerating(false);
      setStep(4);
    }, 1000);
  };

  const handleFinish = () => {
    markSeen();
    router.push("/dashboard");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 fade-up"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[hsl(240,10%,5%)]/95 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_400px_at_top,hsl(260_50%_15%/0.4),transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-xl">

        {/* Header bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center">
              <Sparkle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">NIKA</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">Decision Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <span
                  key={s}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    step === s ? "w-8 bg-violet-400"
                    : step > s ? "w-5 bg-emerald-400/70"
                    : "w-5 bg-white/10"
                  )}
                />
              ))}
            </div>
            <button
              onClick={handleLoadDemo}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip · Load demo
            </button>
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-white/[0.10] bg-[hsl(240,8%,9%)] shadow-2xl p-8 sm:p-10">

          {/* SCREEN 1 — Product name */}
          {step === 1 && (
            <div className="fade-up">
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
                What are you building?
              </h1>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Give your product a name. We'll use it everywhere.
              </p>
              <Input
                value={draft.productName}
                onChange={(e) => setDraft((d) => ({ ...d, productName: e.target.value }))}
                placeholder="e.g., NutriFlow"
                autoFocus
                className="h-12 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canContinue) setStep(2);
                }}
              />
              <div className="flex justify-end mt-8">
                <Button size="lg" disabled={!canContinue} onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 2 — Stage + Type */}
          {step === 2 && (
            <div className="fade-up">
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
                What stage and type?
              </h1>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                Helps us calibrate your benchmarks correctly.
              </p>

              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Stage</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Pre-revenue", "Early growth", "Scaling"].map((s) => (
                      <PillChoice
                        key={s}
                        label={s}
                        selected={draft.stage === s}
                        onClick={() => setDraft((d) => ({ ...d, stage: s }))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["B2C SaaS", "B2B SaaS", "Marketplace"].map((t) => (
                      <PillChoice
                        key={t}
                        label={t}
                        selected={draft.productType === t}
                        onClick={() => setDraft((d) => ({ ...d, productType: t }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-10">
                <Button size="lg" variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 3 — Three numbers */}
          {step === 3 && (
            <div className="fade-up">
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
                Three numbers and we can give you a real diagnosis
              </h1>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                If you don't have these yet, skip and load the demo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">MRR</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                    <Input
                      type="number"
                      value={draft.mrr}
                      onChange={(e) => setDraft((d) => ({ ...d, mrr: e.target.value }))}
                      placeholder="30,000"
                      className="h-11 pl-6 tabular-numeric"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Monthly churn</p>
                  <div className="relative">
                    <Input
                      type="number"
                      step={0.1}
                      value={draft.churnRate}
                      onChange={(e) => setDraft((d) => ({ ...d, churnRate: e.target.value }))}
                      placeholder="6"
                      className="h-11 pr-6 tabular-numeric"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Activation</p>
                  <div className="relative">
                    <Input
                      type="number"
                      value={draft.activationRate}
                      onChange={(e) => setDraft((d) => ({ ...d, activationRate: e.target.value }))}
                      placeholder="45"
                      className="h-11 pr-6 tabular-numeric"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-600 mt-3 text-center">
                Placeholder values are industry benchmarks for {draft.productType}.
              </p>

              <div className="flex justify-between mt-10">
                <Button size="lg" variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  size="lg"
                  disabled={!canContinue || generating}
                  onClick={handleGenerate}
                >
                  {generating ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      Generate my diagnosis
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 4 — The reveal */}
          {step === 4 && (
            <div className="fade-up text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-violet-300 font-semibold mb-3">
                Your diagnosis is ready
              </p>
              <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
                Here's what we found about {previewProfile.productName}
              </h1>
              <p className="text-sm text-zinc-400 mb-8">
                A first look. Refine it any time in Analysis.
              </p>

              {/* Composite + bottleneck side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-6 text-left">
                  <p className="eyebrow mb-2">Composite Health</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-semibold text-white tabular-numeric">{compositeScore}</p>
                    <p className="text-sm text-zinc-500">/ 100</p>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    {compositeScore >= 70 ? "Strong with focused refinement"
                    : compositeScore >= 50 ? "Healthy with structural risks"
                    : "Fragile — act on the bottleneck"}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-6 text-left">
                  <p className="eyebrow mb-2 text-rose-300">Weakest Dimension</p>
                  <p className="text-2xl font-semibold text-white mb-1">
                    {weakest.sectionId.charAt(0).toUpperCase() + weakest.sectionId.slice(1)}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{weakest.insight}</p>
                </div>
              </div>

              {/* Recommended move */}
              <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.05] p-6 text-left mb-6">
                <p className="eyebrow text-violet-300 mb-2">Most promising move to test</p>
                <p className="text-base text-white leading-relaxed">{suggestedMove}</p>
              </div>

              <Button size="lg" onClick={handleFinish} className="w-full sm:w-auto">
                Open my dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-[11px] text-zinc-600 mt-6">
                The AI assistant (bottom-right) can answer any question about your diagnosis.
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        {step < 4 && (
          <p className="text-[11px] text-zinc-600 text-center mt-6">
            Your data stays in your browser. No backend, no account, no tracking.
          </p>
        )}
      </div>
    </div>
  );
}

function PillChoice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-lg text-sm font-medium border transition-all",
        selected
          ? "bg-violet-500/20 border-violet-500/50 text-white"
          : "bg-white/[0.025] border-white/10 text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
      )}
    >
      {selected && <Check className="inline h-3 w-3 mr-1" />}
      {label}
    </button>
  );
}

function suggestMove(p: ProductProfile): string {
  if (p.activationRate > 0 && p.activationRate < 45) {
    return `Reduce onboarding from your current setup down to 3 steps. With activation at ${p.activationRate}%, each step removed could lift activation by ~4pp and compound across retention and LTV. The Simulator can model the exact impact.`;
  }
  if (p.churnRate > 7) {
    return `Cut churn through better early engagement. At ${p.churnRate}% monthly churn you're losing ~${Math.round((1 - Math.pow(1 - p.churnRate / 100, 12)) * 100)}% of customers per year. Try the "reduce churn" lever in the Simulator.`;
  }
  if (p.activationRate >= 45 && p.churnRate <= 5) {
    return `Your fundamentals are healthy. The highest-leverage next test is pricing — try simulating a 15-20% increase to see the MRR uplift and the small churn penalty.`;
  }
  return `Test the activation lever first — it's the most common growth bottleneck and the simulator can quantify the impact in seconds.`;
}
