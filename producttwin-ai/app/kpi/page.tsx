"use client";

import { useMemo } from "react";
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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { Badge } from "@/components/ui/badge";
import { useTwinStore } from "@/lib/store";
import { simulate } from "@/lib/engine";
import { RADAR_BENCHMARK, SAMPLE_COMPETITORS } from "@/lib/mock-data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import {
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  Repeat,
  Target,
} from "lucide-react";

export default function KpiPage() {
  const { assumptions } = useTwinStore();
  const sim = useMemo(() => simulate(assumptions), [assumptions]);

  const trend = sim.months.map((m, i) => ({
    month: `M${m}`,
    MRR: sim.mrr[i],
    Users: sim.users[i],
  }));

  const cohorts = Array.from({ length: 6 }, (_, i) => ({
    cohort: `Cohort ${i + 1}`,
    M1: 100,
    M2: Math.max(35, Math.round(100 - assumptions.monthlyChurn * 4 - i * 1.5)),
    M3: Math.max(25, Math.round(100 - assumptions.monthlyChurn * 7 - i * 2)),
    M6: Math.max(15, Math.round(100 - assumptions.monthlyChurn * 12 - i * 2.5)),
  }));

  const funnel = [
    { name: "Visits", value: assumptions.monthlyTraffic, fill: "#6366f1" },
    {
      name: "Signups",
      value: Math.round(assumptions.monthlyTraffic * (assumptions.conversionRate / 100)),
      fill: "#8b5cf6",
    },
    {
      name: "Activated",
      value: Math.round(
        assumptions.monthlyTraffic *
          (assumptions.conversionRate / 100) *
          (assumptions.activationRate / 100),
      ),
      fill: "#a855f7",
    },
    {
      name: "Retained · D30",
      value: Math.round(
        assumptions.monthlyTraffic *
          (assumptions.conversionRate / 100) *
          (assumptions.activationRate / 100) *
          (assumptions.retention30 / 100),
      ),
      fill: "#d946ef",
    },
  ];

  const channels = [
    { ch: "Organic", value: 38 },
    { ch: "Paid Search", value: 22 },
    { ch: "Outbound", value: 14 },
    { ch: "Partner", value: 11 },
    { ch: "Referral", value: 9 },
    { ch: "Community", value: 6 },
  ];

  return (
    <AppShell
      title="KPI dashboard"
      subtitle="The metrics you'd want in a board deck — pulled directly from your twin."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="MRR · current"
          value={formatCurrency(sim.mrr[0], { compact: true })}
          delta={sim.monthlyGrowthRate}
          hint="MoM"
          icon={DollarSign}
          tone="good"
        />
        <StatCard
          label="Active users"
          value={formatNumber(sim.users[11] ?? sim.users[0], { compact: true })}
          delta={12.4}
          hint="trailing 12 mo"
          icon={Users}
        />
        <StatCard
          label="Net retention"
          value={`${(100 - assumptions.monthlyChurn * 12 + 8).toFixed(0)}%`}
          delta={2.1}
          hint="incl. expansion"
          icon={Repeat}
          tone="good"
        />
        <StatCard
          label="CAC efficiency"
          value={`${(sim.ltvCacRatio).toFixed(1)}x`}
          hint="LTV/CAC"
          icon={TrendingUp}
          tone={sim.ltvCacRatio >= 3 ? "good" : "warn"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue ramp</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly recurring revenue · 36 months
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="kpi-mrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v, { compact: true })} />} />
                <Area type="monotone" dataKey="MRR" stroke="#a78bfa" fill="url(#kpi-mrr)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funnel</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Monthly · top to bottom</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {funnel.map((f, i) => {
              const pct = (f.value / funnel[0].value) * 100;
              return (
                <div key={f.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{f.name}</span>
                    <span className="font-medium tabular-nums">
                      {formatNumber(f.value, { compact: true })}{" "}
                      <span className="text-muted-foreground">
                        · {formatPercent(pct, 1)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cohort retention</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              % of signed-up users still active by month
            </p>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohorts}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="cohort" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Line type="monotone" dataKey="M1" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} />
                <Line type="monotone" dataKey="M2" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: "#818cf8" }} />
                <Line type="monotone" dataKey="M3" stroke="#c084fc" strokeWidth={2} dot={{ r: 3, fill: "#c084fc" }} />
                <Line type="monotone" dataKey="M6" stroke="#f472b6" strokeWidth={2} dot={{ r: 3, fill: "#f472b6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>You vs. benchmark</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Industry · {assumptions.industry}
            </p>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_BENCHMARK} outerRadius="78%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="dimension" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" tick={false} />
                <Radar name="You" dataKey="you" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.35} strokeWidth={2} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.18} strokeWidth={2} strokeDasharray="4 4" />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Acquisition channels</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Share of new signups · last 90 days (simulated)
            </p>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="ch" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {channels.map((_, i) => (
                    <Cell key={i} fill={["#818cf8", "#a78bfa", "#c084fc", "#e879f9", "#f472b6", "#fb7185"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competitive landscape</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Share · price · rating
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {SAMPLE_COMPETITORS.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.name}</span>
                    {c.name === "Northwind" && (
                      <Badge variant="default">You</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ★ {c.rating}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{c.price === 0 ? "Free / OSS" : `$${c.price}/mo`}</span>
                  <span>·</span>
                  <span>{c.share}% share</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${c.share * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
