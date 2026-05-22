import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapAuditRow, type AuditRow, type BusinessProfile } from "@/lib/types";

/** GET /api/audits — list the current user's audits. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    audits: (data as AuditRow[]).map(mapAuditRow),
  });
}

/** POST /api/audits — create a new audit from a business profile. */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { profile?: BusinessProfile };
  const profile = body.profile;

  if (!profile?.productName?.trim()) {
    return NextResponse.json(
      { error: "Product name is required." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("audits")
    .insert({
      user_id: user.id,
      title: `${profile.productName} audit`,
      status: "in_progress",
      profile,
      answers: {},
      attachments: [],
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ audit: mapAuditRow(data as AuditRow) }, { status: 201 });
}
