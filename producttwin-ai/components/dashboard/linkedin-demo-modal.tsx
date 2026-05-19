"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X,
  Sparkles,
  Lightbulb,
  Zap,
  TrendingUp,
  Code2,
  GraduationCap,
  Copy,
  Check,
  Linkedin,
} from "lucide-react";

// ─── The shareable post text (exact spec from user) ───────────────────────────

const LINKEDIN_POST = `I built NIKA, an AI-powered product decision simulator for PMs and business analysts.

The idea is simple: before shipping a product decision, simulate its impact.

It helps analyze:
- churn
- activation
- pricing
- retention
- roadmap priority
- compliance risk
- product health

The goal was to combine product management, business analysis, AI, and decision intelligence into one portfolio project.`;

// ─── Structured demo card content ─────────────────────────────────────────────

const SECTIONS = [
  {
    label: "Problem Solved",
    Icon: Lightbulb,
    color: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
    iconColor: "text-rose-300",
    body:
      "PMs and founders make product decisions with intuition and incomplete data, then discover the trade-offs only after shipping. There's no safe sandbox to simulate the impact of a pricing change, a retention play, or a roadmap re-prioritization before committing real engineering cycles and ad spend.",
  },
  {
    label: "Key Features",
    Icon: Zap,
    color: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
    iconColor: "text-indigo-300",
    body: null,
    bullets: [
      "Product Audit - AI-style 10-field diagnosis with scored dimensions",
      "Scenario Simulator - 7 levers, live MRR/LTV/churn projection",
      "KPI Dashboard - Acquisition, Activation, Retention, Revenue, Product",
      "Roadmap Prioritizer - RICE scoring with live AI recommendation",
      "Risk & Compliance - GDPR / HIPAA / SOC 2 / FDA / EU AI Act overlays",
      "Strategic Report - McKinsey-style 10-section synthesis",
    ],
  },
  {
    label: "Business Impact",
    Icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
    iconColor: "text-emerald-300",
    body:
      "On the mock case (HealthTrack AI), the simulator identified that reducing onboarding from 6 → 3 steps was a higher-leverage lever than any acquisition investment - projecting +14pp activation, -25% early churn, and 60% higher RICE score than the next roadmap candidate. The pattern generalizes: most growth bottlenecks are upstream of acquisition.",
  },
  {
    label: "Tech Stack",
    Icon: Code2,
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
    iconColor: "text-cyan-300",
    body: null,
    bullets: [
      "Next.js 14 (App Router) · TypeScript · Tailwind CSS",
      "shadcn/ui primitives · Radix UI · Lucide icons",
      "Recharts (Funnel · Radar · Scatter · Area · Line · Bar)",
      "Zustand (persisted state) · CVA + tailwind-merge",
      "Deterministic rule-based simulation engine - no API calls",
    ],
  },
  {
    label: "What I Learned as a PM / Business Analyst",
    Icon: GraduationCap,
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
    iconColor: "text-amber-300",
    body:
      "Strategic recommendations are only credible when paired with quantified trade-offs. Building this simulator forced me to translate fuzzy PM intuition (\"onboarding feels too long\") into decision logic with explicit assumptions, sensitivities, and ranked alternatives. The best growth lever is rarely \"more marketing\" - it's almost always upstream of acquisition, and PM tools should make that obvious.",
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

export function LinkedInDemoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  // Close on Escape, lock body scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LINKEDIN_POST);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = LINKEDIN_POST;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="linkedin-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Gradient header */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-500/10 border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px]">DEMO MODE</Badge>
                <Badge variant="secondary" className="text-[10px]">Shareable</Badge>
              </div>
              <h2 id="linkedin-modal-title" className="text-xl font-bold text-white">
                NIKA - Project Showcase
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                One-page summary for LinkedIn posts, portfolio reviews, and demo videos
              </p>
            </div>
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-5">

          {/* Structured sections */}
          <div className="grid grid-cols-1 gap-3">
            {SECTIONS.map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-xl border p-4 bg-gradient-to-br",
                  s.color
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center">
                    <s.Icon className={cn("w-3.5 h-3.5", s.iconColor)} />
                  </div>
                  <p className={cn("text-xs uppercase tracking-wider font-bold", s.iconColor)}>
                    {s.label}
                  </p>
                </div>
                {s.body && (
                  <p className="text-sm text-zinc-200 leading-relaxed">{s.body}</p>
                )}
                {s.bullets && (
                  <ul className="space-y-1 mt-1">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="text-sm text-zinc-200 leading-relaxed flex items-start gap-2">
                        <span className={cn("mt-1 shrink-0 w-1 h-1 rounded-full", s.iconColor.replace("text-", "bg-"))} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* The actual post text - clipboard-ready */}
          <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <p className="text-xs uppercase tracking-wider font-bold text-indigo-300">Ready-to-Post Text</p>
              </div>
              <span className="text-[10px] text-zinc-500">
                {LINKEDIN_POST.length} chars · LinkedIn-friendly
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-200 leading-relaxed">
{LINKEDIN_POST}
            </pre>
          </div>

        </div>

        {/* Footer / Actions */}
        <div className="border-t border-white/10 bg-zinc-950/80 backdrop-blur p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 hidden sm:block">
            Tip: paste into LinkedIn, add a screenshot or short screen recording, post.
          </p>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={handleCopy} className={cn(copied && "bg-emerald-600 hover:bg-emerald-600")}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" /> Copy Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
