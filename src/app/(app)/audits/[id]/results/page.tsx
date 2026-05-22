import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, PencilLine, Sparkles } from "lucide-react";
import { getAudit } from "@/lib/audits";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReportView } from "@/components/audit/report-view";
import { ExportButton } from "@/components/audit/export-button";
import { RegenerateButton } from "@/components/audit/regenerate-button";

export const metadata: Metadata = { title: "Audit results" };

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const audit = await getAudit(params.id);
  if (!audit) notFound();

  if (!audit.report) {
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

  return (
    <>
      <PageHeader
        title={audit.title}
        description={audit.profile.productName}
      >
        <Button variant="ghost" asChild>
          <Link href={`/audits/${audit.id}/questionnaire`}>
            <PencilLine className="h-4 w-4" />
            Edit answers
          </Link>
        </Button>
        <RegenerateButton auditId={audit.id} />
        <Button variant="outline" asChild>
          <Link href={`/audits/${audit.id}/report`}>
            <FileText className="h-4 w-4" />
            Report view
          </Link>
        </Button>
        <ExportButton audit={audit} variant="gradient" />
      </PageHeader>

      {audit.narrative && (
        <Card className="mb-8 border-primary/20 bg-accent/40">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Executive summary</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {audit.narrative.executiveSummary}
              </p>
            </div>
            <Button variant="outline" asChild className="shrink-0">
              <Link href={`/audits/${audit.id}/report`}>
                Read full report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ReportView report={audit.report} />
    </>
  );
}
