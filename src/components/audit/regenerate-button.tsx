"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

export function RegenerateButton({
  auditId,
  ...props
}: { auditId: string } & ButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRegenerate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/audits/${auditId}/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to regenerate.");
      toast.success("Audit regenerated");
      router.refresh();
    } catch (err) {
      toast.error("Regeneration failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleRegenerate}
      disabled={busy}
      {...props}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Regenerate
    </Button>
  );
}
