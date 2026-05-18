"use client";

import Link from "next/link";
import { useTwinStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Activity } from "lucide-react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { assumptions, reset } = useTwinStore();
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[hsl(222,47%,5%)]/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 lg:px-10 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>Live twin</span>
            <span className="opacity-40">•</span>
            <span className="truncate">{assumptions.productName}</span>
            <Badge variant="secondary" className="ml-1 capitalize">
              {assumptions.stage}
            </Badge>
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => reset()}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Link href="/audit">
            <Button size="sm">Edit assumptions</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
