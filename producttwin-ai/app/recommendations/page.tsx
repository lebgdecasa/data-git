"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTwinStore } from "@/lib/store";
import { generateRecommendations, riskScore, simulate } from "@/lib/engine";
import {
  Lightbulb,
  Sparkles,
  Check,
  ChevronRight,
  Zap,
  Shield,
  DollarSign,
  Repeat,
  Users,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/lib/types";

const CATEGORY_ICON: Record<Recommendation["category"], any> = {
  growth: Zap,
  retention: Repeat,
  monetization: DollarSign,
  risk: Shield,
  team: Users,
  product: Layers,
};

const PRIORITY_TONE: Record<Recommendation["priority"], string> = {
  high: "from-rose-500/20 to-orange-500/10 border-rose-400/20",
  medium: "from-amber-500/15 to-yellow-500/5 border-amber-400/15",
  low: "from-slate-500/15 to-slate-500/5 border-slate-400/15",
};

export default function RecommendationsPage() {
  const { assumptions } = useTwinStore();
  const sim = useMemo(() => simulate(assumptions), [assumptions]);
  const risk = useMemo(() => riskScore(assumptions, sim), [assumptions, sim]);
  const recs = useMemo(
    () => generateRecommendations(assumptions, sim, risk),
    [assumptions, sim, risk],
  );

  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? recs : recs.filter((r) => r.priority === filter);

  const ceoBrief = useMemo(() => {
    const top = recs.slice(0, 3);
    const headline =
      risk.band === "strong" || risk.band === "healthy"
        ? `${assumptions.productName} is in healthy territory at ${risk.overall}/100 — the leverage is in compounding what's working.`
        : risk.band === "moderate"
          ? `${assumptions.productName} sits in moderate-risk territory (${risk.overall}/100). Two or three focused moves move the score materially.`
          : `${assumptions.productName} is at ${risk.overall}/100 — there are 2-3 fundamental issues to close before scaling spend.`;
    return {
      headline,
      bullets: top.map((r) => r.title),
    };
  }, [assumptions, recs, risk]);

  return (
    <AppShell
      title="AI strategic recommendations"
      subtitle="Prioritized moves with rationale and concrete next actions. Drawn live from your twin."
    >
      <Card glow className="mb-6">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                CEO briefing · auto-generated
              </div>
              <p className="text-lg leading-relaxed text-balance">
                {ceoBrief.headline}
              </p>
              <ul className="mt-4 space-y-2">
                {ceoBrief.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({recs.length})</TabsTrigger>
            <TabsTrigger value="high">
              High ({recs.filter((r) => r.priority === "high").length})
            </TabsTrigger>
            <TabsTrigger value="medium">
              Medium ({recs.filter((r) => r.priority === "medium").length})
            </TabsTrigger>
            <TabsTrigger value="low">
              Low ({recs.filter((r) => r.priority === "low").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="secondary" size="sm">
          <Lightbulb className="h-3.5 w-3.5" />
          Export brief
        </Button>
      </div>

      <div className="grid gap-3">
        {filtered.map((r, i) => {
          const Icon = CATEGORY_ICON[r.category];
          return (
            <Card
              key={r.id}
              className={cn(
                "p-6 bg-gradient-to-br border",
                PRIORITY_TONE[r.priority],
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/[0.08] grid place-items-center">
                    <Icon className="h-4.5 w-4.5 text-indigo-200" />
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-2">
                    #{String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <Badge
                      variant={
                        r.priority === "high"
                          ? "destructive"
                          : r.priority === "medium"
                            ? "warning"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {r.priority} priority
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {r.category}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold leading-snug">
                    {r.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {r.rationale}
                  </p>
                  <div className="mt-4 space-y-1.5">
                    {r.actions.map((a, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-3.5 w-3.5 text-indigo-300 mt-1 shrink-0" />
                        <span className="text-foreground/90">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Impact
                  </div>
                  <div className="text-3xl font-semibold gradient-text-blue mt-1">
                    {r.impact}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
                    Effort
                  </div>
                  <div className="text-base font-medium mt-0.5">{r.effort}</div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <Check className="h-8 w-8 mx-auto mb-3 text-emerald-300" />
            <div className="font-medium text-foreground">All clear in this band.</div>
            <p className="text-sm mt-1">
              Try a different priority filter or update your assumptions.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
