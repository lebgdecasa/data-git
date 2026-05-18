"use client";

import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Activity,
  Repeat,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const REVENUE_TREND = [
  { month: "Nov", mrr: 31_200, arr: 374_400 },
  { month: "Dec", mrr: 35_800, arr: 429_600 },
  { month: "Jan", mrr: 38_100, arr: 457_200 },
  { month: "Feb", mrr: 41_500, arr: 498_000 },
  { month: "Mar", mrr: 44_900, arr: 538_800 },
  { month: "Apr", mrr: 48_000, arr: 576_000 },
];

const RETENTION_CURVE = [
  { day: "Day 1", rate: 100 },
  { day: "Day 3", rate: 74 },
  { day: "Day 7", rate: 58 },
  { day: "Day 14", rate: 47 },
  { day: "Day 21", rate: 41 },
  { day: "Day 30", rate: 34 },
  { day: "Day 60", rate: 28 },
  { day: "Day 90", rate: 23 },
];

const FUNNEL_DATA = [
  { name: "Website Visitors", value: 48_000, fill: "#6366f1" },
  { name: "Trial Signups", value: 1_920, fill: "#8b5cf6" },
  { name: "Activated Users", value: 730, fill: "#a78bfa" },
  { name: "Paid Customers", value: 312, fill: "#c4b5fd" },
];

const FEATURE_ADOPTION = [
  { feature: "Health Logs", adoption: 78 },
  { feature: "AI Coach", adoption: 54 },
  { feature: "Goals Tracker", adoption: 47 },
  { feature: "Wearable Sync", adoption: 39 },
  { feature: "Social Share", adoption: 22 },
  { feature: "Reminders", adoption: 68 },
];

// ─── KPI Groups ───────────────────────────────────────────────────────────────

const ACQUISITION_KPIS = [
  { label: "CAC", value: "$42", prev: "$51", trend: "up", good: true, note: "↓18% vs last quarter" },
  { label: "Website CVR", value: "4.0%", prev: "3.2%", trend: "up", good: true, note: "↑ 0.8pp MoM" },
  { label: "Trial Signups", value: "1,920", prev: "1,650", trend: "up", good: true, note: "1,920 / mo" },
  { label: "Lead Quality", value: "71 / 100", prev: "64", trend: "up", good: true, note: "ICP match improving" },
];

const ACTIVATION_KPIS = [
  { label: "Activation Rate", value: "38%", prev: "31%", trend: "up", good: true, note: "Goal: 55%" },
  { label: "Onboarding Done", value: "62%", prev: "58%", trend: "up", good: true, note: "4pp gain MoM" },
  { label: "Time to Value", value: "3.2 days", prev: "4.8 days", trend: "up", good: true, note: "↓33% improvement" },
  { label: "Feature Adoption", value: "54%", prev: "49%", trend: "up", good: true, note: "Avg across core 6" },
];

const RETENTION_KPIS = [
  { label: "Monthly Churn", value: "7.5%", prev: "6.1%", trend: "down", good: false, note: "↑ Rising - flag" },
  { label: "30-Day Retention", value: "34%", prev: "38%", trend: "down", good: false, note: "Industry avg: 45%" },
  { label: "Repeat Usage", value: "4.1×/wk", prev: "3.8×", trend: "up", good: true, note: "Power users: 8.4×" },
  { label: "Health Score", value: "67 / 100", prev: "71", trend: "down", good: false, note: "Sliding - monitor" },
];

const REVENUE_KPIS = [
  { label: "MRR", value: "$48,000", prev: "$44,900", trend: "up", good: true, note: "+6.9% MoM" },
  { label: "ARR", value: "$576,000", prev: "$538,800", trend: "up", good: true, note: "Run-rate" },
  { label: "LTV", value: "$420", prev: "$398", trend: "up", good: true, note: "+$22 vs prior" },
  { label: "ARPU", value: "$38.40", prev: "$36.10", trend: "up", good: true, note: "Upsell lift" },
  { label: "LTV / CAC", value: "10×", prev: "7.8×", trend: "up", good: true, note: "Healthy (>3× target)" },
];

const PRODUCT_KPIS = [
  { label: "Feature Usage", value: "54%", prev: "49%", trend: "up", good: true, note: "Core 6 features" },
  { label: "Roadmap Delivery", value: "73%", prev: "68%", trend: "up", good: true, note: "On-time sprints" },
  { label: "Support Tickets", value: "142 / mo", prev: "189", trend: "up", good: true, note: "↓25% volume" },
  { label: "Satisfaction", value: "4.3 / 5", prev: "4.1", trend: "up", good: true, note: "NPS: +34" },
];

// ─── Components ───────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "flat";

