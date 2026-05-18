"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-radial-fade">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>

        <footer className="px-4 sm:px-6 lg:px-10 py-6 text-xs text-zinc-600 border-t border-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-[1400px] mx-auto">
            <span>ProductTwin AI · simulated data for demonstration · no real accounts are billed</span>
            <span className="opacity-70">v1.0 · Built with Next.js</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
