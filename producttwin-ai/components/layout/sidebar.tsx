"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  ScanSearch,
  Sparkles,
  BarChart3,
  Lightbulb,
  Sparkle,
  X,
  Map,
  ShieldCheck,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";

type Step = {
  num: string;
  href: string;
  label: string;
  icon: typeof ClipboardList;
};

const STEPS: Step[] = [
  { num: "01", href: "/audit",           label: "Business Profile",    icon: ClipboardList },
  { num: "02", href: "/dashboard",       label: "Business Audit",      icon: ScanSearch },
  { num: "03", href: "/simulator",       label: "Scenario Simulator",  icon: Sparkles },
  { num: "04", href: "/kpi",             label: "Impact Results",      icon: BarChart3 },
  { num: "05", href: "/recommendations", label: "Recommendations",     icon: Lightbulb },
];

const TOOLS = [
  { href: "/roadmap", label: "Roadmap",          icon: Map },
  { href: "/risk",    label: "Risk & Compliance", icon: ShieldCheck },
];

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const profile = useProfileStore((s) => s.profile);
  const audit = useProfileStore((s) => s.audit);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Derive step completion
  const profileDone = isProfilePopulated(profile);
  const auditDone = audit !== null;
  const stepDone = (i: number): boolean => {
    if (i === 0) return profileDone;
    if (i === 1) return auditDone;
    return false; // 02 onward: no persistence — just available
  };

  const progress = (
    (profileDone ? 1 : 0) + (auditDone ? 1 : 0)
  ) / STEPS.length * 100;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-72 shrink-0 flex flex-col",
          "border-r border-white/[0.06] bg-[hsl(240,8%,7%)]/95 lg:bg-[hsl(240,8%,7%)]/70 backdrop-blur-xl",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-6 h-16 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0" onClick={onClose}>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-indigo-500/30 blur-md rounded-lg group-hover:bg-indigo-500/50 transition-colors" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
                <Sparkle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold text-white truncate tracking-tight">ProductTwin</div>
              <div className="eyebrow">Strategy Studio</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden h-7 w-7 rounded-md hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress overview */}
        <div className="px-6 py-4 border-b border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Your journey</span>
            <span className="text-[11px] text-zinc-500 tabular-numeric">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {STEPS.map((s, i) => {
            const active = pathname === s.href || pathname?.startsWith(s.href + "/");
            const done = stepDone(i);
            return (
              <Link
                key={s.href}
                href={s.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                  active
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "border border-transparent hover:bg-white/[0.025]"
                )}
              >
                {/* Step indicator: check / number */}
                <div className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-md text-[10px] font-bold tabular-numeric transition-all shrink-0",
                  done
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : active
                      ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                      : "bg-white/[0.03] text-zinc-500 border border-white/[0.06] group-hover:text-zinc-300"
                )}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate transition-colors",
                    active ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>{s.label}</p>
                </div>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.7)]" />
                )}
              </Link>
            );
          })}

          {/* Advanced tools */}
          <div className="pt-4 mt-4 border-t border-white/[0.04]">
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className="eyebrow">Advanced</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", toolsOpen && "rotate-180")} />
            </button>
            {toolsOpen && (
              <div className="space-y-0.5 mt-1.5 fade-up">
                {TOOLS.map((t) => {
                  const active = pathname === t.href;
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                        active
                          ? "bg-white/[0.04] text-white"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom card */}
        <div className="m-3 p-4 rounded-xl glass relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkle className="h-3 w-3 text-indigo-300" />
              <span className="eyebrow text-indigo-300">Tip</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Each step builds on the last. Start with Business Profile to unlock the full report.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
