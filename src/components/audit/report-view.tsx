import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreGauge } from "@/components/score-gauge";
import { getDomain } from "@/lib/audit-config";
import { scoreBand } from "@/lib/utils";
import type { AuditReport } from "@/lib/types";

const SEVERITY_VARIANT = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
} as const;

const IMPACT_VARIANT = {
  high: "success",
  medium: "warning",
  low: "secondary",
} as const;

function scoreColor(score: number) {
  if (score >= 75) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-destructive";
}

export function ReportView({ report }: { report: AuditReport }) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-8 p-8 md:flex-row md:items-center">
          <ScoreGauge score={report.overallScore} />
          <div className="flex-1 text-center md:text-left">
            <Badge variant={scoreBand(report.overallScore).tone}>
              {scoreBand(report.overallScore).label}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              {report.headline}
            </h2>
            <p className="mt-2 text-muted-foreground">{report.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Generated via {report.provider} ·{" "}
              {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pillar scores */}
      <Card>
        <CardHeader>
          <CardTitle>Pillar scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.domainScores.map((d) => (
            <div key={d.domain}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {getDomain(d.domain).title}
                </span>
                <span className="text-sm font-semibold">{d.score}/100</span>
              </div>
              <Progress
                value={d.score}
                indicatorClassName={scoreColor(d.score)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {d.summary}
              </p>
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
          <CardContent>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Issues */}
      {report.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Key issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium">{issue.title}</h4>
                  <Badge variant={SEVERITY_VARIANT[issue.severity]}>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {issue.description}
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {getDomain(issue.domain).title}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.recommendations.map((rec) => (
              <div key={rec.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="font-medium">{rec.title}</h4>
                  <div className="flex gap-2">
                    <Badge variant={IMPACT_VARIANT[rec.impact]}>
                      Impact: {rec.impact}
                    </Badge>
                    <Badge variant="outline">Effort: {rec.effort}</Badge>
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {rec.description}
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {getDomain(rec.domain).title}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
