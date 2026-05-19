"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyProfile } from "@/components/layout/empty-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles, Activity, TrendingDown, Repeat, Target, ShieldCheck,
  Calendar, Rocket, Brain, CheckCircle2, AlertTriangle, ArrowRight,
  Download, Linkedin, RotateCcw, Check, Copy, FileText,
} from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import { buildStrategicReport, buildLinkedInSummary } from "@/lib/derive";

const ICON_BY_NAME = {
  Repeat,
  ShieldCheck,
  Rocket,
  Target,
} as const;

function SectionBlock({
  num, title, Icon, children,
}: {
  num: string; title: string; Icon: React.ElementType; children: React.ReactNode;
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
        "text-base font-bold tabular-numeric",
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#survGrad)" strokeWidth={size * 0.08} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white tabular-numeric">{score}</span>
        <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1">/ 100</span>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const profile = useProfileStore((s) => s.profile);
  const audit = useProfileStore((s) => s.audit);
  const populated = isProfilePopulated(profile);
  const [copied, setCopied] = useState(false);

  // Build the report dynamically from the user's actual data
  const report = useMemo(() => buildStrategicReport(profile, audit), [profile, audit]);
  const linkedInPost = useMemo(() => buildLinkedInSummary(profile, audit), [profile, audit]);

  const handleExport = () => { if (typeof window !== "undefined") window.print(); };

  const handleCopyLinkedIn = async () => {
    try {
      await navigator.clipboard.writeText(linkedInPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = linkedInPost;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!populated) {
    return (
      <AppShell>
        <PageHeader
          step={5}
          eyebrow="Recommendations"
          title="Your strategic action plan"
          description="Synthesizes everything from Steps 1-4 into a board-ready report. You need to load a product profile first."
        />
        <EmptyProfile
          pageLabel="Recommendations"
          pageDescription="The strategic report is generated from your saved product data and audit."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        step={5}
        eyebrow="Recommendations"
        title="Your strategic action plan"
        description={`A 10-section executive report synthesizing everything: bottleneck, retention risk, roadmap priority, compliance gaps, 30/90-day plan, and survival score - all calibrated to ${profile.productName}.`}
      />

      <div className="max-w-5xl space-y-10 print:max-w-none print:p-0">

        {/* ── Report Cover ─────────────────────────────────────── */}
        <div className="glass-elevated rounded-2xl p-8 print:border-0 print:bg-white print:text-black">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">Strategic Diagnosis Report</p>
                  <p className="text-xs text-zinc-500">Prepared by {report.preparedBy}</p>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1 print:text-black">{report.product}</h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400 print:text-zinc-700">
                <span>{report.industry}</span>
                <span>·</span>
                <span>{report.stage}</span>
                <span>·</span>
                <span>{report.date}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs print:hidden">10-Section Report</Badge>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export Report
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLinkedIn}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Linkedin className="w-4 h-4" />}
              {copied ? "Copied to clipboard" : "Copy LinkedIn Summary"}
            </Button>
            <Link href="/audit">
              <Button size="sm" variant="outline">
                <RotateCcw className="w-4 h-4" /> Refine the analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* ── 1. Executive Summary ─────────────────────────────── */}
        <SectionBlock num="01" title="Executive Summary" Icon={FileText}>
          <p className="text-sm text-zinc-300 leading-relaxed">{report.executiveSummary}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <MiniStat label="MRR" value={profile.mrr >= 1000 ? `$${(profile.mrr / 1000).toFixed(1)}k` : `$${profile.mrr}`} tone={profile.mrr >= 30000 ? "good" : "neutral"} />
            <MiniStat label="LTV / CAC" value={profile.cac > 0 ? `${(profile.ltv / profile.cac).toFixed(1)}x` : "—"} tone={profile.cac > 0 && profile.ltv / profile.cac >= 4 ? "good" : "bad"} />
            <MiniStat label="Activation" value={`${profile.activationRate}%`} tone={profile.activationRate >= 50 ? "good" : "bad"} />
            <MiniStat label="Monthly Churn" value={`${profile.churnRate}%`} tone={profile.churnRate <= 5 ? "good" : "bad"} />
          </div>
        </SectionBlock>

        {/* ── 2. Product Health Diagnosis ──────────────────────── */}
        <SectionBlock num="02" title="Product Health Diagnosis" Icon={Activity}>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="glass rounded-xl p-4 border-indigo-500/20 shrink-0 w-full md:w-48 text-center">
              <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Composite Health</p>
              <p className="text-4xl font-bold text-white mb-1">{report.health.score}</p>
              <p className="text-xs text-indigo-300">{report.health.band}</p>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </p>
                <ul className="space-y-1.5">
                  {report.health.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-zinc-300 leading-relaxed">· {s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Weaknesses
                </p>
                <ul className="space-y-1.5">
                  {report.health.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-zinc-300 leading-relaxed">· {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ── 3. Biggest Growth Bottleneck ─────────────────────── */}
        <SectionBlock num="03" title="Biggest Growth Bottleneck" Icon={TrendingDown}>
          <p className="text-base font-semibold text-white mb-1">{report.growthBottleneck.title}</p>
          <p className="text-xs text-zinc-500 mb-3">{report.growthBottleneck.metric}</p>
          <PullQuote>{report.growthBottleneck.impact}</PullQuote>
          <div className="space-y-3 mt-3">
            <div>
              <p className="eyebrow mb-1">Root Cause</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{report.growthBottleneck.rootCause}</p>
            </div>
            <div>
              <p className="eyebrow mb-1 text-indigo-300">Leverage</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{report.growthBottleneck.leverage}</p>
            </div>
          </div>
        </SectionBlock>

        {/* ── 4. Biggest Retention Risk ────────────────────────── */}
        <SectionBlock num="04" title="Biggest Retention Risk" Icon={Repeat}>
          <p className="text-base font-semibold text-white mb-1">{report.retentionRisk.title}</p>
          <p className="text-xs text-zinc-500 mb-3">{report.retentionRisk.metric}</p>
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">{report.retentionRisk.diagnosis}</p>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="eyebrow mb-1 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Fix
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{report.retentionRisk.fix}</p>
          </div>
        </SectionBlock>

        {/* ── 5. Best Roadmap Priority ─────────────────────────── */}
        <SectionBlock num="05" title="Best Roadmap Priority" Icon={Target}>
          <div className="flex items-start gap-4">
            <div className="glass rounded-xl p-3 border-indigo-500/30 shrink-0 text-center min-w-[80px]">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">RICE</p>
              <p className="text-2xl font-bold text-white tabular-numeric">{report.roadmapPriority.riceScore}</p>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-white mb-2">{report.roadmapPriority.title}</p>
              <p className="text-sm text-zinc-300 leading-relaxed mb-2">{report.roadmapPriority.rationale}</p>
              <p className="text-xs text-zinc-500"><span className="font-semibold text-zinc-400">Runner-up: </span>{report.roadmapPriority.runnerUp}</p>
            </div>
          </div>
        </SectionBlock>

        {/* ── 6. Compliance & Enterprise Readiness ─────────────── */}
        <SectionBlock num="06" title="Compliance & Enterprise Readiness" Icon={ShieldCheck}>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="glass rounded-xl p-4 border-amber-500/20 shrink-0 w-full md:w-48 text-center">
              <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Enterprise Readiness</p>
              <p className="text-4xl font-bold text-amber-300 mb-1">{report.compliance.enterpriseScore}</p>
              <p className="text-xs text-amber-300">{report.compliance.band}</p>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="eyebrow mb-1.5 text-rose-400">Blockers</p>
                <ul className="space-y-1">
                  {report.compliance.blockers.map((b, i) => (
                    <li key={i} className="text-xs text-zinc-300 leading-relaxed">· {b}</li>
                  ))}
                </ul>
              </div>
              <PullQuote>{report.compliance.recommendation}</PullQuote>
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
                {report.thirtyDayPlan.map((row, i) => (
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
            {report.ninetyDayStrategyPillars.map((p, i) => {
              const Icon = ICON_BY_NAME[p.iconName];
              return (
                <div key={i} className="glass rounded-xl p-4 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", p.color)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white">{p.pillar}</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </SectionBlock>

        {/* ── 9. Startup Survival Score ────────────────────────── */}
        <SectionBlock num="09" title="Startup Survival Score" Icon={Sparkles}>
          <div className="glass-elevated rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <SurvivalRing score={report.survivalScore.score} />
              <div className="flex-1">
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 mb-2">
                  {report.survivalScore.band}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">{report.survivalScore.interpretation}</p>
                <div className="grid grid-cols-2 gap-2">
                  {report.survivalScore.components.map((c) => (
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
                        <span className="text-xs text-white font-mono tabular-numeric w-7 text-right">{c.value}</span>
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
          <div className="glass-elevated rounded-2xl p-6 border-indigo-500/30">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="eyebrow mb-2 text-indigo-300">Bottom Line</p>
                <p className="text-base text-white leading-relaxed">{report.finalRecommendation}</p>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ── Bottom CTA Strip ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950/40 to-purple-950/30 p-5 print:hidden">
          <div>
            <p className="text-sm font-semibold text-white">Want to test a different scenario?</p>
            <p className="text-xs text-zinc-400">Adjust inputs in the simulator and regenerate this report.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLinkedIn}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "LinkedIn"}
            </Button>
            <Link href="/simulator">
              <Button size="sm">
                Run new scenario <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-600 pt-4 print:text-zinc-500">
          <p>Generated by ProductTwin · {report.date} · Strategic simulation, not financial or legal advice.</p>
        </div>

      </div>

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
