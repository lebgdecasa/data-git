"use client";

import { cn } from "@/lib/utils";

/**
 * Consistent page header used at the top of every primary step.
 * Reinforces the journey structure (step N of 5) and gives every page
 * a calm, structured entry point.
 */
export function PageHeader({
  step,
  title,
  description,
  eyebrow,
  actions,
}: {
  step?: number;
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  const totalSteps = 5;
  return (
    <div className="mb-8 lg:mb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          {step && (
            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: totalSteps }).map((_, i) => {
                const isCurrent = i + 1 === step;
                const isPast = i + 1 < step;
                return (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      isCurrent ? "w-8 bg-indigo-400" : isPast ? "w-5 bg-emerald-400/70" : "w-5 bg-white/10"
                    )}
                  />
                );
              })}
              <span className="ml-2 text-[11px] text-zinc-500 font-medium tabular-numeric">
                Step {step} of {totalSteps}
              </span>
            </div>
          )}
          <h1 className="text-balance mb-2">{title}</h1>
          {description && (
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl text-balance">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
