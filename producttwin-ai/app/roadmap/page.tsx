"use client";

import { useMemo } from "react";
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
  ReferenceLine,
  Label as ChartLabel,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useTwinStore } from "@/lib/store";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { Map, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const BUCKETS = [
  {
    key: "now" as const,
    label: "Now",
    desc: "Ship this quarter",
    tone: "from-indigo-500/15 border-indigo-400/20",
  },
  {
    key: "next" as const,
    label: "Next",
    desc: "Within 6 months",
    tone: "from-purple-500/15 border-purple-400/20",
  },
  {
    key: "later" as const,
    label: "Later",
    desc: "Beyond 6 months",
    tone: "from-slate-500/15 border-slate-400/20",
  },
];

function rice(item: { reach: number; impact: number; confidence: number; effort: number }) {
  return Math.round(
    (item.reach * item.impact * (item.confidence / 100)) / Math.max(item.effort, 1),
  );
}

export default function RoadmapPage() {
  const { roadmap, updateRoadmapItem } = useTwinStore();

  const scattered = useMemo(
    () =>
      roadmap.map((r) => ({
        ...r,
        score: rice(r),
      })),
    [roadmap],
  );

  const move = (id: string, dir: "up" | "down") => {
    const item = roadmap.find((r) => r.id === id);
    if (!item) return;
    const order: Array<typeof item.status> = ["now", "next", "later"];
    const idx = order.indexOf(item.status);
    const newIdx = dir === "up" ? Math.max(0, idx - 1) : Math.min(2, idx + 1);
    if (newIdx !== idx) updateRoadmapItem(id, { status: order[newIdx] });
  };

  return (
    <AppShell
      title="Roadmap prioritization"
      subtitle="RICE-scored backlog with an impact / effort matrix. Move items between Now, Next, and Later."
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-4 w-4 text-indigo-300" />
            Impact vs. Effort
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Top-left quadrant = quick wins · top-right = strategic bets
          </p>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number"
                dataKey="effort"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              >
                <ChartLabel
                  value="Effort →"
                  position="insideBottom"
                  offset={-5}
                  style={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="impact"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              >
                <ChartLabel
                  value="Impact →"
                  angle={-90}
                  position="insideLeft"
                  style={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                />
              </YAxis>
              <ZAxis type="number" dataKey="score" range={[80, 400]} />
              <ReferenceLine x={50} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <Tooltip
                content={(props: any) => {
                  if (!props.active || !props.payload?.[0]) return null;
                  const d = props.payload[0].payload;
                  return (
                    <div className="rounded-lg border border-white/10 bg-[hsl(224,44%,10%)]/95 backdrop-blur-md px-3 py-2 text-xs max-w-xs">
                      <div className="font-medium mb-1">{d.title}</div>
                      <div className="text-muted-foreground mb-2">{d.description}</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <span>Impact: {d.impact}</span>
                        <span>Effort: {d.effort}</span>
                        <span>Confidence: {d.confidence}%</span>
                        <span>Reach: {d.reach}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-muted-foreground">RICE</span>
                        <span className="font-medium gradient-text-blue">{d.score}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter data={scattered}>
                {scattered.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.status === "now"
                        ? "#a78bfa"
                        : d.status === "next"
                          ? "#22d3ee"
                          : "#64748b"
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {BUCKETS.map((b) => {
          const items = roadmap
            .filter((r) => r.status === b.key)
            .sort((a, c) => rice(c) - rice(a));
          return (
            <Card key={b.key} className="overflow-visible">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{b.label}</CardTitle>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 && (
                  <div className="text-xs text-muted-foreground py-6 text-center border border-dashed border-white/[0.06] rounded-lg">
                    Nothing here yet.
                  </div>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-xl border bg-gradient-to-br p-4",
                      b.tone,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm leading-snug">
                          {item.title}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <button
                          disabled={b.key === "now"}
                          onClick={() => move(item.id, "up")}
                          className="p-1 rounded hover:bg-white/[0.05] disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={b.key === "later"}
                          onClick={() => move(item.id, "down")}
                          className="p-1 rounded hover:bg-white/[0.05] disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>
                        Impact <span className="text-foreground tabular-nums">{item.impact}</span>
                      </span>
                      <span>·</span>
                      <span>
                        Effort <span className="text-foreground tabular-nums">{item.effort}</span>
                      </span>
                      <span>·</span>
                      <span>
                        RICE <span className="gradient-text-blue font-medium tabular-nums">{rice(item)}</span>
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <ScoreSlider
                        label="Impact"
                        value={item.impact}
                        onChange={(v) => updateRoadmapItem(item.id, { impact: v })}
                      />
                      <ScoreSlider
                        label="Effort"
                        value={item.effort}
                        onChange={(v) => updateRoadmapItem(item.id, { effort: v })}
                      />
                      <ScoreSlider
                        label="Conf"
                        value={item.confidence}
                        onChange={(v) => updateRoadmapItem(item.id, { confidence: v })}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] tabular-nums">{value}</span>
      </div>
      <Slider value={[value]} max={100} step={1} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
