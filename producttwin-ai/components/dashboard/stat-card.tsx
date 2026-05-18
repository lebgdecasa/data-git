"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  const toneRing =
    tone === "good"
      ? "from-emerald-500/15"
      : tone === "bad"
        ? "from-rose-500/15"
        : tone === "warn"
          ? "from-amber-500/15"
          : "from-indigo-500/15";

  return (
    <Card className="p-5 relative overflow-hidden">
      <div
        className={cn(
          "absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-50 bg-gradient-to-br",
          toneRing,
          "to-transparent",
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/70" />}
      </div>
      <div className="relative mt-2.5 text-2xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="relative mt-1 flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              delta >= 0
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-rose-500/10 text-rose-300",
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