function KpiCard({
  label,
  value,
  prev,
  trend,
  good,
  note,
}: {
  label: string;
  value: string;
  prev: string;
  trend: Trend;
  good: boolean;
  note: string;
}) {
  const positive = (trend === "up" && good) || (trend === "down" && !good);
  const negative = (trend === "up" && !good) || (trend === "down" && good);

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-1 hover:bg-white/5 transition-colors">
      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        {trend === "up" ? (
          <TrendingUp className={cn("w-3.5 h-3.5", positive ? "text-emerald-400" : "text-rose-400")} />
        ) : trend === "down" ? (
          <TrendingDown className={cn("w-3.5 h-3.5", positive ? "text-emerald-400" : "text-rose-400")} />
        ) : (
          <Minus className="w-3.5 h-3.5 text-zinc-500" />
        )}
        <span className={cn("text-xs font-medium", positive ? "text-emerald-400" : negative ? "text-rose-400" : "text-zinc-500")}>
          {note}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
  );
}

function Insight({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-zinc-400 mt-3 italic border-l-2 border-indigo-500/40 pl-3 leading-relaxed">
      {children}
    </p>
  );
}

const fmtK = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KpiPage() {
  return (
    <AppShell title="KPI Dashboard" subtitle="HealthTrack AI · May 2026">
      <div className="p-6 space-y-10 max-w-7xl mx-auto">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">KPI Dashboard</h1>
            <Badge variant="secondary" className="text-xs">HealthTrack AI</Badge>
          </div>
          <p className="text-sm text-zinc-400">May 2026 · Monthly snapshot · All metrics vs prior period</p>
        </div>

        {/* ── ACQUISITION ─────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Users} title="Acquisition" color="bg-blue-600/80" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACQUISITION_KPIS.map((k) => <KpiCard key={k.label} {...k} trend={k.trend as Trend} />)}
          </div>
        </section>

        {/* ── ACTIVATION ──────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Zap} title="Activation" color="bg-violet-600/80" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ACTIVATION_KPIS.map((k) => <KpiCard key={k.label} {...k} trend={k.trend as Trend} />)}
          </div>
        </section>

        {/* ── FUNNEL CHART ────────────────────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Acquisition → Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <FunnelChart>
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #6366f1", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [v.toLocaleString(), "Users"]}
                />
                <Funnel dataKey="value" data={FUNNEL_DATA} isAnimationActive>
                  {FUNNEL_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                  <LabelList position="right" fill="#a1a1aa" fontSize={11} dataKey="name" />
                  <LabelList position="center" fill="#fff" fontSize={12} fontWeight={600} formatter={(v: number) => v.toLocaleString()} dataKey="value" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
            <Insight>
              Activation is the weakest stage of the funnel - only 38% of trial signups reach activation. Improving onboarding should be prioritized before increasing acquisition spend.
            </Insight>
          </CardContent>
        </Card>

        {/* ── RETENTION ───────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Repeat} title="Retention" color="bg-rose-600/80" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RETENTION_KPIS.map((k) => <KpiCard key={k.label} {...k} trend={k.trend as Trend} />)}
          </div>
        </section>

        {/* ── RETENTION CURVE ─────────────────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Retention Curve (Cohort D1-D90)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={RETENTION_CURVE} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #f43f5e80", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Retained"]}
                />
                <Area type="monotone" dataKey="rate" stroke="#f43f5e" strokeWidth={2} fill="url(#retGrad)" dot={{ fill: "#f43f5e", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
            <Insight>
              Retention drops to 34% by Day 30 against an industry average of 45%. The steepest drop occurs between Day 1 and Day 7, suggesting the critical engagement window is being missed - likely due to incomplete onboarding.
            </Insight>
          </CardContent>
        </Card>

        {/* ── REVENUE ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={DollarSign} title="Revenue" color="bg-emerald-600/80" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REVENUE_KPIS.map((k) => <KpiCard key={k.label} {...k} trend={k.trend as Trend} />)}
          </div>
        </section>

        {/* ── REVENUE TREND CHART ──────────────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">MRR Growth - 6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={REVENUE_TREND} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mrrLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #6366f180", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "MRR"]}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  dot={{ fill: "#818cf8", r: 4, strokeWidth: 2, stroke: "#1e1b4b" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <Insight>
              MRR has grown 53.8% over six months, from $31.2k to $48k. Growth is accelerating - the Nov-Jan ramp was slower, while Mar-Apr posted the highest single-month gain. Sustaining this requires keeping churn below 6%.
            </Insight>
          </CardContent>
        </Card>

        {/* ── PRODUCT ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Activity} title="Product" color="bg-amber-600/80" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRODUCT_KPIS.map((k) => <KpiCard key={k.label} {...k} trend={k.trend as Trend} />)}
          </div>
        </section>

        {/* ── FEATURE ADOPTION BAR CHART ───────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Feature Adoption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={FEATURE_ADOPTION}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <YAxis type="category" dataKey="feature" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #f59e0b80", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Adoption"]}
                />
                <Bar dataKey="adoption" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {FEATURE_ADOPTION.map((entry) => (
                    <Cell
                      key={entry.feature}
                      fill={entry.adoption >= 60 ? "#22c55e" : entry.adoption >= 40 ? "#f59e0b" : "#f43f5e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Insight>
              Health Logs and Reminders are the stickiest features (78% and 68% adoption). AI Coach and Goals Tracker sit in the middle - both have high-value potential but low discoverability. Social Share at 22% is a non-starter and should be deprioritized or redesigned.
            </Insight>
          </CardContent>
        </Card>

        {/* ── KPI COMPARISON SUMMARY ──────────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">KPI Comparison - Current vs Prior Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Metric</th>
                    <th className="text-right py-2 px-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Prior</th>
                    <th className="text-right py-2 px-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Current</th>
                    <th className="text-right py-2 px-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Change</th>
                    <th className="text-right py-2 px-3 text-zinc-400 font-medium text-xs uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { metric: "MRR", prior: "$44,900", current: "$48,000", change: "+$3,100", good: true },
                    { metric: "CAC", prior: "$51", current: "$42", change: "-$9", good: true },
                    { metric: "LTV / CAC", prior: "7.8×", current: "10×", change: "+2.2×", good: true },
                    { metric: "Monthly Churn", prior: "6.1%", current: "7.5%", change: "+1.4pp", good: false },
                    { metric: "Activation Rate", prior: "31%", current: "38%", change: "+7pp", good: true },
                    { metric: "30-Day Retention", prior: "38%", current: "34%", change: "-4pp", good: false },
                    { metric: "Time to Value", prior: "4.8 days", current: "3.2 days", change: "-1.6 days", good: true },
                    { metric: "Product Satisfaction", prior: "4.1", current: "4.3", change: "+0.2", good: true },
                    { metric: "Support Tickets", prior: "189/mo", current: "142/mo", change: "-47/mo", good: true },
                    { metric: "Website CVR", prior: "3.2%", current: "4.0%", change: "+0.8pp", good: true },
                  ].map((row) => (
                    <tr key={row.metric} className="hover:bg-white/3 transition-colors">
                      <td className="py-2.5 px-3 text-white font-medium">{row.metric}</td>
                      <td className="py-2.5 px-3 text-right text-zinc-400">{row.prior}</td>
                      <td className="py-2.5 px-3 text-right text-white">{row.current}</td>
                      <td className={cn("py-2.5 px-3 text-right font-medium text-sm", row.good ? "text-emerald-400" : "text-rose-400")}>
                        {row.change}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", row.good ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400")}>
                          {row.good ? "Improving" : "Watch"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Insight>
              8 out of 10 tracked KPIs improved period-over-period. The two red flags - churn (+1.4pp) and 30-day retention (-4pp) - are structurally linked: fixing early retention will directly reduce churn. That should be the team's top priority this quarter.
            </Insight>
          </CardContent>
        </Card>

        {/* ── STRATEGIC SUMMARY ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5 border border-emerald-500/20">
            <p className="text-xs uppercase tracking-wide text-emerald-400 font-semibold mb-2">Strengths</p>
            <ul className="space-y-1.5 text-sm text-zinc-300">
              <li>· LTV/CAC ratio improved to 10× - exceptional unit economics</li>
              <li>· MRR growing at 53% over 6 months - healthy revenue trajectory</li>
              <li>· CAC dropped 18% while CVR improved - efficient growth</li>
            </ul>
          </div>
          <div className="glass rounded-xl p-5 border border-rose-500/20">
            <p className="text-xs uppercase tracking-wide text-rose-400 font-semibold mb-2">Risks</p>
            <ul className="space-y-1.5 text-sm text-zinc-300">
              <li>· Churn rising to 7.5% will compress LTV if unchecked</li>
              <li>· 30-day retention at 34% is 11pp below industry average</li>
              <li>· Activation at 38% means 62% of trials produce no revenue</li>
            </ul>
          </div>
          <div className="glass rounded-xl p-5 border border-amber-500/20">
            <p className="text-xs uppercase tracking-wide text-amber-400 font-semibold mb-2">Priorities</p>
            <ul className="space-y-1.5 text-sm text-zinc-300">
              <li>· Fix Day 1-7 retention drop before scaling acquisition</li>
              <li>· Improve AI Coach discoverability - highest upside feature</li>
              <li>· Set churn target ≤5.5% for next quarter to protect MRR</li>
            </ul>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
