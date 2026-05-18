import type { ReactNode } from "react";
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
  return (
    <div className="flex min-h-screen bg-radial-fade">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        <footer className="px-6 lg:px-10 py-6 text-xs text-muted-foreground border-t border-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              ProductTwin AI · simulated data for demonstration · no real
              accounts are billed
            </span>
            <span className="opacity-70">v0.1 · built with Next.js</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
