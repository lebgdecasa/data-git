"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Activity,
  TrendingDown,
  Repeat,
  Target,
  ShieldCheck,
  Calendar,
  Rocket,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Linkedin,
  RotateCcw,
  Check,
  Copy,
  FileText,
} from "lucide-react";

// ─── Strategic Report Data ────────────────────────────────────────────────────

const REPORT = {
  product: "HealthTrack AI",
  industry: "Digital Health · B2C SaaS",
  stage: "Early Growth (Series Seed)",
  date: "May 2026",
  preparedBy: "ProductTwin",

  executiveSummary:
    "HealthTrack AI shows strong unit economics (LTV/CAC 10×) and accelerating MRR growth (+53% over 6 months), but is structurally constrained by weak activation (38%) and rising churn (7.5%). Compliance and audit readiness are the lowest-scoring dimensions and will block enterprise expansion until addressed. The product is in a critical 90-day window where fixing the activation funnel will compound across retention, LTV, and CAC payback - before any further acquisition spend.",

  health: {
    score: 67,
    band: "Healthy with structural risks",
    strengths: [
      "LTV/CAC at 10× - strong unit economics",
      "MRR up 53% in 6 months - accelerating growth",
      "CAC down 18% while CVR improved - efficient acquisition",
    ],
    weaknesses: [
      "Activation at 38% - 62% of trials produce no revenue",
      "Churn climbed to 7.5% (+1.4pp) - compresses LTV",
      "30-day retention at 34% - 11pp below industry average",
    ],
  },

  growthBottleneck: {
    title: "Activation funnel collapse between Day 1 and Day 7",
    metric: "Only 38% of trial signups reach activation",
    impact: "Adding $1 to acquisition spend without fixing activation wastes $0.62 of it",
    rootCause:
      "Onboarding has 6 mandatory steps (industry average is 3). Time-to-value is 3.2 days but most users churn at Day 3-7. The friction points are: wearable sync setup, health-goal configuration, and notification permissions - all front-loaded.",
    leverage:
      "Reducing onboarding steps from 6 → 3 would lift activation an estimated 14pp, compress time-to-value to under 1 day, and reduce early churn by approximately 35%.",
  },

  retentionRisk: {
    title: "Steep cohort decay in the first 7 days",
    metric: "Day 1 → Day 7 retention drops from 100% to 58%",
    diagnosis:
      "The 42-point drop within the first week indicates the product is not delivering its core value moment before users disengage. AI Coach - the highest-value feature - has only 54% adoption because it is gated behind onboarding step 5.",
    fix: "Move the AI Coach to be the first interaction (post-signup), making the 'aha moment' visible within 60 seconds. Defer wearable sync and goal configuration to a soft prompt on Day 2.",
  },

  roadmapPriority: {
    title: "Reduce onboarding steps",
    riceScore: 108,
    rationale:
      "This single change improves activation, retention, time-to-value, and CAC payback simultaneously. RICE score of 108 - 60% higher than the next contender (AI Recommendation Engine, RICE 65). Estimated effort: 2 person-months. Estimated impact: +14pp activation, -25% early churn.",
    runnerUp: "AI recommendation engine personalization (queue as Q3 priority).",
  },

  compliance: {
    enterpriseScore: 54,
    band: "Partially Ready",
    blockers: [
      "Audit readiness at 29/100 - no audit logs, no automated evidence",
      "Compliance program at 38/100 - no DPA templates, no incident response plan",
      "Regulatory exposure at 43/100 - no GDPR, HIPAA, or EU AI Act gap analysis",
    ],
    recommendation:
      "Before any enterprise sales motion, invest in three foundational items: (1) adopt an automated compliance platform (Vanta/Drata) for SOC 2 Type I, (2) draft DPA templates for EU and US buyers, (3) commission a regulatory gap analysis covering HIPAA + EU AI Act.",
  },

  thirtyDayPlan: [
    { owner: "Product", task: "Ship 3-step onboarding (down from 6) - front-load AI Coach", impact: "Activation +14pp" },
    { owner: "Product", task: "Add audit logs for admin actions and PHI access events", impact: "Audit Readiness +18pts" },
    { owner: "Growth", task: "Pause paid acquisition above $30 CAC until activation > 50%", impact: "Save ~$8k/mo CAC waste" },
    { owner: "Engineering", task: "Implement rate limiting on all API routes + enforce MFA", impact: "Security Risk -12 (Low band)" },
    { owner: "GTM", task: "Build referral mechanic with $20 credit - soft-launch to power users", impact: "CAC -15% (organic lift)" },
  ],

  ninetyDayStrategy: [
    {
      pillar: "Retention First",
      desc: "Get 30-day retention from 34% → 45% (industry average). Owner: Product. Measured weekly.",
      Icon: Repeat,
      color: "from-emerald-500 to-teal-600",
    },
    {
      pillar: "Compliance Foundation",
      desc: "Begin SOC 2 Type I evidence collection. Draft DPA templates. Engage healthcare regulatory counsel for HIPAA/EU AI Act mapping.",
      Icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
    },
    {
      pillar: "Disciplined Growth",
      desc: "Hold CAC under $40. Channel mix shifts toward referral (target 20% of new MRR). No new geographies until activation > 55%.",
      Icon: Rocket,
      color: "from-indigo-500 to-purple-600",
    },
    {
      pillar: "Enterprise Pilot Path",
      desc: "Identify 2 design-partner enterprise customers (digital health employers). Co-build compliance evidence as side-effect of sales.",
      Icon: Target,
      color: "from-rose-500 to-pink-600",
    },
  ],

  survivalScore: {
    score: 72,
    band: "Above the Survival Threshold",
    components: [
      { label: "Unit Economics", value: 92, weight: "25%" },
      { label: "Growth Trajectory", value: 78, weight: "20%" },
      { label: "Product-Market Fit", value: 64, weight: "20%" },
      { label: "Retention Health", value: 51, weight: "15%" },
      { label: "Compliance Readiness", value: 54, weight: "10%" },
      { label: "Operational Resilience", value: 68, weight: "10%" },
    ],
    interpretation:
      "At 72/100, HealthTrack AI is above the typical Series-Seed survival threshold of 60. Unit economics and growth trajectory are pulling the score up; retention health and compliance readiness are pulling it down. The 90-day plan above is designed to lift retention and compliance to the 65+ range, which would push the composite into the 80+ 'fundable Series A' band.",
  },

  finalRecommendation:
    "HealthTrack AI recommends prioritizing onboarding simplification before increasing acquisition spend. The current product has strong monetization potential and accelerating revenue, but activation and churn are limiting growth. Compliance readiness should be improved in parallel before targeting enterprise customers - not as an afterthought.",
};

