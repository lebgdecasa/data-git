import Link from "next/link";
import {
  ArrowRight,
  Sparkle,
  BarChart3,
  ShieldCheck,
  Map,
  Gauge,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PROBLEMS = [
  {
    icon: Brain,
    title: "Decisions driven by intuition",
    desc: "Teams ship features and change pricing based on gut feel — with no structured way to estimate business outcomes before committing.",
  },
  {
    icon: Clock,
    title: "No fast path to business impact",
    desc: "Product managers lack a quick way to model how a pricing change, a churn spike, or a new onboarding flow affects MRR, payback, or LTV.",
  },
  {
    icon: Users,
    title: "Analysts drowning in manual work",
    desc: "Business analysts spend too much time stitching metrics across spreadsheets instead of surfacing the insight that actually changes the decision.",
  },
];

const SOLUTIONS = [
  {
    icon: Zap,
    title: "Simulate strategic decisions",
    desc: "Model pricing, acquisition, churn, and activation changes against a live 36-month financial twin — before a single line of code ships.",
  },
  {
    icon: BarChart3,
    title: "Visualize KPI impact",
    desc: "Watch MRR, ARR, LTV:CAC, payback period, and break-even update in real time as you move the levers that matter.",
  },
  {
    icon: AlertCircle,
    title: "Identify risk before execution",
    desc: "A composite risk score across financial, market, execution, compliance, and product dimensions flags issues before they become crises.",
  },
  {
    icon: Map,
    title: "Prioritize roadmap intelligently",
    desc: "RICE-scored backlog with an impact / effort matrix. Move initiatives between Now, Next, and Later with a click — no Jira ceremony.",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Product Audit",
    desc: "Input your assumptions — pricing, churn, CAC, activation, retention — and get a live diagnostic of your product's health.",
    badge: "Core",
  },
  {
    icon: BarChart3,
    title: "KPI Dashboard",
    desc: "Executive-grade charts: revenue ramp, cohort retention, funnel conversion, benchmark radar, and channel mix.",
    badge: "Analytics",
  },
  {
    icon: Zap,
    title: "Scenario Simulator",
    desc: "Run what-if scenarios. Slide pricing up 20%, cut churn by 40%, or triple acquisition spend — and see the 36-month delta instantly.",
    badge: "Simulation",
  },
  {
    icon: Map,
    title: "Roadmap Prioritization",
    desc: "Drag-free RICE scoring with a live impact / effort scatter plot. Slice your backlog into Now / Next / Later.",
    badge: "Strategy",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Risk Layer",
    desc: "A checklist-driven compliance score surfaces SOC 2, GDPR, and enterprise procurement blockers before they kill a deal.",
    badge: "Risk",
  },
  {
    icon: Gauge,
    title: "Startup Survival Score",
    desc: "A single composite signal — weighted across five risk dimensions — that tells founders and boards how close to the edge they really are.",
    badge: "Score",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[700px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/50 blur-md rounded-lg" />
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg shadow-indigo-500/30">
                <Sparkle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">ProductTwin AI</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Decision Simulator
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition-colors">Problem</a>
            <a href="#solution" className="hover:text-foreground transition-colors">Solution</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </div>

          <Link href="/dashboard">
            <Button size="sm">
              Start Simulation
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-32 text-center">
        <Badge variant="secondary" className="mb-7 px-4 py-1.5">
          <Sparkle className="h-3 w-3 mr-2 text-indigo-300" />
          AI-powered product decision simulator
        </Badge>

        <h1 className="text-balance text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-semibold tracking-tight leading-[1.04]">
          Simulate product decisions
          <br className="hidden sm:block" />
          <span className="gradient-text"> before you ship.</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
          ProductTwin AI helps teams forecast the impact of pricing, onboarding,
          roadmap, retention, and compliance decisions using structured business
          logic and AI-style recommendations.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 h-14 text-base">
              Start Simulation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/audit">
            <Button variant="secondary" size="lg" className="h-14 text-base">
              Run a Product Audit
            </Button>
          </Link>
        </div>

        {/* social proof strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            { v: "36-month", l: "financial projection" },
            { v: "5-axis", l: "risk scoring" },
            { v: "RICE", l: "roadmap scoring" },
            { v: "Zero", l: "setup required" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-xl font-semibold gradient-text-blue">{s.v}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HERO MOCKUP ── */}
      <section className="relative max-w-6xl mx-auto px-6 lg:px-10 pb-28">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />
          <Card className="relative border-white/[0.08] overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative p-8 lg:p-10">
              {/* fake topbar */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    ProductTwin AI · Executive Overview
                  </span>
                </div>
                <Badge variant="success">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Live twin
                </Badge>
              </div>

              {/* stat row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { k: "ARR · Year 1", v: "$1.42M", d: "+18.2%", tone: "text-emerald-300" },
                  { k: "LTV : CAC", v: "3.4x", d: "above benchmark", tone: "text-emerald-300" },
                  { k: "Payback", v: "11 mo", d: "healthy", tone: "text-emerald-300" },
                  { k: "Risk Score", v: "72 / 100", d: "Healthy", tone: "text-indigo-300" },
                ].map((s) => (
                  <div key={s.k} className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</div>
                    <div className="text-xl font-semibold mt-1.5">{s.v}</div>
                    <div className={`text-xs mt-1 ${s.tone}`}>{s.d}</div>
                  </div>
                ))}
              </div>

              {/* chart + risk */}
              <div className="grid lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 glass rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-4">MRR · 36-month projection</div>
                  <svg viewBox="0 0 600 120" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="hero-g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,105 C40,98 80,88 130,74 C190,58 240,46 300,35 C360,24 430,15 500,10 L600,8 L600,120 L0,120 Z" fill="url(#hero-g)" />
                    <path d="M0,105 C40,98 80,88 130,74 C190,58 240,46 300,35 C360,24 430,15 500,10 L600,8" stroke="#a78bfa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    {/* grid lines */}
                    {[30, 60, 90].map((y) => (
                      <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    ))}
                  </svg>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-4">Risk dimensions</div>
                  <div className="space-y-3">
                    {[
                      { l: "Financial", v: 78, c: "from-indigo-500 to-indigo-400" },
                      { l: "Market", v: 62, c: "from-purple-500 to-purple-400" },
                      { l: "Execution", v: 70, c: "from-violet-500 to-violet-400" },
                      { l: "Compliance", v: 84, c: "from-blue-500 to-blue-400" },
                      { l: "Product", v: 65, c: "from-indigo-400 to-purple-400" },
                    ].map((r) => (
                      <div key={r.l}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">{r.l}</span>
                          <span className="font-medium">{r.v}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${r.c} transition-all duration-700`}
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

      {/* ── PROBLEM ── */}
      <section id="problem" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="destructive" className="mb-5">
            <AlertCircle className="h-3 w-3 mr-1.5" />
            The problem
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Great products get killed by decisions made in the dark.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Most teams have the data. What they lack is a fast, structured way
            to turn that data into a decision before the window closes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PROBLEMS.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.title}
                className="p-7 group hover:border-rose-400/20 hover:bg-rose-500/[0.03] transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-400/20 grid place-items-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5 text-rose-300" />
                </div>
                <h3 className="font-semibold text-base mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="success" className="mb-5">
              <CheckCircle2 className="h-3 w-3 mr-1.5" />
              The solution
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              A digital twin of your product, running in your browser.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              ProductTwin builds a live model of your business from a handful of
              assumptions, then shows you exactly what changes when you pull any lever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SOLUTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.title}
                  className="p-7 flex gap-5 group hover:border-indigo-400/20 hover:bg-indigo-500/[0.03] transition-all duration-300"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-500/15 border border-white/[0.08] grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-indigo-400/70">0{i + 1}</span>
                      <h3 className="font-semibold">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-5">
            <TrendingUp className="h-3 w-3 mr-1.5" />
            Everything in one studio
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Six modules. One source of truth.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every module reads from the same live set of assumptions so
            editing one number ripples across every chart, score, and recommendation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="relative p-7 group overflow-hidden hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/[0.06] group-hover:to-purple-500/[0.03] transition-all duration-500" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/15 border border-white/[0.08] grid place-items-center group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {f.badge}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <Card className="relative overflow-hidden border-white/[0.08]">
          {/* glow layers */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.30),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-grid opacity-20" />

          <div className="relative text-center px-6 py-20 lg:py-28">
            <Badge variant="secondary" className="mb-7 px-4 py-1.5">
              <Sparkle className="h-3 w-3 mr-2 text-indigo-300" />
              No signup · No setup · Instant results
            </Badge>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
              Stop guessing.
              <br />
              <span className="gradient-text">Start simulating.</span>
            </h2>

            <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground leading-relaxed">
              Spin up your product twin in under 60 seconds. Drop in your
              numbers and get a board-ready read on risk, unit economics, and
              your next three strategic moves.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="px-10 h-14 text-base">
                  Start Simulation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/audit">
                <Button variant="secondary" size="lg" className="h-14 text-base">
                  Run a Product Audit
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              All simulations run client-side · no data leaves your browser
            </p>
          </div>
        </Card>
      </section>

      {/* ── FOOTER ── */}
      <footer className="max-w-7xl mx-auto px-6 lg:px-10 py-8 border-t border-white/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
              <Sparkle className="h-2.5 w-2.5 text-white" />
            </div>
            <span>ProductTwin AI · portfolio demo · no real data is stored</span>
          </div>
          <div className="flex items-center gap-2">
            <Github className="h-3 w-3" />
            <span>Built with Next.js · Tailwind · shadcn/ui · Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
