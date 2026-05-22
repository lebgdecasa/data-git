import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  ClipboardList,
  Lightbulb,
  PencilLine,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getAudit } from "@/lib/audits";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreGauge } from "@/components/score-gauge";
import {
  DimensionBarChart,
  DimensionRadarChart,
  type ChartDimension,
} from "@/components/audit/score-charts";
import { NarrativeReport } from "@/components/audit/narrative-report";
import { ExportButton } from "@/components/audit/export-button";
import { RegenerateButton } from "@/components/audit/regenerate-button";
import { SaveReportButton } from "@/components/audit/save-report-button";
import { ShareReportButton } from "@/components/audit/share-report-button";
import { dimensionRisk } from "@/lib/audit/recommendationEngine";
import type {
  DimensionId,
  DimensionResult,
  Priority,
  RagStatus,
} from "@/lib/audit/auditTypes";

export const metadata: Metadata = { title: "Audit results" };

const MATURITY_STAGES = [
  "Confused",
  "Early Validation",
  "Promising",
  "Growth Ready",
  "Scale Ready",
];

const SHORT_LABEL: Record<DimensionId, string> = {
  positioning_clarity: "Positioning",
  target_customer: "Customer",
  problem_urgency: "Urgency",
  value_proposition: "Value Prop",
  landing_conversion: "Landing",
  onboarding_friction: "Onboarding",
  feature_clarity: "Features",
  pricing_logic: "Pricing",
  trust_credibility: "Trust",
  retention_potential: "Retention",
  gtm_readiness: "GTM",
  pmf_signals: "PMF",
};

const STATUS_VARIANT: Record<RagStatus, "success" | "warning" | "destructive"> = {
  green: "success",
  yellow: "warning",
  red: "destructive",
};
const STATUS_LABEL: Record<RagStatus, string> = {
  green: "On track",
  yellow: "Needs work",
  red: "At risk",
};
const PRIORITY_VARIANT: Record<
  Priority,
  "destructive" | "warning" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const audit = await getAudit(params.id);
  if (!audit) notFound();

  const report = audit.report;
  if (!report) {
    return (
      <>
        <PageHeader title={audit.title} />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">No report yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Finish the questionnaire and generate your audit to see scores
                and recommendations.
              </p>
            </div>
            <Button variant="gradient" asChild>
              <Link href={`/audits/${audit.id}/questionnaire`}>
                Continue questionnaire
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  const narrative = audit.narrative;

  const chartData: ChartDimension[] = report.dimensions.map((d) => ({
    label: d.title,
    short: SHORT_LABEL[d.id],
    score: d.score,
    status: d.status,
  }));

  const strongest =
    report.strengths.length > 0
      ? report.strengths.slice(0, 3)
      : [...report.dimensions].sort((a, b) => b.score - a.score).slice(0, 3);
  const weakest =
    report.topPriorities.length > 0
      ? report.topPriorities.slice(0, 3)
      : [...report.dimensions].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <>
      <PageHeader title={audit.title} description={audit.profile.productName} />

      {/* Toolbar */}
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href={`/audits/${audit.id}/questionnaire`}>
            <PencilLine className="h-4 w-4" />
            Edit answers
          </Link>
        </Button>
        <RegenerateButton auditId={audit.id} />
        <SaveReportButton auditId={audit.id} />
        <ShareReportButton auditId={audit.id} />
        <ExportButton audit={audit} variant="gradient" />
      </div>

      {/* Hero: score + maturity + summary */}
      <Card className="mb-8 overflow-hidden">
        <CardContent className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex justify-center">
            <ScoreGauge score={report.overallScore} size={180} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge>{report.maturityStage}</Badge>
              <span className="text-sm text-muted-foreground">
                {report.completeness}% complete
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              {report.headline}
            </h2>
            <p className="mt-2 text-muted-foreground">{report.summary}</p>

            {/* Maturity progression */}
            <div className="mt-5 grid grid-cols-5 gap-1.5">
              {MATURITY_STAGES.map((stage) => {
                const active = stage === report.maturityStage;
                return (
                  <div key={stage} className="text-center">
                    <div
                      className={
                        active
                          ? "h-1.5 rounded-full bg-primary"
                          : "h-1.5 rounded-full bg-muted"
                      }
                    />
                    <span
                      className={
                        active
                          ? "mt-1.5 block text-[10px] font-medium text-foreground"
                          : "mt-1.5 block text-[10px] text-muted-foreground"
                      }
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview &amp; action plan</TabsTrigger>
          <TabsTrigger value="report">Full strategic report</TabsTrigger>
        </TabsList>

        {/* -------------------- OVERVIEW -------------------- */}
        <TabsContent value="overview" className="space-y-8">
          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dimension radar</CardTitle>
              </CardHeader>
              <CardContent>
                <DimensionRadarChart data={chartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scores by dimension</CardTitle>
              </CardHeader>
              <CardContent>
                <DimensionBarChart data={chartData} />
              </CardContent>
            </Card>
          </div>

          {/* Strengths + weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Strongest 3 areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {strongest.map((d) => (
                  <ScoreRow key={d.id} dimension={d} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  Weakest 3 areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weakest.map((d) => (
                  <ScoreRow key={d.id} dimension={d} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Priority issues — what's wrong, why it matters, what to fix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Priority issues — fix these first
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.topPriorities.map((d) => (
                <PriorityIssue key={d.id} dimension={d} />
              ))}
              {report.topPriorities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No critical issues — every dimension is on track. Focus on
                  compounding your strengths.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recommended actions */}
          {narrative && narrative.topActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Recommended actions
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
                          <span className="text-sm font-medium">
                            {action.title}
                          </span>
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
          )}

          {/* Quick wins */}
          {narrative && narrative.quickWins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {narrative.quickWins.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 30-day roadmap */}
          {narrative && narrative.roadmap30Day.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarRange className="h-5 w-5 text-primary" />
                  30-day improvement roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* -------------------- FULL REPORT -------------------- */}
        <TabsContent value="report">
          {narrative ? (
            <NarrativeReport narrative={narrative} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <Lightbulb className="h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">
                  No strategic narrative yet for this audit.
                </p>
                <RegenerateButton auditId={audit.id} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

// ---------------------------------------------------------------------------
// Presentational helpers
// ---------------------------------------------------------------------------
function ScoreRow({ dimension: d }: { dimension: DimensionResult }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm font-medium">
        {d.title}
        <Badge variant={STATUS_VARIANT[d.status]}>{STATUS_LABEL[d.status]}</Badge>
      </span>
      <span className="text-sm font-semibold">{d.score}/100</span>
    </div>
  );
}

function PriorityIssue({ dimension: d }: { dimension: DimensionResult }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-medium">{d.title}</h4>
        <div className="flex items-center gap-2">
          <Badge variant={PRIORITY_VARIANT[d.priority]}>
            {d.priority} priority
          </Badge>
          <Badge variant={STATUS_VARIANT[d.status]}>{d.score}/100</Badge>
        </div>
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What&apos;s wrong
          </dt>
          <dd className="text-muted-foreground">{d.explanation}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why it matters
          </dt>
          <dd className="text-muted-foreground">
            Left unaddressed, expect {dimensionRisk(d.id)}.
          </dd>
        </div>
        {d.recommendations[0] && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fix first
            </dt>
            <dd>{d.recommendations[0]}</dd>
          </div>
        )}
        {d.nextActions[0] && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              First action
            </dt>
            <dd className="flex items-start gap-1.5">
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {d.nextActions[0]}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
