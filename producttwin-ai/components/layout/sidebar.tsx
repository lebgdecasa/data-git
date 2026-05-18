"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Sparkles,
  LineChart,
  Map,
  ShieldCheck,
  Lightbulb,
  Sparkle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Diagnose",
    items: [
      { href: "/audit",      label: "Product Audit",      icon: ClipboardCheck },
      { href: "/simulator",  label: "Scenario Simulator", icon: Sparkles },
      { href: "/kpi",        label: "KPI Dashboard",      icon: LineChart },
    ],
  },
  {
    title: "Plan",
    items: [
      { href: "/roadmap",         label: "Roadmap",             icon: Map },
      { href: "/risk",            label: "Risk & Compliance",   icon: ShieldCheck },
      { href: "/recommendations", label: "AI Recommendations",  icon: Lightbulb },
    ],
  },
];

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

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
          "fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-64 shrink-0 flex flex-col",
          "border-r border-white/[0.06] bg-[hsl(224,44%,6%)]/95 lg:bg-[hsl(224,44%,6%)]/60 backdrop-blur-xl",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0" onClick={onClose}>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-indigo-500/40 blur-md rounded-lg group-hover:bg-indigo-500/60 transition-colors" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg shadow-indigo-500/30">
                <Sparkle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm font-bold text-white truncate">ProductTwin</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                Strategy Studio
              </div>
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title} className={cn(gi > 0 && "mt-5")}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-semibold px-3 mb-1.5">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        active
                          ? "text-white bg-gradient-to-r from-indigo-500/20 via-indigo-500/10 to-transparent"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-all duration-150",
                          active
                            ? "text-indigo-300"
                            : "text-zinc-500 group-hover:text-zinc-300 group-hover:scale-110"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pro tip / demo product card */}
        <div className="m-3 p-4 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkle className="h-3 w-3 text-indigo-300" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-indigo-300 font-bold">Pro Tip</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Run a Scenario in the Simulator, then check the Strategic Report to see the full impact analysis.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
