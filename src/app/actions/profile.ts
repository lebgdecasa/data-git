"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(
  _prev: ProfileResult,
  formData: FormData,
): Promise<ProfileResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, full_name: fullName, company },
      { onConflict: "id" },
    );
  if (profileError) return { ok: false, error: profileError.message };

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (authError) return { ok: false, error: authError.message };

  revalidatePath("/settings");
  return { ok: true };
}
