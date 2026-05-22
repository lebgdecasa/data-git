import {
  AlertTriangle,
  CalendarRange,
  ClipboardList,
  Compass,
  FileText,
  Flag,
  Gauge,
  Layers,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  AuditNarrative,
  Priority,
} from "@/lib/audit/auditTypes";

const PRIORITY_VARIANT: Record<
  Priority,
  "destructive" | "warning" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function NarrativeReport({ narrative }: { narrative: AuditNarrative }) {
  const analyses: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
    { icon: Compass, title: "Positioning Analysis", body: narrative.positioningAnalysis },
    { icon: FileText, title: "Landing Page Analysis", body: narrative.landingPageAnalysis },
    { icon: Layers, title: "Onboarding Analysis", body: narrative.onboardingAnalysis },
    { icon: Target, title: "Pricing Analysis", body: narrative.pricingAnalysis },
    { icon: ShieldCheck, title: "Trust & Credibility Analysis", body: narrative.trustAnalysis },
    { icon: TrendingUp, title: "PMF Signal Analysis", body: narrative.pmfAnalysis },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary */}
      <Card className="border-primary/20 bg-accent/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          {narrative.executiveSummary}
        </CardContent>
      </Card>

      {/* 2-3. Diagnosis + Score overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section icon={Stethoscope} title="Product Diagnosis">
          {narrative.productDiagnosis}
        </Section>
        <Section icon={Gauge} title="Score Overview">
          {narrative.scoreOverview}
        </Section>
      </div>

      {/* 4. Growth bottlenecks */}
      <Section icon={AlertTriangle} title="Main Growth Bottlenecks">
        <BulletList items={narrative.growthBottlenecks} />
      </Section>

      {/* 5-10. Dimension analyses */}
      <div className="grid gap-6 md:grid-cols-2">
        {analyses.map((a) => (
          <Section key={a.title} icon={a.icon} title={a.title}>
            {a.body}
          </Section>
        ))}
      </div>

      {/* 11. Top 10 actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-primary" />
            Top 10 Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {narrative.topActions.map((action, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{action.title}</span>
                    <Badge variant={PRIORITY_VARIANT[action.priority]}>
                      {action.priority}
                    </Badge>
                  </div>
                  {action.detail && (
                    <p className="text-xs text-muted-foreground">
                      {action.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* 12. 30-day roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-5 w-5 text-primary" />
            30-Day Improvement Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {narrative.roadmap30Day.map((phase, i) => (
              <div
                key={i}
                className="relative rounded-xl border bg-card p-4 pl-5"
              >
                <span className="absolute left-0 top-4 h-[calc(100%-2rem)] w-1 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{phase.timeframe}</Badge>
                  <span className="text-sm font-medium">{phase.focus}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {phase.actions.map((a, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 13-14. Quick wins + risks */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section icon={Zap} title="Quick Wins">
          <BulletList items={narrative.quickWins} />
        </Section>
        <Section icon={AlertTriangle} title="Strategic Risks">
          <BulletList items={narrative.strategicRisks} />
        </Section>
      </div>

      {/* 15. Final recommendation */}
      <Card className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="h-5 w-5" />
            Final Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-indigo-50">
          {narrative.finalRecommendation}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Report generated by the {narrative.engine === "ai" ? "AI" : "deterministic"} engine
        {narrative.model ? ` (${narrative.model})` : ""} ·{" "}
        {new Date(narrative.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
