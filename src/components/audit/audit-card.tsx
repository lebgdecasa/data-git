import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/audit/status-badge";
import { formatDate } from "@/lib/utils";
import type { Audit } from "@/lib/types";

function targetHref(audit: Audit): string {
  if (audit.status === "completed") return `/audits/${audit.id}/results`;
  if (audit.report) return `/audits/${audit.id}/results`;
  return `/audits/${audit.id}/questionnaire`;
}

export function AuditCard({ audit }: { audit: Audit }) {
  const score = audit.report?.overallScore;

  return (
    <Link href={targetHref(audit)} className="group block">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{audit.title}</h3>
              <StatusBadge status={audit.status} />
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {audit.profile.productName || "Untitled product"} · Updated{" "}
              {formatDate(audit.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {typeof score === "number" && (
              <div className="text-right">
                <div className="text-2xl font-bold leading-none">{score}</div>
                <div className="text-xs text-muted-foreground">score</div>
              </div>
            )}
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
