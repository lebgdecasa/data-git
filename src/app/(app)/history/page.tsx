import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, PlusCircle } from "lucide-react";
import { listAudits } from "@/lib/audits";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryList } from "@/components/audit/history-list";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const audits = await listAudits();

  return (
    <>
      <PageHeader
        title="Audit history"
        description="Every audit you've run, newest first."
      >
        <Button variant="gradient" asChild>
          <Link href="/audits/new">
            <PlusCircle className="h-4 w-4" />
            New audit
          </Link>
        </Button>
      </PageHeader>

      {audits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="font-medium">No audits yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your completed and in-progress audits will appear here.
            </p>
            <Button variant="gradient" asChild className="mt-2">
              <Link href="/audits/new">
                <PlusCircle className="h-4 w-4" />
                Start your first audit
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <HistoryList initial={audits} />
      )}
    </>
  );
}
