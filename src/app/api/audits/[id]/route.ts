import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mapAuditRow,
  type AuditAnswers,
  type AuditAttachment,
  type AuditRow,
  type BusinessProfile,
} from "@/lib/types";

interface UpdateBody {
  title?: string;
  profile?: BusinessProfile;
  answers?: AuditAnswers;
  attachments?: AuditAttachment[];
  status?: AuditRow["status"];
}

/** GET /api/audits/:id */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ audit: mapAuditRow(data as AuditRow) });
}

/** PATCH /api/audits/:id — update profile / answers / attachments / status. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as UpdateBody;
  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.profile !== undefined) patch.profile = body.profile;
  if (body.answers !== undefined) patch.answers = body.answers;
  if (body.attachments !== undefined) patch.attachments = body.attachments;
  if (body.status !== undefined) patch.status = body.status;

  const { data, error } = await supabase
    .from("audits")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ audit: mapAuditRow(data as AuditRow) });
}

/** DELETE /api/audits/:id */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("audits").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
