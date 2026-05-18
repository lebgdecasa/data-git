"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { NextStep } from "@/components/layout/next-step";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Sparkles, AlertTriangle, CheckCircle2, ArrowRight, RotateCcw, Trash2,
  Database, Info, Loader2, FileText, Briefcase, BarChart3,
  Users as UsersIcon, ShieldCheck,
} from "lucide-react";
import { useProfileStore } from "@/lib/profile-store";
import {
  generateAudit,
  profileCompleteness,
  EMPTY_PROFILE,
  type ProductProfile,
  type ComplianceSensitivity,
} from "@/lib/profile";

// ─── Field helpers ────────────────────────────────────────────────────────────

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <p className="text-xs font-semibold text-zinc-300">{label}</p>
      {hint && <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

function Section({
  num, title, Icon, color, children,
}: {
  num: string; title: string; Icon: React.ElementType; color: string; children: React.ReactNode;
}) {
  return (
    <Card className="border-white/10">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Section {num}</p>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

const FRAMEWORKS = ["GDPR", "HIPAA", "SOC 2", "ISO 27001", "FDA SaMD", "EU AI Act"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const profile = useProfileStore((s) => s.profile);
  const audit = useProfileStore((s) => s.audit);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const loadDemo = useProfileStore((s) => s.loadDemo);
  const setProfile = useProfileStore((s) => s.setProfile);
  const saveAudit = useProfileStore((s) => s.saveAudit);
  const clearAudit = useProfileStore((s) => s.clearAudit);

  const [loading, setLoading] = useState(false);

  const completion = profileCompleteness(profile);

  const set = (key: keyof ProductProfile, value: string | number | string[] | ComplianceSensitivity) =>
    updateProfile({ [key]: value } as Partial<ProductProfile>);

  const setNum = (key: keyof ProductProfile, raw: string) => {
    const n = Number(raw);
    set(key, Number.isFinite(n) ? n : 0);
  };

  const toggleFramework = (fw: string) => {
    const next = profile.selectedFrameworks.includes(fw)
      ? profile.selectedFrameworks.filter((f) => f !== fw)
      : [...profile.selectedFrameworks, fw];
    set("selectedFrameworks", next);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const result = generateAudit(profile);
      saveAudit(result);
      setLoading(false);
      setTimeout(() => {
        document.getElementById("audit-report")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }, 1400);
  };

  const handleClearProfile = () => {
    if (confirm("Clear all profile data? This cannot be undone.")) {
      setProfile(EMPTY_PROFILE);
      clearAudit();
    }
  };

  const isReady = profile.productName.trim().length > 1 && completion >= 30;

  return (
    <AppShell>
      <PageHeader
        step={1}
        eyebrow="Business Profile"
        title="Define your product"
        description="Tell us about your product. ProductTwin uses this data across the audit, simulator, and final recommendations — everything downstream is calibrated to what you enter here."
        actions={
          <Button size="sm" variant="outline" onClick={loadDemo}>
            <Database className="h-3.5 w-3.5" />
            Load NutriFlow Demo
          </Button>
        }
      />

      <div className="space-y-6">

        {/* ── Completion progress ─────────────────────────────────── */}
        <Card className="border-white/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-zinc-300">Profile completion</p>
                <p className="text-xs text-zinc-400 tabular-nums">{completion}%</p>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    completion >= 80 ? "bg-emerald-500" :
                    completion >= 40 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                {completion < 30 ? "Fill at least 30% to generate a meaningful audit." :
                 completion < 70 ? "Good start. Fill more fields for a sharper audit." :
                 "Profile is well-populated. Audit will be accurate."}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={handleClearProfile} className="shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </CardContent>
        </Card>

        {/* ── SECTION 1: Product Context ─────────────────────────── */}
        <Section num="1" title="Product Context" Icon={FileText} color="bg-indigo-600/80">
          <div>
            <FieldLabel label="Product name" hint="The name customers know your product by." />
            <Input value={profile.productName} onChange={(e) => set("productName", e.target.value)} placeholder="e.g., NutriFlow" />
          </div>
          <div>
            <FieldLabel label="Industry" hint="The market category you operate in." />
            <Input value={profile.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g., Digital Health / Nutrition SaaS" />
          </div>
          <div>
            <FieldLabel label="Product type" hint="B2B SaaS, B2C SaaS, marketplace, mobile app, etc." />
            <Input value={profile.productType} onChange={(e) => set("productType", e.target.value)} placeholder="e.g., B2C SaaS" />
          </div>
          <div>
            <FieldLabel label="Target customer" hint="Who specifically you build for. Be precise." />
            <Input value={profile.targetCustomer} onChange={(e) => set("targetCustomer", e.target.value)} placeholder="e.g., Busy professionals aged 25-45 improving metabolic health" />
          </div>
        </Section>

        {/* ── SECTION 2: Business Model ──────────────────────────── */}
        <Section num="2" title="Business Model" Icon={Briefcase} color="bg-emerald-600/80">
          <div className="md:col-span-2">
            <FieldLabel label="Business model" hint="How you make money. e.g., Freemium + subscription, transactional, usage-based." />
            <Input value={profile.businessModel} onChange={(e) => set("businessModel", e.target.value)} placeholder="e.g., Freemium + subscription + enterprise pilots" />
          </div>
          <div className="md:col-span-2">
            <FieldLabel label="Pricing model" hint="Concrete tiers and prices, not categories." />
            <Input value={profile.pricingModel} onChange={(e) => set("pricingModel", e.target.value)} placeholder="e.g., Free, Pro $19/mo, Premium $49/mo, Enterprise custom" />
          </div>
        </Section>

        {/* ── SECTION 3: Product Metrics ─────────────────────────── */}
        <Section num="3" title="Product Metrics" Icon={BarChart3} color="bg-amber-600/80">
          <div>
            <FieldLabel label="MRR ($)" hint="Monthly Recurring Revenue." />
            <Input type="number" min={0} value={profile.mrr || ""} onChange={(e) => setNum("mrr", e.target.value)} placeholder="62000" />
          </div>
          <div>
            <FieldLabel label="ARR ($)" hint="MRR × 12." />
            <Input type="number" min={0} value={profile.arr || ""} onChange={(e) => setNum("arr", e.target.value)} placeholder="744000" />
          </div>
          <div>
            <FieldLabel label="Paying users" hint="Total count on a paid plan." />
            <Input type="number" min={0} value={profile.payingUsers || ""} onChange={(e) => setNum("payingUsers", e.target.value)} placeholder="2470" />
          </div>
          <div>
            <FieldLabel label="ARPU ($)" hint="MRR / paying users per month." />
            <Input type="number" min={0} step={0.1} value={profile.arpu || ""} onChange={(e) => setNum("arpu", e.target.value)} placeholder="25.1" />
          </div>
          <div>
            <FieldLabel label="CAC ($)" hint="Customer Acquisition Cost." />
            <Input type="number" min={0} value={profile.cac || ""} onChange={(e) => setNum("cac", e.target.value)} placeholder="48" />
          </div>
          <div>
            <FieldLabel label="LTV ($)" hint="Lifetime Value = ARPU / monthly churn." />
            <Input type="number" min={0} value={profile.ltv || ""} onChange={(e) => setNum("ltv", e.target.value)} placeholder="310" />
          </div>
          <div>
            <FieldLabel label="Monthly churn rate (%)" hint="% of paying users lost each month." />
            <Input type="number" min={0} max={100} step={0.1} value={profile.churnRate || ""} onChange={(e) => setNum("churnRate", e.target.value)} placeholder="8.5" />
          </div>
          <div>
            <FieldLabel label="Activation rate (%)" hint="% of signups who reach the 'aha' moment." />
            <Input type="number" min={0} max={100} value={profile.activationRate || ""} onChange={(e) => setNum("activationRate", e.target.value)} placeholder="36" />
          </div>
          <div>
            <FieldLabel label="30-day retention (%)" hint="% of new signups still active at day 30." />
            <Input type="number" min={0} max={100} value={profile.retentionRate30 || ""} onChange={(e) => setNum("retentionRate30", e.target.value)} placeholder="43" />
          </div>
        </Section>

        {/* ── SECTION 4: UX Friction ─────────────────────────────── */}
        <Section num="4" title="UX Friction" Icon={UsersIcon} color="bg-rose-600/80">
          <div>
            <FieldLabel label="Onboarding steps" hint="Distinct steps before the user sees value." />
            <Input type="number" min={0} value={profile.onboardingSteps || ""} onChange={(e) => setNum("onboardingSteps", e.target.value)} placeholder="7" />
          </div>
          <div>
            <FieldLabel label="Onboarding completion (%)" hint="% who complete all onboarding steps." />
            <Input type="number" min={0} max={100} value={profile.onboardingCompletion || ""} onChange={(e) => setNum("onboardingCompletion", e.target.value)} placeholder="41" />
          </div>
          <div>
            <FieldLabel label="Time to first value (days)" hint="How long until a new user sees value." />
            <Input type="number" min={0} step={0.1} value={profile.timeToFirstValue || ""} onChange={(e) => setNum("timeToFirstValue", e.target.value)} placeholder="3.8" />
          </div>
          <div></div>
          <div className="md:col-span-2">
            <FieldLabel label="Main user friction" hint="The single biggest UX problem your users hit. One sentence." />
            <Input value={profile.mainUserFriction} onChange={(e) => set("mainUserFriction", e.target.value)} placeholder="Users feel overwhelmed during onboarding and fail to experience value quickly." />
          </div>
          <div className="md:col-span-2">
            <FieldLabel label="Biggest business challenge" hint="The strategic challenge keeping leadership up at night." />
            <Input value={profile.biggestBusinessChallenge} onChange={(e) => set("biggestBusinessChallenge", e.target.value)} placeholder="Strong acquisition but weak activation and retention." />
          </div>
        </Section>

        {/* ── SECTION 5: Risk & Compliance ───────────────────────── */}
        <Section num="5" title="Risk & Compliance" Icon={ShieldCheck} color="bg-violet-600/80">
          <div>
            <FieldLabel label="Compliance sensitivity" hint="Health/finance = High. Productivity = Low." />
            <div className="flex gap-2">
              {(["Low", "Medium", "High"] as ComplianceSensitivity[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => set("complianceSensitivity", level)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    profile.complianceSensitivity === level
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                      : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel label="Compliance readiness (0-100)" hint="Self-assessed readiness for security/regulatory review." />
            <Input type="number" min={0} max={100} value={profile.complianceReadiness || ""} onChange={(e) => setNum("complianceReadiness", e.target.value)} placeholder="42" />
          </div>
          <div>
            <FieldLabel label="Roadmap complexity (0-100)" hint="How complex is your active build pipeline? Higher = more risk." />
            <Input type="number" min={0} max={100} value={profile.roadmapComplexity || ""} onChange={(e) => setNum("roadmapComplexity", e.target.value)} placeholder="74" />
          </div>
          <div></div>
          <div className="md:col-span-2">
            <FieldLabel label="Relevant frameworks" hint="Which standards apply to your product?" />
            <div className="flex flex-wrap gap-2">
              {FRAMEWORKS.map((fw) => {
                const active = profile.selectedFrameworks.includes(fw);
                return (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => toggleFramework(fw)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      active
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                        : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]"
                    )}
                  >
                    {fw}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── Generate button ─────────────────────────────────────── */}
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-purple-950/20">
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-white">Ready to generate your audit?</p>
              <p className="text-xs text-zinc-400">
                ProductTwin will analyse 5 dimensions, surface risks, and recommend the next action.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={!isReady || loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing your product...
                </>
              ) : audit ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Regenerate Audit
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Audit
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Audit Report ────────────────────────────────────────── */}
        {audit && (
          <div id="audit-report" className="space-y-5 fade-up">
            {/* Header strip */}
            <Card className="border-white/10">
              <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <ScoreRing score={audit.overallScore} />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Audit Score</p>
                    <p className="text-3xl font-bold text-white tabular-nums">
                      {audit.overallScore}<span className="text-base text-zinc-400 font-normal"> / 100</span>
                    </p>
                    <Badge className="mt-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/40">{audit.band}</Badge>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      Last updated {new Date(audit.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading}>
                    <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearAudit}>
                    <Trash2 className="h-3.5 w-3.5" /> Clear Audit
                  </Button>
                  <Link href="/simulator">
                    <Button size="sm">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Use this data in Scenario Simulator
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {audit.dimensions.map((d) => (
                <Card key={d.name} className="border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-zinc-300">{d.name}</p>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-bold border",
                        d.band === "Strong" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : d.band === "Moderate" ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        : "bg-rose-500/15 text-rose-300 border-rose-500/40"
                      )}>{d.band}</span>
                    </div>
                    <p className="text-2xl font-bold text-white tabular-nums mb-1">{d.score}<span className="text-xs text-zinc-500 font-normal"> / 100</span></p>
                    <div className="h-1 rounded-full bg-white/5 mb-2 overflow-hidden">
                      <div className={cn(
                        "h-full rounded-full",
                        d.band === "Strong" ? "bg-emerald-500" : d.band === "Moderate" ? "bg-amber-500" : "bg-rose-500"
                      )} style={{ width: `${d.score}%` }} />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{d.insight}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risks + Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-rose-500/20">
                <CardContent className="p-5">
                  <p className="text-[10px] uppercase tracking-wider text-rose-300 font-bold mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Top Risks
                  </p>
                  <div className="space-y-3">
                    {audit.risks.map((r, i) => (
                      <div key={i} className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white">{r.title}</p>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                            r.severity === "High" ? "bg-rose-500/20 text-rose-300"
                            : r.severity === "Medium" ? "bg-amber-500/20 text-amber-300"
                            : "bg-zinc-500/20 text-zinc-300"
                          )}>{r.severity}</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{r.implication}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20">
                <CardContent className="p-5">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Opportunities
                  </p>
                  <div className="space-y-3">
                    {audit.opportunities.map((o, i) => (
                      <div key={i} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          <p className="text-sm font-semibold text-white">{o.title}</p>
                          <div className="flex gap-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{o.effort} effort</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">{o.impact} impact</span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{o.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next action */}
            <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/30">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">Recommended Next Action</p>
                  <p className="text-sm text-white leading-relaxed mb-3">{audit.recommendedNextAction}</p>
                  <Link href="/simulator">
                    <Button size="sm">
                      Simulate this in the Scenario Simulator
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo data note */}
        {!audit && (
          <div className="flex items-start gap-2 text-xs text-zinc-500 leading-relaxed">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>
              Your data is saved automatically in your browser. It persists across page reloads.
              Click "Load NutriFlow Demo" above to see a complete example.
            </p>
          </div>
        )}

      </div>

      <NextStep
        label={audit ? "See your strategic dashboard" : "Generate your audit"}
        description={
          audit
            ? "Review your scored diagnosis and identify the biggest bottleneck before simulating changes."
            : "Fill at least 30% of the profile, then generate your audit to unlock the rest of the journey."
        }
        href={audit ? "/dashboard" : "#"}
        disabled={!audit}
        disabledHint={!audit ? "Complete your profile and click 'Generate Audit' first." : undefined}
      />
    </AppShell>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const size = 80;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff0d" strokeWidth={size * 0.09} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.09} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold tabular-nums text-xl">{score}</span>
      </div>
    </div>
  );
}
