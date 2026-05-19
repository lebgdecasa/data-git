"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, Database, ArrowRight, Activity, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";

/**
 * First-run welcome modal.
 * Shows once when:
 *   1. User has no profile data, AND
 *   2. hasSeenWelcome is false
 * Three paths: Quick demo · Start from scratch · Take a tour
 */
export function WelcomeModal() {
  const profile = useProfileStore((s) => s.profile);
  const hasSeenWelcome = useProfileStore((s) => s.hasSeenWelcome);
  const markSeen = useProfileStore((s) => s.markWelcomeSeen);
  const loadDemo = useProfileStore((s) => s.loadDemo);

  const populated = isProfilePopulated(profile);
  const show = !hasSeenWelcome && !populated;

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") markSeen(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [show, markSeen]);

  if (!show) return null;

  const handleLoadDemo = () => {
    loadDemo();
    markSeen();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={markSeen} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[hsl(240,8%,8%)] shadow-2xl overflow-hidden">

        {/* Close */}
        <button
          onClick={markSeen}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="relative p-8 pb-6 bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-pink-500/10 border-b border-white/[0.08]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.18),transparent_60%)] pointer-events-none" />

          <div className="relative flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px]">
                Welcome
              </Badge>
              <h2 id="welcome-title" className="text-2xl font-bold text-white tracking-tight mb-1">
                Welcome to ProductTwin
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-md">
                A strategic operating dashboard for product teams. Define your product, audit it,
                simulate decisions, and get a board-ready report — all in one workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Three paths */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-zinc-500 mb-3">How would you like to start?</p>

          {/* Path 1: Demo (recommended) */}
          <button
            onClick={handleLoadDemo}
            className="w-full text-left p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 hover:border-indigo-500/50 hover:from-indigo-500/15 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 grid place-items-center shrink-0">
                <Database className="h-4 w-4 text-indigo-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white">Load NutriFlow demo</p>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                    Recommended
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Explore with realistic data (digital health SaaS, $62k MRR, 8.5% churn). 30 seconds to see every feature.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Path 2: Start from scratch */}
          <Link href="/audit" onClick={markSeen} className="block">
            <div className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/[0.05] grid place-items-center shrink-0">
                  <Activity className="h-4 w-4 text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Enter my own product data</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Start with the Business Profile form. Takes about 5 minutes to fill out properly.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>

          {/* Path 3: Skip / explore */}
          <button
            onClick={markSeen}
            className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/[0.05] grid place-items-center shrink-0">
                <BarChart3 className="h-4 w-4 text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Just explore the interface</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Look around without committing to anything. Open the AI assistant (bottom-right) whenever you need help.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500">
            <Brain className="inline h-3 w-3 mr-1 text-indigo-400" />
            Your data stays in your browser. No backend, no account, no tracking.
          </p>
          <button
            onClick={markSeen}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
