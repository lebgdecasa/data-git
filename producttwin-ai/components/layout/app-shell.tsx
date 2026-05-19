"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Assistant } from "@/components/assistant/assistant";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";

/**
 * Application shell — sidebar + topbar + content + always-on guidance.
 * Title and description are owned by the PageHeader on each page.
 */
export function AppShell({
  children,
  title: _title,
  subtitle: _subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-12 py-8 lg:py-12 max-w-[1280px] w-full mx-auto">
          {children}
        </main>

        <footer className="px-4 sm:px-6 lg:px-12 py-8 text-xs text-zinc-600 border-t border-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-[1280px] mx-auto">
            <span>ProductTwin · simulated data for demonstration · no real accounts are billed</span>
            <span className="opacity-70">v1.0 · Built with Next.js</span>
          </div>
        </footer>
      </div>

      {/* Always-on guidance layer */}
      <WelcomeModal />
      <Assistant />
    </div>
  );
}
