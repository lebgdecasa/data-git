"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { exportAuditToPdf } from "@/lib/pdf";
import type { Audit } from "@/lib/types";

export function ExportButton({
  audit,
  ...props
}: { audit: Audit } & ButtonProps) {
  const [busy, setBusy] = useState(false);

  function handleExport() {
    setBusy(true);
    try {
      exportAuditToPdf(audit);
    } catch (err) {
      toast.error("Export failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={busy} {...props}>
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
}
