import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { NewAuditForm } from "@/components/audit/new-audit-form";

export const metadata: Metadata = { title: "New audit" };

export default function NewAuditPage() {
  return (
    <>
      <PageHeader
        title="New audit"
        description="Tell us about your product. This context shapes your audit and recommendations."
      />
      <div className="max-w-3xl">
        <NewAuditForm />
      </div>
    </>
  );
}
