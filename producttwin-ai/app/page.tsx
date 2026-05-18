import Link from "next/link";
import {
  Sparkles,
  Sparkle,
  LineChart,
  ShieldCheck,
  Lightbulb,
  Map,
  Activity,
  ArrowRight,
  Github,
  Layers,
  Gauge,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: LineChart,
    title: "Live financial twin",
    desc: "Project MRR, ARR, burn, payback, and LTV as you change pricing or churn — no spreadsheets.",
  },
  {
    icon: Sparkles,
    title: "Scenario simulator",
    desc: "Run what-if scenarios across acquisition, retention, and pricing in a single view.",
  },
  {
    icon: ShieldCheck,
    title: "Risk & compliance score",
    desc: "Surface execution, market, financial, and compliance risk in one composite signal.",
  },
  {
    icon: Map,
    title: "Roadmap prioritization",
    desc: "RICE-style scoring with drag-free reordering — Now / Next / Later.",
  },
  {
    icon: Lightbulb,
    title: "AI strategic recs",
    desc: "Receive prioritized recommendations with rationale and 3 next actions per item.",
  },
  {
    icon: Activity,
    title: "Premium KPI dashboard",
    desc: "Executive-grade visuals you can drop into a board deck without editing.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Drop in your assumptions",
    desc: "Pricing, churn, CAC, activation, retention, compliance, roadmap complexity.",
  },
  {
    n: "02",
    title: "We build your digital twin",
    desc: "ProductTwin runs a 36-month simulation across financial, market, and operational dimensions.",
  },
  {
    n: "03",
    title: "Make the call with conviction",
    desc: "Use the risk score and prioritized recommendations to brief your team, board, and investors.",
  },
];

export default function Landing() {
  return (
    <div className="relative">
      {/* nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg shadow-indigo-500/30">
            <Sparkle className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">ProductTwin AI</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Strategy studio
            </div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">
            Features
          </a>
          <a href="#how" className="hover:text-foreground transition">
            How it works
          </a>
          <a href="#preview" className="hover:text-foreground transition">
            Preview
          </a>
        </div>
        <Link href="/dashboard">
          <Button size="sm">
            Launch studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>

      {/* hero */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.25),transparent_50%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1.5 text-indigo-300" />
            Decisions, simulated. Not assumed.
          </Badge>
          <h1 className="text-balance text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            Stress-test product
            <br />
            decisions before
            <br />
            <span className="gradient-text">you ship a single line.</span>
          </h1>
          <p className="mt-7 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
            ProductTwin AI is the strategy studio for product managers,
            founders, and innovation teams. Drop in your assumptions and get
            instant simulations, risk scores, and executive-ready
            recommendations.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                Launch the studio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/audit">
              <Button variant="secondary" size="lg">
                <Sparkles className="h-4 w-4" />
                Try a product audit
              </Button>
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { v: "36 mo", l: "Forward simulation" },
              { v: "5", l: "Risk dimensions" },
              { v: "RICE", l: "Roadmap scoring" },
              { v: "Zero", l: "Setup time" },
            ].map((s) => (
              <div
                key={s.l}
                className="glass rounded-xl px-4 py-3 text-center"
              >
                <div className="text-lg font-semibold gradient-text-blue">
                  {s.v}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* preview mockup */}
      <section id="preview" className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="relative">
          <div className="absolute -inset-x-10 -top-10 -bottom-10 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_60%)] pointer-events-none" />
          <Card className="relative aspect-[16/9] overflow-hidden border-white/[0.08]">
            <div className="absolute inset-0 bg-grid opacity-[0.4]" />
            <div className="relative p-6 lg:p-10 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-indigo-300" />
                  <span className="text-sm font-medium">Live twin · Northwind Analytics</span>
                  <Badge variant="success">Healthy</Badge>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-400/70" />
                  <div className="h-2 w-2 rounded-full bg-amber-400/70" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400/70" />
                </div>
              </div>
              <div className="mt-8 grid grid-cols-4 gap-4">
                {[
                  { k: "ARR Yr1", v: "$1.42M", t: "+18.2%" },
                  { k: "LTV : CAC", v: "3.4x", t: "+0.6" },
                  { k: "Payback", v: "11 mo", t: "-3 mo" },
                  { k: "Risk score", v: "72 / 100", t: "Healthy" },
                ].map((s) => (
                  <div key={s.k} className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.k}
                    </div>
                    <div className="text-xl font-semibold mt-1">{s.v}</div>
                    <div className="text-[11px] text-emerald-300 mt-1">{s.t}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex-1 grid grid-cols-3 gap-4">
                <div className="col-span-2 glass rounded-xl p-4 relative overflow-hidden">
                  <div className="text-xs text-muted-foreground mb-3">
                    MRR projection · 36 months
                  </div>
                  <svg viewBox="0 0 400 120" className="w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#818cf8" stopOpacity="0.6" />
                        <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,100 C50,90 90,80 130,65 C180,50 220,40 260,30 C310,18 360,12 400,8 L400,120 L0,120 Z"
                      fill="url(#g1)"
                    />
                    <path
                      d="M0,100 C50,90 90,80 130,65 C180,50 220,40 260,30 C310,18 360,12 400,8"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-3">
                    Risk radar
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { l: "Financial", v: 78 },
                      { l: "Market", v: 62 },
                      { l: "Execution", v: 70 },
                      { l: "Compliance", v: 84 },
                      { l: "Product", v: 65 },
                    ].map((r) => (
                      <div key={r.l}>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{r.l}</span>
                          <span>{r.v}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
                            style={{ width: `${r.v}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* features */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="secondary" className="mb-4">
            <Gauge className="h-3 w-3 mr-1.5" />
            Built for execution
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Everything you need to brief a board in 15 minutes.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Skip the spreadsheet ceremony. ProductTwin gives you the artifacts
            your CEO, head of product, and investors actually ask for.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-6 glass-hover">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 grid place-items-center mb-4 border border-white/[0.06]">
                  <Icon className="h-4.5 w-4.5 text-indigo-300" />
                </div>
                <div className="font-medium">{f.title}</div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {f.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="secondary" className="mb-4">
            <Brain className="h-3 w-3 mr-1.5" />
            Three steps
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            From assumption to recommendation in minutes.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6 relative">
              <div className="text-5xl font-semibold gradient-text opacity-30 leading-none">
                {s.n}
              </div>
              <div className="mt-4 font-medium">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <Card className="p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.25),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-balance">
              Stop guessing. Start simulating.
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Spin up your product twin in under 60 seconds. No signup, no
              setup, no demo gating.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg">
                  Open the studio
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/audit">
                <Button variant="secondary" size="lg">
                  Run a product audit
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <footer className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-t border-white/[0.04]">
        <span>
          ProductTwin AI · portfolio demo · no real product data is stored.
        </span>
        <span className="flex items-center gap-2">
          <Github className="h-3 w-3" />
          Built with Next.js, Tailwind, shadcn/ui & Recharts
        </span>
      </footer>
    </div>
  );
}
