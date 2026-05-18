"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LinkedInDemoModal } from "@/components/dashboard/linkedin-demo-modal";
import { Menu, Linkedin, Sparkle } from "lucide-react";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";

export function Topbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const [demoOpen, setDemoOpen] = useState(false);
  const profile = useProfileStore((s) => s.profile);
  const populated = isProfilePopulated(profile);

  return (
    <>
      <LinkedInDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[hsl(240,8%,6%)]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 h-14">

          {/* Mobile menu */}
          <button
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 flex items-center justify-center text-zinc-300 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0">
              <Sparkle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white truncate">ProductTwin</span>
          </Link>

          {/* Current product chip — desktop only */}
          <div className="hidden lg:flex items-center gap-2.5 min-w-0 flex-1">
            {populated ? (
              <>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs text-zinc-500">Working on</span>
                <span className="text-sm font-medium text-white truncate">{profile.productName}</span>
                {profile.productType && (
                  <span className="text-xs text-zinc-500 hidden md:inline">· {profile.productType}</span>
                )}
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-zinc-600 shrink-0" />
                <span className="text-xs text-zinc-500">No product loaded. Start with</span>
                <Link href="/audit" className="text-xs text-indigo-300 hover:text-indigo-200 font-medium">
                  Business Profile →
                </Link>
              </>
            )}
          </div>

          {/* Mobile spacer */}
          <div className="flex-1 lg:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setDemoOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 border-0 transition-all"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">LinkedIn Demo</span>
              <span className="sm:hidden">Demo</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