// ─── LinkedIn Summary ─────────────────────────────────────────────────────────

const LINKEDIN_SUMMARY = `🎯 Strategic product diagnosis I ran on HealthTrack AI using ProductTwin:

📊 The numbers:
• MRR up 53% in 6 months
• LTV/CAC at 10× (excellent unit economics)
• But… activation only 38%, churn rising to 7.5%

🔍 The bottleneck:
Activation, not acquisition. 62% of trial signups never reach activation. Onboarding has 6 mandatory steps when industry average is 3.

💡 The recommendation:
Fix onboarding before scaling spend. Reducing steps from 6 → 3 should lift activation +14pp and reduce early churn by ~35%. This single change compounds across LTV, retention, and CAC payback.

🛡️ The hidden gap:
Compliance readiness at 38/100. Before any enterprise motion, the product needs SOC 2 + DPA templates + a HIPAA/EU AI Act gap analysis.

✨ The big lesson:
The best growth lever is rarely "more marketing." It's almost always upstream of acquisition - in activation, retention, or the value moment.

#productmanagement #startups #productstrategy`;

// ─── Components ───────────────────────────────────────────────────────────────

function SectionBlock({
  num,
  title,
  Icon,
  children,
}: {
  num: string;
  title: string;
  Icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
          {num}
        </div>
        <Icon className="w-4 h-4 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="pl-12">{children}</div>
    </section>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-500/5 px-4 py-3 my-3">
      <p className="text-sm text-zinc-200 italic leading-relaxed">{children}</p>
    </div>
  );
}

function MiniStat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "good" | "bad" | "neutral" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={cn(
        "text-base font-bold tabular-nums",
        tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-white"
      )}>{value}</p>
    </div>
  );
}

