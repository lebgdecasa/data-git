"use client";

import { useState } from "react";
import { Copy, Check, Share2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Shareable report link — placeholder. Public sharing isn't enabled yet; this
 * previews the share URL and lets the user copy it. Wiring up a public,
 * tokenised `/shared/[id]` route is a future enhancement.
 */
export function ShareReportButton({
  auditId,
  ...props
}: { auditId: string } & ButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shared/${auditId}`
      : `/shared/${auditId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied (preview)");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" {...props}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this report</DialogTitle>
          <DialogDescription>
            Anyone with the link will be able to view a read-only version of
            this audit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input readOnly value={shareUrl} className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <span>
            Public sharing is coming soon. This is a preview of your share link —
            the public view isn&apos;t live yet, so keep the link private for now.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
