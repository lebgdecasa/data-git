"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Sparkles,
  Lightbulb,
  Settings,
  Sparkle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

// Six items. Flat. No groups. As per NIKA spec.
const NAV: NavItem[] = [
  { href: "/dashboard",       label: "Dashboard",   icon: LayoutDashboard },
  { href: "/kpi",             label: "KPIs",        icon: BarChart3 },
  { href: "/audit",           label: "Analysis",    icon: ClipboardList },
  { href: "/simulator",       label: "Simulations", icon: Sparkles },
  { href: "/recommendations", label: "Insights",    icon: Lightbulb },
  { href: "/settings",        label: "Settings",    icon: Settings },
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
          "border-r border-white/[0.06] bg-[hsl(240,10%,6%)]/95 lg:bg-[hsl(240,10%,6%)]/70 backdrop-blur-xl",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-6 h-16 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0" onClick={onClose}>
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-violet-500/35 blur-md rounded-lg group-hover:bg-violet-500/55 transition-colors" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center">
                <Sparkle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-base font-semibold text-white tracking-tight">NIKA</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                Decision Studio
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

        {/* Six-item flat nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "text-white bg-white/[0.04]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.025]"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-150",
                    active
                      ? "text-violet-300"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quiet bottom card — version stamp only */}
        <div className="px-6 py-3 border-t border-white/[0.04]">
          <p className="text-[10px] text-zinc-600 tracking-wide">
            <span className="text-zinc-500">NIKA</span> · Decision intelligence
          </p>
        </div>
      </aside>
    </>
  );
}
