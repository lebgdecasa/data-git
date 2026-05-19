"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Line, LineChart,
} from "recharts";
import {
  Megaphone, ShoppingBag, Sparkles, Settings, Heart, DollarSign,
  TrendingUp, TrendingDown, ShieldCheck, Activity, ArrowRight, ArrowUp,
  ArrowDown, Minus, Plus, Check, X, Trash2, ListChecks, Clock, Target,
  Flame, BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { NextStep } from "@/components/layout/next-step";
import { EmptyProfile } from "@/components/layout/empty-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import {
  computeAllSectionScores, computeCompositeBusinessScore, SECTIONS, type SectionId,
} from "@/lib/sections";
import { calculateRiskScore } from "@/lib/profile";

const ICON_BY_NAME: Record<string, React.ElementType> = {
  Megaphone, ShoppingBag, Sparkles, Settings, Heart,
  DollarSign, TrendingUp, ShieldCheck,
};

// ─── Page ─────────────────────────────────────────────────────────────────

export default function WorkspaceHomePage() {
  const profile = useProfileStore((s) => s.profile);
  const auditHistory = useProfileStore((s) => s.auditHistory);
  const kpiHistory = useProfileStore((s) => s.kpiHistory);
  const actionItems = useProfileStore((s) => s.actionItems);
  const logKpiSnapshot = useProfileStore((s) => s.logKpiSnapshot);
  const toggleActionItem = useProfileStore((s) => s.toggleActionItem);
  const addManualActionItem = useProfileStore((s) => s.addManualActionItem);
  const removeActionItem = useProfileStore((s) => s.removeActionItem);
  const clearCompletedActionItems = useProfileStore((s) => s.clearCompletedActionItems);

  const populated = isProfilePopulated(profile);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState<"open" | "all" | "done">("open");

  if (!populated) {
    return (
      <AppShell>
        <PageHeader
          step={2}
          eyebrow="Workspace Home"
          title="Your operating dashboard"
          description="Track business health, run section audits, log KPIs, and complete action items. You need to load a product profile first."
        />
        <EmptyProfile
          pageLabel="Workspace Home"
          pageDescription="This is where you'll return weekly to monitor progress and complete improvement tasks."
        />
      </AppShell>
    );
  }

  // ── Compute derived state ────────────────────────────────────────
  const compositeScore = computeCompositeBusinessScore(profile);
  const previousScore = auditHistory.length > 1 ? auditHistory[1].compositeScore : null;
  const scoreDelta = previousScore !== null ? compositeScore - previousScore : null;
  const sectionScores = computeAllSectionScores(profile);
  const riskScore = calculateRiskScore(profile);

  const lastAudit = auditHistory[0];
  const daysSinceAudit = lastAudit
    ? Math.round((Date.now() - lastAudit.createdAt) / (1000 * 60 * 60 * 24))
    : null;

  const openItems = actionItems.filter((a) => a.status === "open");
  const doneItems = actionItems.filter((a) => a.status === "done");
  const visibleItems = filter === "open" ? openItems
    : filter === "done" ? doneItems
    : actionItems;

  // KPI sparkline data (from kpiHistory, oldest first for chart)
  const kpiSparkData = [...kpiHistory].reverse();
  const mrrTrend = kpiSparkData.length >= 2 ? kpiSparkData[kpiSparkData.length - 1].mrr - kpiSparkData[0].mrr : 0;
  const churnTrend = kpiSparkData.length >= 2 ? kpiSparkData[kpiSparkData.length - 1].churn - kpiSparkData[0].churn : 0;
  const auditTrend = auditHistory.slice(0, 8).reverse().map((a, i) => ({
    idx: i + 1,
    score: a.compositeScore,
    label: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  // Days since last KPI log
  const lastKpi = kpiHistory[0];
  const daysSinceKpiLog = lastKpi
    ? Math.round((Date.now() - lastKpi.date) / (1000 * 60 * 60 * 24))
    : null;
  const kpiLogStale = daysSinceKpiLog === null || daysSinceKpiLog >= 7;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addManualActionItem(newTaskTitle, "med");
    setNewTaskTitle("");
  };

  return (
    <AppShell>
      <PageHeader
        step={2}
        eyebrow="Workspace Home"
        title={`${profile.productName} · operating dashboard`}
        description="Your weekly business operating system. Track section scores, complete improvement tasks, and log KPIs to build trend data."
        actions={
          <Link href="/audit">
            <Button size="sm" variant="outline">
              <Activity className="h-3.5 w-3.5" />
              Re-run audit
            </Button>
          </Link>
        }
      />

      <div className="space-y-8">

        {/* ── HERO: Composite Business Health ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Composite score card */}
          <Card className="glass-elevated lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-5">
                  <CompositeRing score={compositeScore} />
                  <div>
                    <p className="eyebrow mb-1">Composite Business Health</p>
                    <div className="flex items-end gap-3 mb-1">
                      <p className="text-4xl font-bold text-white tabular-numeric leading-none">{compositeScore}</p>
                      <span className="text-sm text-zinc-500 mb-1">/ 100</span>
                      {scoreDelta !== null && (
                        <DeltaPill value={scoreDelta} suffix=" pts vs last audit" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                      {daysSinceAudit === null
                        ? "No audit history yet. Run your first audit to start tracking."
                        : daysSinceAudit === 0
                          ? "Audited today. Refresh weekly to monitor progress."
                          : `Last audit ${daysSinceAudit} day${daysSinceAudit > 1 ? "s" : ""} ago. ${daysSinceAudit > 14 ? "Time for a fresh audit." : "Stay on schedule."}`}
                    </p>
                  </div>
                </div>

                {/* Audit trend mini chart */}
                {auditTrend.length >= 2 && (
                  <div className="w-full md:w-56 h-20">
                    <p className="eyebrow mb-1">Audit trend</p>
                    <ResponsiveContainer width="100%" height={56}>
                      <LineChart data={auditTrend}>
                        <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} />
                        <Tooltip
                          contentStyle={{ background: "#1e1b4b", border: "1px solid #6366f180", borderRadius: 8, color: "#fff", fontSize: 11 }}
                          formatter={(v: number) => [`${v}/100`, "Score"]}
                          labelFormatter={(_, p) => (p?.[0]?.payload as any)?.label || ""}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KPI Logger / Health alerts */}
          <Card className={kpiLogStale ? "border-amber-500/30" : "glass"}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${kpiLogStale ? "bg-amber-500/15" : "bg-emerald-500/15"}`}>
                  <Clock className={`h-4 w-4 ${kpiLogStale ? "text-amber-300" : "text-emerald-300"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Weekly KPI Log</p>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                    {kpiLogStale
                      ? `${daysSinceKpiLog === null ? "Not started" : `${daysSinceKpiLog} days`} since your last snapshot. Log it to build trend data.`
                      : `Logged ${daysSinceKpiLog} day${daysSinceKpiLog === 1 ? "" : "s"} ago. Next due in ${7 - (daysSinceKpiLog ?? 0)} day${7 - (daysSinceKpiLog ?? 0) === 1 ? "" : "s"}.`}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={logKpiSnapshot} className="w-full">
                <Plus className="h-3.5 w-3.5" /> Log this week's KPIs
              </Button>
              <p className="text-[11px] text-zinc-600 mt-2">
                Captures MRR, churn, activation, retention, LTV, CAC from your current profile.
              </p>
              {kpiHistory.length > 0 && (
                <p className="text-[11px] text-indigo-300 mt-1">
                  <Flame className="inline h-3 w-3 mr-1" />
                  {kpiHistory.length} snapshot{kpiHistory.length !== 1 ? "s" : ""} logged
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── KPI Sparklines ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiSparkCard
            label="MRR" current={profile.mrr} format="currency"
            data={kpiSparkData} dataKey="mrr"
            trend={mrrTrend} goodIfUp
          />
          <KpiSparkCard
            label="Monthly Churn" current={profile.churnRate} format="percent"
            data={kpiSparkData} dataKey="churn"
            trend={churnTrend} goodIfUp={false}
          />
          <KpiSparkCard
            label="Activation Rate" current={profile.activationRate} format="percent"
            data={kpiSparkData} dataKey="activation"
            trend={kpiSparkData.length >= 2 ? kpiSparkData[kpiSparkData.length - 1].activation - kpiSparkData[0].activation : 0}
            goodIfUp
          />
        </div>

        {/* ── SECTION TILES (8 sections) ──────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Section Audits</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Eight independent business dimensions. Each rolls up into the composite score above.</p>
            </div>
            <Badge variant="secondary" className="text-xs">{SECTIONS.length} sections</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sectionScores.map((s) => {
              const def = SECTIONS.find((sec) => sec.id === s.sectionId)!;
              const Icon = ICON_BY_NAME[def.iconName] || Sparkles;
              const previousSectionScore = auditHistory.length > 1
                ? auditHistory[1].compositeScore // proxy; per-section history not stored individually
                : null;
              return (
                <SectionTile
                  key={s.sectionId}
                  name={def.name}
                  Icon={Icon}
                  color={def.color}
                  description={def.description}
                  score={s.score}
                  band={s.band}
                  insight={s.insight}
                  topRisk={s.topRisk}
                />
              );
            })}
          </div>
        </div>

        {/* ── Action Items + History ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Action items panel */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-indigo-300" />
                  <h3 className="text-base font-semibold text-white">Action Items</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {openItems.length} open · {doneItems.length} done
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {(["open", "all", "done"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                        filter === f
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                          : "bg-transparent border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {f === "open" ? "Open" : f === "done" ? "Done" : "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick-add */}
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add an action item..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); }}
                  className="h-8 text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleAddTask}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>

              {/* Task list */}
              {visibleItems.length === 0 ? (
                <div className="text-center py-8 surface-subtle">
                  <p className="text-sm text-zinc-400">
                    {filter === "open"
                      ? "No open action items. Run an audit to generate fresh recommendations."
                      : filter === "done"
                        ? "No completed items yet. Tick one off to see it here."
                        : "No action items yet. Run an audit to populate this list."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {visibleItems.slice(0, 10).map((item) => (
                    <ActionItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => toggleActionItem(item.id)}
                      onRemove={() => removeActionItem(item.id)}
                    />
                  ))}
                </div>
              )}

              {doneItems.length > 0 && filter !== "done" && (
                <button
                  onClick={clearCompletedActionItems}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 mt-3"
                >
                  Clear {doneItems.length} completed
                </button>
              )}
            </CardContent>
          </Card>

          {/* Right column: stats + audit history */}
          <div className="space-y-4">

            {/* Stats panel */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="eyebrow">This week</p>
                <StatRow label="Open tasks" value={openItems.length} />
                <StatRow label="Completed" value={doneItems.length} tone="good" />
                <StatRow label="High priority" value={openItems.filter((i) => i.priority === "high").length} tone={openItems.filter(i => i.priority === "high").length > 0 ? "bad" : "neutral"} />
                <StatRow label="Audits this month" value={auditHistory.filter((a) => Date.now() - a.createdAt < 30 * 24 * 3600 * 1000).length} />
                <StatRow label="KPI snapshots" value={kpiHistory.length} />
                <StatRow label="Risk Score" value={riskScore} tone={riskScore > 60 ? "bad" : riskScore > 40 ? "warn" : "good"} suffix="/100" />
              </CardContent>
            </Card>

            {/* Audit history */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="eyebrow">Audit history</p>
                  <Link href="/audit">
                    <button className="text-[11px] text-indigo-300 hover:text-indigo-200">New audit →</button>
                  </Link>
                </div>
                {auditHistory.length === 0 ? (
                  <p className="text-xs text-zinc-500">No audits yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {auditHistory.slice(0, 5).map((a, i) => {
                      const prev = auditHistory[i + 1];
                      const delta = prev ? a.compositeScore - prev.compositeScore : 0;
                      return (
                        <div key={a.id} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/[0.025]">
                          <div className="min-w-0">
                            <p className="text-xs text-white tabular-numeric">{a.compositeScore} <span className="text-zinc-600">·</span> <span className="text-zinc-400">{a.result.band}</span></p>
                            <p className="text-[10px] text-zinc-600">{new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}</p>
                          </div>
                          {prev && (
                            <span className={`text-[11px] font-semibold tabular-numeric ${
                              delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-zinc-500"
                            }`}>
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      <NextStep
        label="Run a scenario simulation"
        description="Test the impact of changes before you ship them. The simulator uses your current profile data."
        href="/simulator"
      />
    </AppShell>
  );
}

// ─── Components ───────────────────────────────────────────────────────────

function CompositeRing({ score }: { score: number }) {
  const size = 120;
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : score >= 30 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff0d" strokeWidth={size * 0.08} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.08}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-white tabular-numeric">{score}</span>
      </div>
    </div>
  );
}

function DeltaPill({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (value === 0) return <Badge variant="secondary" className="text-[10px]">No change{suffix}</Badge>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      positive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
    }`}>
      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value}{suffix}
    </span>
  );
}

function SectionTile({
  name, Icon, color, description, score, band, insight, topRisk,
}: {
  name: string; Icon: React.ElementType; color: string; description: string;
  score: number; band: "Strong" | "Moderate" | "Weak"; insight: string; topRisk?: string;
}) {
  const bandColor = band === "Strong" ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/40"
    : band === "Moderate" ? "text-amber-300 bg-amber-500/15 border-amber-500/40"
    : "text-rose-300 bg-rose-500/15 border-rose-500/40";
  const barColor = band === "Strong" ? "bg-emerald-500" : band === "Moderate" ? "bg-amber-500" : "bg-rose-500";

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className={`w-9 h-9 rounded-lg ${color} grid place-items-center shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${bandColor}`}>
            {band}
          </span>
        </div>
        <p className="text-sm font-semibold text-white mb-1 truncate">{name}</p>
        <p className="text-3xl font-bold text-white tabular-numeric mb-2 leading-none">{score}<span className="text-xs text-zinc-500 font-normal"> / 100</span></p>
        <div className="h-1 rounded-full bg-white/5 mb-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">{insight}</p>
        {topRisk && (
          <div className="mt-2 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20">
            <p className="text-[10px] text-rose-300 leading-tight">⚠ {topRisk}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KpiSparkCard({
  label, current, format, data, dataKey, trend, goodIfUp,
}: {
  label: string; current: number; format: "currency" | "percent";
  data: any[]; dataKey: string; trend: number; goodIfUp: boolean;
}) {
  const positive = (trend > 0 && goodIfUp) || (trend < 0 && !goodIfUp);
  const flat = Math.abs(trend) < 0.01;
  const trendColor = flat ? "text-zinc-500" : positive ? "text-emerald-300" : "text-rose-300";
  const Arrow = flat ? Minus : trend > 0 ? ArrowUp : ArrowDown;
  const formattedCurrent = format === "currency"
    ? current >= 1000 ? `$${(current / 1000).toFixed(1)}k` : `$${Math.round(current)}`
    : `${current.toFixed(1)}%`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="eyebrow">{label}</p>
          {data.length >= 2 && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold tabular-numeric ${trendColor}`}>
              <Arrow className="h-3 w-3" />
              {format === "currency" ? `$${Math.abs(Math.round(trend)).toLocaleString()}` : `${Math.abs(trend).toFixed(1)}pp`}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white tabular-numeric mb-2 leading-tight">{formattedCurrent}</p>
        <div className="h-10">
          {data.length < 2 ? (
            <p className="text-[11px] text-zinc-600 italic mt-2">Log KPIs weekly to build a trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={positive ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={positive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey={dataKey} stroke={positive ? "#10b981" : "#f43f5e"} strokeWidth={1.5} fill={`url(#grad-${dataKey})`} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionItemRow({
  item, onToggle, onRemove,
}: {
  item: { id: string; title: string; priority: "high" | "med" | "low"; status: string; impact?: string; sectionId?: string; source: string };
  onToggle: () => void;
  onRemove: () => void;
}) {
  const done = item.status === "done";
  const priorityColor = item.priority === "high" ? "text-rose-300" : item.priority === "med" ? "text-amber-300" : "text-zinc-400";

  return (
    <div className={`group flex items-center gap-3 px-3 py-2 rounded-md transition ${done ? "opacity-50" : "hover:bg-white/[0.025]"}`}>
      <button
        onClick={onToggle}
        className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
          done
            ? "bg-emerald-500/20 border-emerald-500/60"
            : "border-white/15 hover:border-indigo-500/50"
        }`}
        aria-label={done ? "Mark as open" : "Mark as done"}
      >
        {done && <Check className="h-3 w-3 text-emerald-300" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${done ? "line-through text-zinc-500" : "text-white"}`}>{item.title}</p>
        {item.impact && (
          <p className="text-[11px] text-zinc-500 mt-0.5">{item.impact}</p>
        )}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${priorityColor}`}>
        {item.priority}
      </span>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition shrink-0 text-zinc-500 hover:text-rose-400"
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function StatRow({ label, value, suffix, tone = "neutral" }: { label: string; value: number; suffix?: string; tone?: "good" | "bad" | "warn" | "neutral" }) {
  const color = tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : tone === "warn" ? "text-amber-300" : "text-white";
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`text-sm font-bold tabular-numeric ${color}`}>{value}{suffix || ""}</span>
    </div>
  );
}
