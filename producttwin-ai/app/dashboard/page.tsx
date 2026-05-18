"use client";

import { useState } from "react";
import Link from "next/link";
import { LinkedInDemoModal } from "@/components/dashboard/linkedin-demo-modal";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Linkedin,
  Map,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ─── MOCK DATA ─────────────────────────────── */
const PRODUCT = {
  name: "HealthTrack AI",
  industry: "Digital Health",
  model: "SaaS",
  stage: "Growth",
  users: 12_500,
  mrr: 48_000,
  cac: 42,
  ltv: 420,
  churnRate: 7.5,
  activationRate: 38,
  retention30: 42,
  complianceReadiness: 61,
  roadmapComplexity: 74,
};

const MRR_DATA = [
  { month: "Jan", mrr: 28_000 },
  { month: "Feb", mrr: 30_500 },
  { month: "Mar", mrr: 31_800 },
  { month: "Apr", mrr: 33_200 },
  { month: "May", mrr: 35_500 },
  { month: "Jun", mrr: 37_100 },
  { month: "Jul", mrr: 39_400 },
  { month: "Aug", mrr: 41_800 },
  { month: "Sep", mrr: 43_200 },
  { month: "Oct", mrr: 44_900 },
  { month: "Nov", mrr: 46_300 },
  { month: "Dec", mrr: 48_000 },
];

const CHURN_DATA = [
  { month: "Jul", churn: 6.2 },
  { month: "Aug", churn: 7.1 },
  { month: "Sep", churn: 6.8 },
  { month: "Oct", churn: 7.9 },
  { month: "Nov", churn: 7.3 },
  { month: "Dec", churn: 7.5 },
];

const FUNNEL_DATA = [
  { stage: "Visitors", value: 85_000, pct: 100, color: "#6366f1" },
  { stage: "Signups", value: 12_500, pct: 14.7, color: "#8b5cf6" },
  { stage: "Activated", value: 4_750, pct: 38, color: "#a855f7" },
  { stage: "Retained D30", value: 1_995, pct: 42, color: "#d946ef" },
];

const RISK_RADAR = [
  { axis: "Revenue", value: 82 },
  { axis: "Activation", value: 38 },
  { axis: "Retention", value: 35 },
  { axis: "Compliance", value: 61 },
  { axis: "Roadmap", value: 26 },
  { axis: "PMF Signal", value: 48 },
];

/* ─── SCORE DERIVATIONS ─────────────────────── */
const HEALTH_SCORE = 49;
const PMF_SCORE = 44;
const REVENUE_EFF = 78;
const RETENTION_RISK = 28;

const DIAGNOSES = [
  {
    icon: TrendingUp,
    tone: "good",
    title: "Promising monetization",
    body: "LTV:CAC ratio of 10x is exceptional. Revenue efficiency is a genuine competitive moat — protect it as you scale.",
  },
  {
    icon: Zap,
    tone: "bad",
    title: "Activation is critically weak",
    body: "Only 38% of new signups reach the aha moment. This is the single highest-leverage fix: 10 points here unlocks compounding retention.",
  },
  {
    icon: TrendingDown,
    tone: "bad",
    title: "Churn is unsustainably high",
    body: "7.5% monthly churn means ~62% annual logo loss. At this rate, growth is a treadmill — every new user barely replaces one lost.",
  },
  {
    icon: ShieldAlert,
    tone: "warn",
    title: "Compliance blocks enterprise",
    body: "61% compliance readiness closes the door on any deal above $10K ACV. SOC 2 Type I is a 90-day priority, not a roadmap item.",
  },
  {
    icon: Map,
    tone: "warn",
    title: "Roadmap needs hard cuts",
    body: "Complexity at 74% is a velocity killer. Freeze everything outside the top 3 bets — activation, churn, and compliance — this quarter.",
  },
];

const TONE_MAP = {
  good: {
    icon: "text-emerald-300",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/[0.06]",
    dot: "bg-emerald-400",
  },
  warn: {
    icon: "text-amber-300",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.06]",
    dot: "bg-amber-400",
  },
  bad: {
    icon: "text-rose-300",
    border: "border-rose-500/20",
    bg: "bg-rose-500/[0.06]",
    dot: "bg-rose-400",
  },
};

