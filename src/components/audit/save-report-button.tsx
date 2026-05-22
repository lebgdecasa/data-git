"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Reports are persisted automatically when generated; this gives the user an
 * explicit "save" affordance that confirms the report is kept in their history.
 */
export function SaveReportButton({
  auditId,
  ...props
}: { auditId: string } & ButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSave() {
    setState("saving");
    try {
      const res = await fetch(`/api/audits/${auditId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save.");
      }
      setState("saved");
      toast.success("Report saved", {
        description: "Find it anytime in your audit history.",
      });
      router.refresh();
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      setState("idle");
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSave}
      disabled={state === "saving"}
      {...props}
    >
      {state === "saving" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "saved" ? (
        <Check className="h-4 w-4" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {state === "saved" ? "Saved" : "Save report"}
    </Button>
  );
}
