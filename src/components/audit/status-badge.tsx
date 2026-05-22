import { Badge } from "@/components/ui/badge";
import type { AuditStatus } from "@/lib/types";

const MAP: Record<
  AuditStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  in_progress: { label: "In progress", variant: "warning" },
  generating: { label: "Generating", variant: "default" },
  completed: { label: "Completed", variant: "success" },
};

export function StatusBadge({ status }: { status: AuditStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
