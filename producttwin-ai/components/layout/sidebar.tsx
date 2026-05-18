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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/audit", label: "Product Audit", icon: ClipboardCheck },
  { href: "/simulator", label: "Scenario Simulator", icon: Sparkles },
  { href: "/kpi", label: "KPI Dashboard", icon: LineChart },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/risk", label: "Risk & Compliance", icon: ShieldCheck },
  { href: "/recommendations", label: "AI Recommendations", icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[hsl(224,44%,6%)]/60 backdrop-blur-xl">
      <Link
        href="/"
        className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.06]"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/40 blur-md rounded-lg" />
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
            <Sparkle className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">ProductTwin</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            AI Strategy Studio
          </div>
        </div>
      </Link>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                active
                  ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-foreground border border-white/[0.06]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-indigo-300" : "text-muted-foreground",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 p-4 rounded-xl glass">
        <div className="text-xs font-medium gradient-text">Pro tip</div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Edit assumptions in the Audit page to see every dashboard update in
          real time.
        </p>
      </div>
    </aside>
  );
}
