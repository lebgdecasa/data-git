"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Consistent "next step" CTA that appears at the bottom of every page.
 * Creates a sense of flow between modules and removes "what do I do next?" dead-ends.
 */
export function NextStep({
  label,
  description,
  href,
  disabled,
  disabledHint,
}: {
  label: string;
  description?: string;
  href: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <div className="mt-10 lg:mt-14">
      <div className="divider-soft mb-8" />
      <div className="glass-elevated rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1.5 text-indigo-300">Next step</p>
          <h3 className="text-lg font-semibold text-white mb-1">{label}</h3>
          {description && (
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">{description}</p>
          )}
          {disabled && disabledHint && (
            <p className="text-xs text-amber-300 mt-2">{disabledHint}</p>
          )}
        </div>
        <Link href={href} className={disabled ? "pointer-events-none" : ""}>
          <Button size="lg" disabled={disabled}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
