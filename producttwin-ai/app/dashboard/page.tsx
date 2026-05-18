"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import Link from "next/link";
import {
  DollarSign,
  Users,
  TrendingUp,
  Gauge,
  Sparkles,
  ShieldCheck,
  Clock,
  Activity,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTwinStore } from "@/lib/store";
import { generateRecommendations, riskScore, simulate } from "@/lib/engine";
import { formatCurrency, formatNumber } from "@/lib/utils";

const BAND_COLOR: Record<string, string> = {
  critical: "#f43f5e",
  high: "#f97316",
  moderate: "#f59e0b",
  healthy: "#22c55e",
  strong: "#10b981",
};

export default function DashboardPage() {
  const { assumptions } = useTwinStore();
  const sim = useMemo(() => simulate(assumptions), [assumptions]);
  const risk = useMemo(() => riskScore(assumptions, sim), [assumptions, sim]);
  const recs = useMemo(
    () => generateRecommendations(assumptions, sim, risk),
    [assumptions, sim, risk],
  );

  const trendData = sim.months.map((m, i) => ({
    month: m,
    MRR: sim.mrr[i],
    Users: sim.users[i],
  }));

  return (
    <AppShell
      title="Executive overview"
      subtitle="Your product's digital twin at a glance — financials, risk, and the next 3 moves."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Projected ARR · Y1"
          value={formatCurrency(sim.projectedArrYear1, { compact: true })}
          delta={sim.monthlyGrowthRate}
          hint="month-over-month"
          icon={DollarSign}
          tone="good"
        />
        <StatCard
          label="LTV : CAC"
          value={`${sim.ltvCacRatio}x`}
          hint={sim.ltvCacRatio >= 3 ? "above benchmark" : "below 3.0 benchmark"}
          icon={TrendingUp}
          tone={sim.ltvCacRatio >= 3 ? "good" : "warn"}
        />
        <StatCard
          label="Payback"
          value={`${sim.paybackMonths} mo`}
          hint={sim.paybackMonths <= 15 ? "healthy" : "long"}
          icon={Clock}
          tone={sim.paybackMonths <= 15 ? "good" : "warn"}
        />
        <StatCard
          label="Risk score"
          value={`${risk.overall} / 100`}
          hint={risk.band}
          icon={ShieldCheck}
          tone={
            risk.overall >= 65 ? "good" : risk.overall >= 50 ? "warn" : "bad"
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue & user growth</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                36-month forward simulation based on current assumptions
              </p>
            </div>
            <Badge variant="info">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.4)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(v, n) =>
                        n === "MRR" ? formatCurrency(v, { compact: true }) : formatNumber(v)
                      }
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="MRR"
                  stroke="#a78bfa"
                  fill="url(#mrr)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Users"
                  stroke="#22d3ee"
                  fill="url(#users)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk composite</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted across 5 dimensions
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[
                    { name: "score", value: risk.overall, fill: BAND_COLOR[risk.band] },
                  ]}
                  startAngle={210}
                  endAngle={-30}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "rgba(255,255,255,0.06)" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-semibold">{risk.overall}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5 capitalize">
                  {risk.band}
                </div>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {[
                ["Financial", risk.financial],
                ["Market", risk.market],
                ["Execution", risk.execution],
                ["Compliance", risk.compliance],
                ["Product", risk.product],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                  <Progress value={v as number} className="h-1 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Top strategic moves</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Ranked by projected impact on growth and risk reduction
              </p>
            </div>
            <Link href="/recommendations">
              <Button variant="ghost" size="sm">
                See all
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recs.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant={
                          r.priority === "high"
                            ? "destructive"
                            : r.priority === "medium"
                              ? "warning"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {r.priority} priority
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {r.category}
                      </Badge>
                    </div>
                    <div className="font-medium leading-snug">{r.title}</div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {r.rationale}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Impact
                    </div>
                    <div className="text-2xl font-semibold gradient-text-blue">
                      {r.impact}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unit economics</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Snapshot at current assumptions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "ARPU", v: formatCurrency(assumptions.pricePerMonth), i: DollarSign },
                { l: "Gross margin", v: `${sim.grossMargin}%`, i: Gauge },
                { l: "LTV", v: formatCurrency(sim.ltv, { compact: true }), i: TrendingUp },
                { l: "Active users · Y1", v: formatNumber(sim.users[11] ?? 0, { compact: true }), i: Users },
                { l: "Burn · Y1", v: formatCurrency(Math.max(sim.burn[11] ?? 0, 0), { compact: true }), i: Activity },
                {
                  l: "Break-even",
                  v: sim.breakEvenMonth ? `M${sim.breakEvenMonth}` : "36+",
                  i: Sparkles,
                },
              ].map((s) => {
                const Icon = s.i;
                return (
                  <div
                    key={s.l}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {s.l}
                      </span>
                      <Icon className="h-3 w-3 text-muted-foreground/60" />
                    </div>
                    <div className="text-lg font-semibold mt-1">{s.v}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
