"use client";

import { cn } from "@/lib/utils";

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  formatter?: (v: number, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[hsl(224,44%,10%)]/95 backdrop-blur-md px-3 py-2 shadow-2xl text-xs">
      {label !== undefined && (
        <div className="text-muted-foreground mb-1.5">
          {typeof label === "number" ? `Month ${label}` : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={cn("h-2 w-2 rounded-full")}
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-medium">
              {formatter ? formatter(p.value, p.name) : p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
