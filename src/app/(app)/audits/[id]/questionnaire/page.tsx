import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAudit } from "@/lib/audits";
import { PageHeader } from "@/components/app/page-header";
import { Questionnaire } from "@/components/audit/questionnaire";

export const metadata: Metadata = { title: "Questionnaire" };

export default async function QuestionnairePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const audit = await getAudit(params.id);
  if (!audit) notFound();

  return (
    <>
      <PageHeader
        title={audit.profile.productName || "Audit questionnaire"}
        description="Answer across all six pillars, then generate your report. Required questions are marked with *."
      />
      <Questionnaire audit={audit} userId={user.id} />
    </>
  );
}
