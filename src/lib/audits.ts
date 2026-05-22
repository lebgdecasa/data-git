import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapAuditRow, type Audit, type AuditRow } from "@/lib/types";

/**
 * Server-side data access for audits. All queries run as the authenticated
 * user and are further constrained by Row Level Security in the database.
 */

export async function listAudits(): Promise<Audit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as AuditRow[]).map(mapAuditRow);
}

export async function getAudit(id: string): Promise<Audit | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAuditRow(data as AuditRow) : null;
}

export async function getDashboardStats() {
  const audits = await listAudits();
  const completed = audits.filter((a) => a.status === "completed");
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, a) => sum + (a.report?.overallScore ?? 0), 0) /
            completed.length,
        )
      : null;

  return {
    total: audits.length,
    completed: completed.length,
    inProgress: audits.filter(
      (a) => a.status === "in_progress" || a.status === "draft",
    ).length,
    avgScore,
    recent: audits.slice(0, 5),
  };
}
