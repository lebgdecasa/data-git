"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/audit/status-badge";
import { formatDate } from "@/lib/utils";
import type { Audit } from "@/lib/types";

function targetHref(audit: Audit): string {
  return audit.report
    ? `/audits/${audit.id}/results`
    : `/audits/${audit.id}/questionnaire`;
}

export function HistoryList({ initial }: { initial: Audit[] }) {
  const router = useRouter();
  const [audits, setAudits] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/audits/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete.");
      }
      setAudits((prev) => prev.filter((a) => a.id !== id));
      toast.success("Audit deleted");
      router.refresh();
    } catch (err) {
      toast.error("Could not delete", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {audits.map((audit) => (
        <Card key={audit.id} className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <Link href={targetHref(audit)} className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{audit.title}</h3>
                <StatusBadge status={audit.status} />
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {audit.profile.productName || "Untitled product"} · Updated{" "}
                {formatDate(audit.updatedAt)}
              </p>
            </Link>
            <div className="flex items-center gap-4">
              {typeof audit.report?.overallScore === "number" && (
                <div className="text-right">
                  <div className="text-2xl font-bold leading-none">
                    {audit.report.overallScore}
                  </div>
                  <div className="text-xs text-muted-foreground">score</div>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                  {deletingId === audit.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={targetHref(audit)}>
                      <Eye className="h-4 w-4" />
                      Open
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(audit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
