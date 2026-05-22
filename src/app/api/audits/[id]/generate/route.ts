import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAudit } from "@/lib/audit/scoringEngine";
import { mapAuditRow, type AuditRow } from "@/lib/types";

/**
 * POST /api/audits/:id/generate — run the AI audit and persist the report.
 * Runs synchronously; for heavy workloads move this to a queue/background job.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: row, error: fetchError } = await supabase
    .from("audits")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const audit = mapAuditRow(row as AuditRow);

  // Mark as generating so the UI can reflect progress.
  await supabase
    .from("audits")
    .update({ status: "generating" })
    .eq("id", params.id);

  try {
    const report = runAudit(audit.answers, {
      productName: audit.profile.productName,
    });

    const { data, error } = await supabase
      .from("audits")
      .update({ status: "completed", report })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ audit: mapAuditRow(data as AuditRow) });
  } catch (err) {
    await supabase
      .from("audits")
      .update({ status: "in_progress" })
      .eq("id", params.id);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate report.",
      },
      { status: 500 },
    );
  }
}