function SurvivalRing({ score }: { score: number }) {
  const size = 180;
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const color = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <defs>
          <linearGradient id="survGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={score >= 60 ? "#a78bfa" : color} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff0d" strokeWidth={size * 0.08} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="url(#survGrad)" strokeWidth={size * 0.08}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white tabular-nums">{score}</span>
        <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1">/ 100</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecommendationsPage() {
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleCopyLinkedIn = async () => {
    try {
      await navigator.clipboard.writeText(LINKEDIN_SUMMARY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback: create a temp textarea
      const ta = document.createElement("textarea");
      ta.value = LINKEDIN_SUMMARY;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <AppShell title="Final AI Recommendations" subtitle={`${REPORT.product} · Strategic Diagnosis Report`}>
      <div className="p-6 max-w-5xl mx-auto space-y-10 print:max-w-none print:p-0">

        {/* ── Report Cover ─────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-indigo-950/30 via-zinc-900/50 to-purple-950/20 print:border-0 print:bg-white print:text-black">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">Strategic Diagnosis Report</p>
                  <p className="text-xs text-zinc-500">Prepared by {REPORT.preparedBy}</p>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1 print:text-black">{REPORT.product}</h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400 print:text-zinc-700">
                <span>{REPORT.industry}</span>
                <span>·</span>
                <span>{REPORT.stage}</span>
                <span>·</span>
                <span>{REPORT.date}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs print:hidden">10-Section Report</Badge>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export Report
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLinkedIn}>
              {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Linkedin className="w-4 h-4 mr-1.5" />}
              {copied ? "Copied to clipboard" : "Copy LinkedIn Summary"}
            </Button>
            <Link href="/dashboard">
              <Button size="sm" variant="outline">
                <RotateCcw className="w-4 h-4 mr-1.5" /> Restart Simulation
              </Button>
            </Link>
          </div>
        </div>

        {/* ── 1. Executive Summary ─────────────────────────────── */}
        <SectionBlock num="01" title="Executive Summary" Icon={FileText}>
          <p className="text-sm text-zinc-300 leading-relaxed">{REPORT.executiveSummary}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <MiniStat label="MRR Growth" value="+53% (6mo)" tone="good" />
            <MiniStat label="LTV / CAC" value="10×" tone="good" />
            <MiniStat label="Activation Rate" value="38%" tone="bad" />
            <MiniStat label="Monthly Churn" value="7.5%" tone="bad" />
          </div>
        </SectionBlock>

        {/* ── 2. Product Health Diagnosis ──────────────────────── */}
        <SectionBlock num="02" title="Product Health Diagnosis" Icon={Activity}>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="glass rounded-xl p-4 border border-indigo-500/20 shrink-0 w-full md:w-48 text-center">
              <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Composite Health</p>
              <p className="text-4xl font-bold text-white mb-1">{REPORT.health.score}</p>
              <p className="text-xs text-indigo-300">{REPORT.health.band}</p>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </p>
                <ul className="space-y-1.5">
                  {REPORT.health.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-zinc-300 leading-relaxed">· {s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Weaknesses
                </p>
                <ul className="space-y-1.5">
                  {REPORT.health.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-zinc-300 leading-relaxed">· {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ── 3. Biggest Growth Bottleneck ─────────────────────── */}
        <SectionBlock num="03" title="Biggest Growth Bottleneck" Icon={TrendingDown}>
          <p className="text-base font-semibold text-white mb-1">{REPORT.growthBottleneck.title}</p>
          <p className="text-xs text-zinc-500 mb-3">{REPORT.growthBottleneck.metric}</p>

          <PullQuote>{REPORT.growthBottleneck.impact}</PullQuote>

          <div className="space-y-3 mt-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Root Cause</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{REPORT.growthBottleneck.rootCause}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Leverage</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{REPORT.growthBottleneck.leverage}</p>
            </div>
          </div>
        </SectionBlock>

        {/* ── 4. Biggest Retention Risk ────────────────────────── */}
        <SectionBlock num="04" title="Biggest Retention Risk" Icon={Repeat}>
          <p className="text-base font-semibold text-white mb-1">{REPORT.retentionRisk.title}</p>
          <p className="text-xs text-zinc-500 mb-3">{REPORT.retentionRisk.metric}</p>
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">{REPORT.retentionRisk.diagnosis}</p>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Fix
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{REPORT.retentionRisk.fix}</p>
          </div>
        </SectionBlock>

        {/* ── 5. Best Roadmap Priority ─────────────────────────── */}
        <SectionBlock num="05" title="Best Roadmap Priority" Icon={Target}>
          <div className="flex items-start gap-4">
            <div className="glass rounded-xl p-3 border border-indigo-500/30 shrink-0 text-center min-w-[80px]">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">RICE</p>
              <p className="text-2xl font-bold text-white tabular-nums">{REPORT.roadmapPriority.riceScore}</p>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-white mb-2">{REPORT.roadmapPriority.title}</p>
              <p className="text-sm text-zinc-300 leading-relaxed mb-2">{REPORT.roadmapPriority.rationale}</p>
              <p className="text-xs text-zinc-500"><span className="font-semibold text-zinc-400">Runner-up: </span>{REPORT.roadmapPriority.runnerUp}</p>
            </div>
          </div>
        </SectionBlock>

        {/* ── 6. Compliance & Enterprise Readiness ─────────────── */}
        <SectionBlock num="06" title="Compliance & Enterprise Readiness" Icon={ShieldCheck}>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="glass rounded-xl p-4 border border-amber-500/20 shrink-0 w-full md:w-48 text-center">
              <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Enterprise Readiness</p>
              <p className="text-4xl font-bold text-amber-300 mb-1">{REPORT.compliance.enterpriseScore}</p>
              <p className="text-xs text-amber-300">{REPORT.compliance.band}</p>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1.5">Blockers</p>
                <ul className="space-y-1">
                  {REPORT.compliance.blockers.map((b, i) => (
                    <li key={i} className="text-xs text-zinc-300 leading-relaxed">· {b}</li>
                  ))}
                </ul>
              </div>
              <PullQuote>{REPORT.compliance.recommendation}</PullQuote>
            </div>
          </div>
        </SectionBlock>

        {/* ── 7. 30-Day Action Plan ────────────────────────────── */}
        <SectionBlock num="07" title="Recommended 30-Day Action Plan" Icon={Calendar}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-3 py-2 text-zinc-400 text-xs uppercase tracking-wide font-medium">Owner</th>
                  <th className="text-left px-3 py-2 text-zinc-400 text-xs uppercase tracking-wide font-medium">Action</th>
                  <th className="text-left px-3 py-2 text-zinc-400 text-xs uppercase tracking-wide font-medium">Expected Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {REPORT.thirtyDayPlan.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="px-3 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">{row.owner}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-zinc-300">{row.task}</td>
                    <td className="px-3 py-2.5 text-xs text-emerald-300">{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBlock>

        {/* ── 8. 90-Day Strategy ───────────────────────────────── */}
        <SectionBlock num="08" title="Recommended 90-Day Strategy" Icon={Rocket}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {REPORT.ninetyDayStrategy.map((p, i) => (
              <div key={i} className="glass rounded-xl border border-white/10 p-4 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", p.color)}>
                    <p.Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-white">{p.pillar}</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </SectionBlock>

        {/* ── 9. Startup Survival Score ────────────────────────── */}
        <SectionBlock num="09" title="Startup Survival Score" Icon={Sparkles}>
          <div className="glass rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-zinc-900/50 to-indigo-950/30">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <SurvivalRing score={REPORT.survivalScore.score} />
              <div className="flex-1">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 mb-2">
                  {REPORT.survivalScore.band}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">{REPORT.survivalScore.interpretation}</p>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT.survivalScore.components.map((c) => (
                    <div key={c.label} className="flex items-center justify-between gap-2 rounded-md bg-white/[0.03] px-3 py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-zinc-400 truncate">{c.label}</span>
                        <span className="text-[10px] text-zinc-600">{c.weight}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-12 h-1 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.value}%`,
                              backgroundColor: c.value >= 70 ? "#10b981" : c.value >= 50 ? "#f59e0b" : "#f43f5e",
                            }}
                          />
                        </div>
                        <span className="text-xs text-white font-mono tabular-nums w-7 text-right">{c.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ── 10. Final Strategic Recommendation ───────────────── */}
        <SectionBlock num="10" title="Final Strategic Recommendation" Icon={Brain}>
          <div className="glass rounded-2xl border border-indigo-500/30 p-6 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-zinc-900/50">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold mb-2">Bottom Line</p>
                <p className="text-base text-white leading-relaxed">{REPORT.finalRecommendation}</p>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ── Bottom CTA Strip ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/40 to-purple-950/30 p-5 print:hidden">
          <div>
            <p className="text-sm font-semibold text-white">Ready to test a different scenario?</p>
            <p className="text-xs text-zinc-400">Adjust assumptions in the simulator and regenerate this report.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLinkedIn}>
              {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? "Copied" : "LinkedIn"}
            </Button>
            <Link href="/simulator">
              <Button size="sm">
                Run new scenario <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="text-center text-xs text-zinc-600 pt-4 print:text-zinc-500">
          <p>Generated by ProductTwin · {REPORT.date} · This is a strategic simulation, not financial or legal advice.</p>
        </div>

      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .glass { background: white !important; border-color: #e5e7eb !important; }
          .text-white, .text-zinc-200, .text-zinc-300, .text-zinc-400 { color: #111 !important; }
          .text-zinc-500, .text-zinc-600 { color: #555 !important; }
          aside, header { display: none !important; }
        }
      `}</style>
    </AppShell>
  );
}
