import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAudit } from "@/lib/audits";
import { Button } from "@/components/ui/button";
import { ReportView } from "@/components/audit/report-view";
import { ExportButton } from "@/components/audit/export-button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Report" };

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const audit = await getAudit(params.id);
  if (!audit || !audit.report) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" asChild>
          <Link href={`/audits/${audit.id}/results`}>
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Link>
        </Button>
        <ExportButton audit={audit} variant="gradient" />
      </div>

      {/* Report header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-white">
        <p className="text-sm font-medium text-indigo-100">
          Product Audit Report
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {audit.profile.productName}
        </h1>
        <p className="mt-2 text-indigo-100">
          {audit.profile.industry ? `${audit.profile.industry} · ` : ""}
          Generated {formatDate(audit.report.generatedAt)}
        </p>
      </div>

      <ReportView report={audit.report} />
    </div>
  );
}
