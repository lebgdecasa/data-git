"use client";

import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  RotateCcw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Feature = {
  id: string;
  name: string;
  reach: number;        // users impacted / month
  impact: number;       // 0.25 / 0.5 / 1 / 2 / 3
  confidence: number;   // 0–100 (%)
  effort: number;       // person-months
};

type SortKey = "rice" | "name" | "reach" | "impact" | "confidence" | "effort";

// ─── Mock Defaults ────────────────────────────────────────────────────────────

const DEFAULT_FEATURES: Feature[] = [
  { id: "f1", name: "Reduce onboarding steps",       reach: 8000, impact: 3,   confidence: 90, effort: 2 },
  { id: "f2", name: "Add AI recommendation engine",  reach: 6500, impact: 2,   confidence: 70, effort: 5 },
  { id: "f3", name: "Improve analytics dashboard",   reach: 4200, impact: 1,   confidence: 85, effort: 3 },
  { id: "f4", name: "Add compliance export report",  reach: 1800, impact: 2,   confidence: 80, effort: 2 },
  { id: "f5", name: "Launch referral program",       reach: 9500, impact: 1,   confidence: 60, effort: 3 },
  { id: "f6", name: "Add multilingual support",      reach: 3500, impact: 0.5, confidence: 75, effort: 4 },
  { id: "f7", name: "Add enterprise admin role",     reach: 1200, impact: 2,   confidence: 85, effort: 3 },
];

