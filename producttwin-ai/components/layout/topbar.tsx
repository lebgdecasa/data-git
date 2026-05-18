"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkedInDemoModal } from "@/components/dashboard/linkedin-demo-modal";
import { Menu, Linkedin, Activity, Sparkle } from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";

export function Topbar({
  title,
  subtitle,
  onMenuClick,
}: {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}) {
  const [demoOpen, setDemoOpen] = useState(false);
  const profile = useProfileStore((s) => s.profile);
  const populated = isProfilePopulated(profile);
  const displayName = populated ? profile.productName : "No product loaded";
  const displayStage = populated ? (profile.productType || "—") : "Empty profile";

  return (
    <>
      <LinkedInDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[hsl(222,47%,5%)]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 h-16">

          {/* Mobile menu trigger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 flex items-center justify-center text-zinc-300 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Mobile logo (visible only on mobile, since sidebar is hidden) */}
          <Link href="/" className="lg:hidden flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-md shadow-indigo-500/30 shrink-0">
              <Sparkle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white truncate">ProductTwin</span>
          </Link>

          {/* Page title + live product (desktop) */}
          <div className="hidden lg:flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-0.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="font-medium">Live twin</span>
              <span className="opacity-30">·</span>
              <span className="truncate text-zinc-400 font-medium">{displayName}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-2 py-0 h-4">
                {displayStage}
              </Badge>
            </div>
            <h1 className="text-lg lg:text-xl font-semibold tracking-tight text-white leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Mobile spacer (since title is shown in page body on mobile) */}
          <div className="flex-1 lg:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setDemoOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 border-0 transition-all"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">LinkedIn Demo Mode</span>
              <span className="sm:hidden">Demo</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