/* ─── HELPERS ───────────────────────────────── */
function ScoreRing({
  score,
  size = 96,
  strokeWidth = 8,
  color,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

function MetricCard({
  title,
  value,
  sub,
  score,
  tone,
  icon: Icon,
  detail,
}: {
  title: string;
  value: string;
  sub?: string;
  score: number;
  tone: "good" | "warn" | "bad";
  icon: any;
  detail?: string;
}) {
  const colors = {
    good: { ring: "#22c55e", bg: "from-emerald-500/10", badge: "success" as const },
    warn: { ring: "#f59e0b", bg: "from-amber-500/10", badge: "warning" as const },
    bad: { ring: "#f43f5e", bg: "from-rose-500/10", badge: "destructive" as const },
  }[tone];

  return (
    <Card className={cn("relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 hover:shadow-xl hover:border-white/[0.1]")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", colors.bg, "to-transparent")} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] grid place-items-center">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <Badge variant={colors.badge} className="text-[10px]">
            {score}/100
          </Badge>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            {detail && <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{detail}</p>}
          </div>
          <div className="relative shrink-0">
            <ScoreRing score={score} size={52} strokeWidth={5} color={colors.ring} />
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
              <span className="text-[11px] font-bold tabular-nums">{score}</span>
            </div>
          </div>
        </div>
        <Progress
          value={score}
          className="h-1 mt-4"
          indicatorClassName={cn(
            tone === "good" ? "from-emerald-500 to-emerald-400" :
            tone === "warn" ? "from-amber-500 to-amber-400" :
            "from-rose-500 to-rose-400"
          )}
        />
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[hsl(224,44%,10%)]/95 backdrop-blur-md px-3 py-2 shadow-2xl text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="font-medium">{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── PAGE ──────────────────────────────────── */
export default function DashboardPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <AppShell title="Product Dashboard" subtitle="Real-time health overview · HealthTrack AI">

      <LinkedInDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* ── PRODUCT IDENTITY HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 rounded-2xl glass">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/40 blur-xl rounded-xl" />
            <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-semibold tracking-tight">{PRODUCT.name}</h2>
              <Badge variant="secondary">{PRODUCT.stage}</Badge>
              <Badge variant="info">{PRODUCT.model}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{PRODUCT.industry} · {PRODUCT.users.toLocaleString()} monthly users · MRR ${(PRODUCT.mrr / 1000).toFixed(0)}k</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/simulator">
            <Button variant="secondary" size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Run Scenario
            </Button>
          </Link>
          <Link href="/audit">
            <Button variant="secondary" size="sm">
              <BarChart3 className="h-3.5 w-3.5" />
              Audit Product
            </Button>
          </Link>
          <Link href="/roadmap">
            <Button size="sm">
              <Map className="h-3.5 w-3.5" />
              Prioritize Roadmap
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setDemoOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
          >
            <Linkedin className="h-3.5 w-3.5" />
            Generate LinkedIn Demo Summary
          </Button>
        </div>
      </div>

      {/* ── OVERALL HEALTH SCORE ── */}
      <div className="relative mb-6 rounded-2xl overflow-hidden glass p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(124,58,237,0.18),transparent_55%)]" />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative shrink-0">
            <ScoreRing score={HEALTH_SCORE} size={120} strokeWidth={10} color="#f59e0b" />
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
              <span className="text-3xl font-bold tabular-nums">{HEALTH_SCORE}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">/ 100</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Product Health Score</p>
              <Badge variant="warning">Needs attention</Badge>
            </div>
            <p className="text-lg font-semibold leading-snug max-w-xl">
              Strong monetization foundation undercut by poor activation and unsustainable churn.
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
              LTV:CAC of <span className="text-foreground font-medium">10x</span> is world-class, but 7.5% monthly churn is erasing top-of-funnel gains.
              Two fixes — activation and churn — unlock compounding growth. Everything else is secondary.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {[
                { l: "LTV : CAC", v: "10x", t: "good" },
                { l: "Churn", v: "7.5%/mo", t: "bad" },
                { l: "Activation", v: "38%", t: "bad" },
                { l: "Compliance", v: "61%", t: "warn" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg glass px-3 py-1.5 text-xs flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.t === "good" ? "bg-emerald-400" : s.t === "bad" ? "bg-rose-400" : "bg-amber-400")} />
                  <span className="text-muted-foreground">{s.l}</span>
                  <span className="font-medium">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6 KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Product Health Score"
          value="49 / 100"
          sub="Needs attention"
          score={49}
          tone="warn"
          icon={Gauge}
          detail="Monetization strong; activation + churn require urgent focus."
        />
        <MetricCard
          title="PMF Readiness"
          value="44 / 100"
          sub="Below threshold"
          score={44}
          tone="bad"
          icon={Brain}
          detail="Weak activation and high churn signal unclear value delivery."
        />
        <MetricCard
          title="Revenue Efficiency"
          value="10x LTV:CAC"
          sub="$420 LTV · $42 CAC"
          score={78}
          tone="good"
          icon={TrendingUp}
          detail="Outstanding unit economics. Scale acquisition carefully."
        />
        <MetricCard
          title="Retention Risk"
          value="7.5% churn"
          sub="42% D30 retained"
          score={28}
          tone="bad"
          icon={TrendingDown}
          detail="At current churn, ~62% of logos lost annually."
        />
        <MetricCard
          title="Compliance Risk"
          value="61% ready"
          sub="39% gap remaining"
          score={61}
          tone="warn"
          icon={ShieldCheck}
          detail="Blocks enterprise deals above $10K ACV without SOC 2."
        />
        <MetricCard
          title="Execution Complexity"
          value="74 / 100"
          sub="High complexity"
          score={26}
          tone="bad"
          icon={Map}
          detail="Roadmap sprawl is throttling velocity. Cut 30% this sprint."
        />
      </div>

      {/* ── CHARTS + AI PANEL ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* LEFT: charts column (2/3) */}
        <div className="lg:col-span-2 space-y-4">

          {/* MRR Growth */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>MRR Growth</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Jan–Dec · trailing 12 months</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">$48,000</div>
                  <div className="flex items-center justify-end gap-1 text-xs text-emerald-300 mt-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    +71.4% YTD
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MRR_DATA}>
                  <defs>
                    <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip prefix="$" />} />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="#a78bfa" fill="url(#mrr-fill)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Churn + Funnel side by side */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Churn Trend */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Churn Trend</CardTitle>
                  <Badge variant="destructive">High</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Last 6 months · % monthly</p>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHURN_DATA}>
                    <defs>
                      <linearGradient id="churn-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} domain={[5, 9]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                    <Area type="monotone" dataKey="churn" name="Churn" stroke="#fb7185" fill="url(#churn-fill)" strokeWidth={2} dot={{ r: 3, fill: "#fb7185", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activation Funnel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activation Funnel</CardTitle>
                <p className="text-xs text-muted-foreground">Monthly · top to bottom</p>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {FUNNEL_DATA.map((f, i) => (
                  <div key={f.stage}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-muted-foreground">{f.stage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums">{f.value.toLocaleString()}</span>
                        {i > 0 && (
                          <span className="text-[10px] text-muted-foreground">·{f.pct}%</span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(f.value / FUNNEL_DATA[0].value) * 100}%`,
                          background: f.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Risk Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Risk Breakdown</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Higher = healthier. Radar imbalance = where the product is breaking down.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RISK_RADAR} outerRadius="75%">
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="axis" stroke="rgba(255,255,255,0.55)" fontSize={11} />
                      <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} strokeWidth={2} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5">
                  {RISK_RADAR.map((r) => {
                    const tone = r.value >= 65 ? "good" : r.value >= 45 ? "warn" : "bad";
                    const bar = tone === "good" ? "from-emerald-500 to-emerald-400" : tone === "warn" ? "from-amber-500 to-amber-400" : "from-rose-500 to-rose-400";
                    return (
                      <div key={r.axis}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{r.axis}</span>
                          <span className={cn("font-medium tabular-nums", tone === "good" ? "text-emerald-300" : tone === "warn" ? "text-amber-300" : "text-rose-300")}>
                            {r.value}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${bar}`} style={{ width: `${r.value}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: AI Insight Panel (1/3) */}
        <div className="space-y-4">
          <Card glow className="sticky top-20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/50 blur-md rounded-lg" />
                  <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle>Strategic Diagnosis</CardTitle>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">AI-generated · live twin</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-indigo-500/40 pl-3">
                HealthTrack AI has excellent unit economics but is leaking value at the top of the funnel.
                The priority is plugging activation and retention before scaling spend.
              </p>

              <div className="space-y-2.5 mt-1">
                {DIAGNOSES.map((d) => {
                  const Icon = d.icon;
                  const t = TONE_MAP[d.tone as keyof typeof TONE_MAP];
                  return (
                    <div key={d.title} className={cn("rounded-xl border p-3.5", t.border, t.bg)}>
                      <div className="flex items-start gap-2.5">
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", t.icon)} />
                        <div>
                          <p className="text-xs font-semibold">{d.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{d.body}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Recommended actions</p>
                <Link href="/simulator" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-between">
                    Run Scenario Simulation
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/audit" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-between">
                    Full Product Audit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href="/roadmap" className="block">
                  <Button size="sm" className="w-full justify-between">
                    Prioritize Roadmap
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Key metrics snapshot</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "MRR", v: "$48k" },
                    { l: "Users", v: "12,500" },
                    { l: "CAC", v: "$42" },
                    { l: "LTV", v: "$420" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</p>
                      <p className="text-sm font-semibold mt-0.5">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </AppShell>
  );
}
