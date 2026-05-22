import { AlertTriangle, ArrowRight, Lightbulb, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreGauge } from "@/components/score-gauge";
import { cn } from "@/lib/utils";
import type {
  AuditResult,
  DimensionResult,
  MaturityStage,
  Priority,
  RagStatus,
} from "@/lib/audit/auditTypes";

const MATURITY_STAGES: MaturityStage[] = [
  "Confused",
  "Early Validation",
  "Promising",
  "Growth Ready",
  "Scale Ready",
];

const STATUS_VARIANT: Record<
  RagStatus,
  "success" | "warning" | "destructive"
> = {
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

function barColor(status: RagStatus) {
  if (status === "green") return "bg-success";
  if (status === "yellow") return "bg-warning";
  return "bg-destructive";
}

export function ReportView({ report }: { report: AuditResult }) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-8 p-8 md:flex-row">
          <ScoreGauge score={report.overallScore} />
          <div className="flex-1 text-center md:text-left">
            <Badge>{report.maturityStage}</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              {report.headline}
            </h2>
            <p className="mt-2 text-muted-foreground">{report.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {report.completeness}% of questions answered · {report.engine} engine ·{" "}
              {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Maturity stage progression */}
      <Card>
        <CardHeader>
          <CardTitle>Maturity stage</CardTitle>
          <CardDescription>{report.maturitySummary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {MATURITY_STAGES.map((stage) => {
              const active = stage === report.maturityStage;
              return (
                <div
                  key={stage}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center text-xs font-medium",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {stage}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category scores */}
      <Card>
        <CardHeader>
          <CardTitle>Category scores</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {report.categories.map((c) => (
            <div key={c.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium">{c.title}</span>
                <span className="text-sm font-semibold">{c.score}/100</span>
              </div>
              <Progress value={c.score} indicatorClassName={barColor(c.status)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top priorities */}
      {report.topPriorities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Top priorities
            </CardTitle>
            <CardDescription>
              The highest-leverage areas to fix first, in order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.topPriorities.map((d) => (
              <DimensionDetail key={d.id} dimension={d} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Full dimension breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>All 12 dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.dimensions.map((d) => (
            <div key={d.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {d.title}
                  <Badge variant={STATUS_VARIANT[d.status]}>
                    {STATUS_LABEL[d.status]}
                  </Badge>
                </span>
                <span className="text-sm font-semibold">{d.score}/100</span>
              </div>
              <Progress value={d.score} indicatorClassName={barColor(d.status)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths */}
      {report.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.strengths.map((d) => (
              <div key={d.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium">{d.title}</h4>
                  <span className="text-sm font-semibold">{d.score}/100</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {d.explanation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DimensionDetail({ dimension: d }: { dimension: DimensionResult }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-medium">{d.title}</h4>
        <div className="flex items-center gap-2">
          <Badge variant={PRIORITY_VARIANT[d.priority]}>{d.priority}</Badge>
          <Badge variant={STATUS_VARIANT[d.status]}>{d.score}/100</Badge>
        </div>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{d.explanation}</p>

      {d.recommendations.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations
          </p>
          <ul className="mt-1.5 space-y-1">
            {d.recommendations.map((r, i) => (
              <li key={i} className="text-sm">
                • {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {d.nextActions.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested next actions
          </p>
          <ul className="mt-1.5 space-y-1">
            {d.nextActions.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
