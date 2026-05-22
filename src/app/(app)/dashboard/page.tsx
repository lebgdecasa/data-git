import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Gauge,
  PlusCircle,
} from "lucide-react";
import { getDashboardStats } from "@/lib/audits";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditCard } from "@/components/audit/audit-card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Total audits",
      value: stats.total,
      icon: ClipboardList,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: Clock,
    },
    {
      label: "Avg. score",
      value: stats.avgScore ?? "—",
      icon: Gauge,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your product health at a glance."
      >
        <Button variant="gradient" asChild>
          <Link href="/audits/new">
            <PlusCircle className="h-4 w-4" />
            New audit
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-3xl font-bold">{c.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <c.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent audits</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <p className="font-medium">No audits yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Run your first product audit to see scores, issues and
                  recommendations.
                </p>
                <Button variant="gradient" asChild className="mt-2">
                  <Link href="/audits/new">
                    <PlusCircle className="h-4 w-4" />
                    Start your first audit
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recent.map((audit) => (
                  <AuditCard key={audit.id} audit={audit} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
