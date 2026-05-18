"use client";

import { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  RadialBar,
  RadialBarChart,
  Tooltip,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { useTwinStore } from "@/lib/store";
import { riskScore, simulate } from "@/lib/engine";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  FileWarning,
  Lock,
  Globe,
  Scale,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BAND_TONE: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "#f43f5e", bg: "bg-rose-500/10 text-rose-200 border-rose-500/20", label: "Critical" },
  high: { color: "#f97316", bg: "bg-orange-500/10 text-orange-200 border-orange-500/20", label: "High risk" },
  moderate: { color: "#f59e0b", bg: "bg-amber-500/10 text-amber-200 border-amber-500/20", label: "Moderate" },
  healthy: { color: "#22c55e", bg: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20", label: "Healthy" },
  strong: { color: "#10b981", bg: "bg-emerald-500/15 text-emerald-200 border-emerald-500/25", label: "Strong" },
};

export default function RiskPage() {
  const { assumptions } = useTwinStore();
  const sim = useMemo(() => simulate(assumptions), [assumptions]);
  const risk = useMemo(() => riskScore(assumptions, sim), [assumptions, sim]);
  const tone = BAND_TONE[risk.band];

  const radarData = [
    { axis: "Financial", value: risk.financial },
    { axis: "Market", value: risk.market },
    { axis: "Execution", value: risk.execution },
    { axis: "Compliance", value: risk.compliance },
    { axis: "Product", value: risk.product },
  ];

  const complianceChecklist = [
    { label: "SOC 2 readiness", ok: assumptions.complianceRisk < 35, desc: "Required for enterprise procurement above $50K ACV." },
    { label: "GDPR data controls", ok: assumptions.complianceRisk < 50, desc: "DPA, subprocessor list, right-to-erasure flow." },
    { label: "SSO + audit logs", ok: assumptions.complianceRisk < 45, desc: "Standard table-stakes for IT review." },
    { label: "Pen-test cadence", ok: assumptions.complianceRisk < 30, desc: "Annual 3rd-party penetration test with public attestation." },
    { label: "Trust center published", ok: assumptions.complianceRisk < 40, desc: "Single page with certifications, subprocessors, status." },
    { label: "DPA / privacy policy current", ok: assumptions.complianceRisk < 55, desc: "Reviewed within the last 12 months." },
  ];

  const riskRegister = [
    {
      icon: ShieldAlert,
      title: "Concentration risk",
      severity: assumptions.monthlyChurn > 5 ? "high" : "moderate",
      desc: "Single-segment ICP reliance plus elevated churn compresses runway under any softness in the funnel.",
    },
    {
      icon: FileWarning,
      title: "Compliance gating",
      severity: assumptions.complianceRisk > 50 ? "high" : assumptions.complianceRisk > 25 ? "moderate" : "low",
      desc: "Pending SOC 2 limits the enterprise pipeline and forces longer security reviews per deal.",
    },
    {
      icon: Scale,
      title: "Pricing fragility",
      severity: assumptions.pricePerMonth < 50 ? "high" : "moderate",
      desc: "Low ARPU amplifies CAC sensitivity; one channel underperforming materially degrades payback.",
    },
    {
      icon: Globe,
      title: "Market timing",
      severity: assumptions.marketSize < 1000 ? "high" : "low",
      desc: "TAM headroom for the next 3 years of growth. Below $1B materially caps the venture return profile.",
    },
    {
      icon: Building2,
      title: "Org execution",
      severity: assumptions.roadmapComplexity > 60 ? "high" : "moderate",
      desc: "Roadmap surface area divided by current team size determines shipping velocity and burnout risk.",
    },
  ];

  return (
    <AppShell
      title="Risk & compliance score"
      subtitle="A composite read on execution, market, financial, compliance, and product risk."
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Composite score</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted across 5 dimensions
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="68%"
                  outerRadius="100%"
                  data={[{ name: "score", value: risk.overall, fill: tone.color }]}
                  startAngle={210}
                  endAngle={-30}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "rgba(255,255,255,0.06)" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-5xl font-semibold tracking-tight">{risk.overall}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  / 100
                </div>
                <Badge variant="secondary" className={cn("mt-3", tone.bg)}>
                  {tone.label}
                </Badge>
              </div>
            </div>
            <div className="space-y-2.5 mt-2">
              {[
                ["Financial", risk.financial, "Cash, payback, LTV:CAC"],
                ["Market", risk.market, "TAM, demand, ICP fit"],
                ["Execution", risk.execution, "Roadmap, team, focus"],
                ["Compliance", risk.compliance, "Security, privacy, contracts"],
                ["Product", risk.product, "Activation, retention, friction"],
              ].map(([k, v, d]) => (
                <div key={k as string}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{k}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {v as number} / 100
                    </span>
                  </div>
                  <Progress value={v as number} className="h-1.5 mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{d as string}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk dimensions</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Higher = healthier. Aim for a balanced shape above 60.
            </p>
          </CardHeader>
          <CardContent className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="axis" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Radar
                  dataKey="value"
                  stroke="#a78bfa"
                  fill="#a78bfa"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-300" />
              Compliance checklist
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Enterprise procurement table-stakes
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {complianceChecklist.map((c) => (
              <div
                key={c.label}
                className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
              >
                {c.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-medium">{c.label}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-300" />
              Risk register
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Top hazards in the next 6 months
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskRegister.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-indigo-300" />
                      <span className="text-sm font-medium">{r.title}</span>
                    </div>
                    <Badge
                      variant={
                        r.severity === "high"
                          ? "destructive"
                          : r.severity === "moderate"
                            ? "warning"
                            : "success"
                      }
                      className="capitalize"
                    >
                      {r.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