const IMPACT_OPTIONS = [
  { value: 3,    label: "3 — Massive" },
  { value: 2,    label: "2 — High" },
  { value: 1,    label: "1 — Medium" },
  { value: 0.5,  label: "0.5 — Low" },
  { value: 0.25, label: "0.25 — Minimal" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcRice(f: Feature): number {
  if (f.effort <= 0) return 0;
  return (f.reach * f.impact * (f.confidence / 100)) / f.effort;
}

function priorityOf(rice: number): "High" | "Medium" | "Low" {
  // Scale: rice is on the order of thousands → normalize to a 0–100 score
  // Using a soft normalization: score = rice / 100 (so 8000 reach × 3 × 0.9 / 2 = 10,800 → 108)
  const score = rice / 100;
  if (score > 80) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function priorityColor(p: "High" | "Medium" | "Low") {
  if (p === "High") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (p === "Medium") return "bg-amber-500/15 text-amber-300 border-amber-500/40";
  return "bg-zinc-500/15 text-zinc-400 border-zinc-500/40";
}

function formatRice(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toFixed(0);
}

// Build a strategic recommendation from the ranked features
function buildRecommendation(ranked: Array<Feature & { rice: number; priority: string }>): {
  headline: string;
  body: string;
  topId: string;
} {
  if (ranked.length === 0) return { headline: "Add a feature to get a recommendation.", body: "", topId: "" };

  const top = ranked[0];
  const runner = ranked[1];

  // Categorize the top feature by name keywords for a domain-aware sentence
  const name = top.name.toLowerCase();
  let theme = "delivers the strongest balance of reach, impact, and execution cost";
  if (name.includes("onboarding")) theme = "improves activation, retention, and revenue efficiency with relatively low effort";
  else if (name.includes("ai") || name.includes("recommendation")) theme = "compounds engagement and personalization across the entire user base";
  else if (name.includes("analytics") || name.includes("dashboard")) theme = "enables data-driven decisions for power users without major engineering cost";
  else if (name.includes("compliance")) theme = "unlocks enterprise deals where compliance is a hard gate";
  else if (name.includes("referral")) theme = "drives organic acquisition at near-zero marginal CAC";
  else if (name.includes("multilingual") || name.includes("language")) theme = "expands the addressable market with modest investment";
  else if (name.includes("enterprise") || name.includes("admin")) theme = "removes a known blocker for enterprise expansion deals";

  const headline = `The highest-leverage feature is "${top.name}" because it ${theme}.`;

  const lift = runner ? (((top.rice - runner.rice) / runner.rice) * 100).toFixed(0) : "100";
  const body = runner
    ? `Its RICE score of ${formatRice(top.rice)} is ${lift}% higher than the next contender ("${runner.name}", ${formatRice(runner.rice)}). Lock this in for the current sprint and queue ${runner.name} as the follow-up.`
    : `It is the only candidate currently scored — add more options to compare.`;

  return { headline, body, topId: top.id };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [sortKey, setSortKey] = useState<SortKey>("rice");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const ranked = useMemo(() => {
    const enriched = features.map((f) => {
      const rice = calcRice(f);
      return { ...f, rice, priority: priorityOf(rice) };
    });

    enriched.sort((a, b) => {
      let av: number | string = a[sortKey as keyof typeof a] as number;
      let bv: number | string = b[sortKey as keyof typeof b] as number;
      if (sortKey === "name") {
        av = a.name; bv = b.name;
        return sortDir === "asc" ? (av as string).localeCompare(bv as string) : (bv as string).localeCompare(av as string);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return enriched;
  }, [features, sortKey, sortDir]);

  const rec = useMemo(() => buildRecommendation(ranked), [ranked]);

  const counts = useMemo(() => {
    const c = { High: 0, Medium: 0, Low: 0 };
    ranked.forEach((r) => c[r.priority as keyof typeof c]++);
    return c;
  }, [ranked]);

  const updateFeature = (id: string, patch: Partial<Feature>) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addFeature = () => {
    setFeatures((prev) => [
      ...prev,
      { id: `f${Date.now()}`, name: "New feature", reach: 1000, impact: 1, confidence: 70, effort: 2 },
    ]);
  };

  const removeFeature = (id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const resetAll = () => setFeatures(DEFAULT_FEATURES);

  // Scatter chart data — Effort (x) vs Impact (y), bubble size = reach
  const scatterData = ranked.map((r) => ({
    x: r.effort,
    y: r.impact,
    z: r.reach,
    name: r.name,
    rice: r.rice,
    priority: r.priority,
  }));

  return (
    <AppShell title="Roadmap Prioritization" subtitle="RICE scoring · Editable">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Header strip */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">Roadmap Prioritization</h1>
              <Badge variant="secondary" className="text-xs">RICE Model</Badge>
            </div>
            <p className="text-sm text-zinc-400">
              Score = Reach × Impact × Confidence / Effort. Edit any value to recalculate live.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
            </Button>
            <Button size="sm" onClick={addFeature}>
              <Plus className="w-4 h-4 mr-1.5" /> Add feature
            </Button>
          </div>
        </div>

        {/* Priority summary tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">Total Features</p>
            <p className="text-2xl font-bold text-white">{ranked.length}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-emerald-500/20">
            <p className="text-xs uppercase tracking-wide text-emerald-300 mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> High Priority
            </p>
            <p className="text-2xl font-bold text-emerald-300">{counts.High}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-amber-500/20">
            <p className="text-xs uppercase tracking-wide text-amber-300 mb-1 flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Medium
            </p>
            <p className="text-2xl font-bold text-amber-300">{counts.Medium}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-zinc-500/20">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Low
            </p>
            <p className="text-2xl font-bold text-zinc-300">{counts.Low}</p>
          </div>
        </div>

        {/* AI Recommendation card */}
        <Card className="glass border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1.5">
                  AI Strategic Recommendation
                </p>
                <p className="text-base text-white font-medium leading-relaxed mb-2">
                  {rec.headline}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">{rec.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main table */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center justify-between">
              <span>Feature Backlog</span>
              <span className="text-xs font-normal text-zinc-500">Click headers to sort · Edit any cell</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <SortHeader label="Feature" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} align="left" wide />
                    <SortHeader label="Reach / mo" active={sortKey === "reach"} dir={sortDir} onClick={() => toggleSort("reach")} />
                    <SortHeader label="Impact" active={sortKey === "impact"} dir={sortDir} onClick={() => toggleSort("impact")} />
                    <SortHeader label="Confidence" active={sortKey === "confidence"} dir={sortDir} onClick={() => toggleSort("confidence")} />
                    <SortHeader label="Effort (mo)" active={sortKey === "effort"} dir={sortDir} onClick={() => toggleSort("effort")} />
                    <SortHeader label="RICE" active={sortKey === "rice"} dir={sortDir} onClick={() => toggleSort("rice")} />
                    <th className="px-3 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide text-center">Priority</th>
                    <th className="px-2 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ranked.map((f, idx) => (
                    <tr
                      key={f.id}
                      className={cn(
                        "hover:bg-white/[0.03] transition-colors",
                        f.id === rec.topId && "bg-indigo-500/[0.04]"
                      )}
                    >
                      {/* Feature name */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {f.id === rec.topId && <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                          <Input
                            value={f.name}
                            onChange={(e) => updateFeature(f.id, { name: e.target.value })}
                            className="h-8 bg-transparent border-transparent hover:border-white/10 focus:border-indigo-500/50 text-white text-sm px-2"
                          />
                        </div>
                      </td>

                      {/* Reach */}
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={f.reach}
                          min={0}
                          step={100}
                          onChange={(e) => updateFeature(f.id, { reach: Math.max(0, Number(e.target.value) || 0) })}
                          className="h-8 bg-white/5 border-white/10 text-white text-sm text-right w-24"
                        />
                      </td>

                      {/* Impact */}
                      <td className="px-2 py-2">
                        <select
                          value={f.impact}
                          onChange={(e) => updateFeature(f.id, { impact: Number(e.target.value) })}
                          className="h-8 bg-white/5 border border-white/10 text-white text-xs rounded-md px-2 w-32 focus:border-indigo-500/50 focus:outline-none"
                        >
                          {IMPACT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Confidence */}
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={f.confidence}
                            min={0}
                            max={100}
                            onChange={(e) => updateFeature(f.id, { confidence: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                            className="h-8 bg-white/5 border-white/10 text-white text-sm text-right w-16"
                          />
                          <span className="text-xs text-zinc-500">%</span>
                        </div>
                      </td>

                      {/* Effort */}
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={f.effort}
                          min={0.5}
                          step={0.5}
                          onChange={(e) => updateFeature(f.id, { effort: Math.max(0.5, Number(e.target.value) || 0.5) })}
                          className="h-8 bg-white/5 border-white/10 text-white text-sm text-right w-16"
                        />
                      </td>

                      {/* RICE Score */}
                      <td className="px-3 py-2 text-right">
                        <span className="text-white font-bold text-base font-mono">{formatRice(f.rice)}</span>
                      </td>

                      {/* Priority badge */}
                      <td className="px-3 py-2 text-center">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", priorityColor(f.priority as any))}>
                          {f.priority}
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => removeFeature(f.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                          aria-label="Remove feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Effort vs Impact scatter */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Effort vs Impact Map</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Effort"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Effort (person-months) →", position: "insideBottom", offset: -10, fill: "#71717a", fontSize: 11 }}
                  domain={[0, "dataMax + 1"]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Impact"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Impact ↑", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }}
                  domain={[0, 3.5]}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Reach" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #6366f1", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(value: any, name: string, entry: any) => {
                    if (name === "Effort") return [`${value} mo`, "Effort"];
                    if (name === "Impact") return [value, "Impact"];
                    if (name === "Reach") return [value.toLocaleString(), "Reach"];
                    return [value, name];
                  }}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload as any)?.name || ""}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.priority === "High" ? "#10b981" : d.priority === "Medium" ? "#f59e0b" : "#71717a"}
                      fillOpacity={0.75}
                      stroke={d.priority === "High" ? "#10b981" : d.priority === "Medium" ? "#f59e0b" : "#71717a"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-zinc-400 mt-3 italic border-l-2 border-indigo-500/40 pl-3 leading-relaxed">
              Bubble size = monthly reach. Items in the top-left quadrant (high impact, low effort) are the strongest bets. Items in the bottom-right (low impact, high effort) should be deprioritized or scoped down.
            </p>
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}

// ─── Sortable column header ────────────────────────────────────────────────

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "right",
  wide = false,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
  wide?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        "px-3 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide cursor-pointer select-none hover:text-white transition-colors",
        align === "left" ? "text-left" : "text-right",
        wide && "min-w-[240px]"
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}
