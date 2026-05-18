"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Lightbulb,
  Loader2,
  Map,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── TYPES ─────────────────────────────────── */
type ComplianceSensitivity = "low" | "medium" | "high";
type Severity = "critical" | "high" | "medium" | "low";

type FormData = {
  productName: string;
  industry: string;
  targetCustomer: string;
  mainProblem: string;
  pricingModel: string;
  acquisitionChannel: string;
  onboardingSteps: number;
  mainFriction: string;
  biggestChallenge: string;
  complianceSensitivity: ComplianceSensitivity;
};

type ScoreDimension = {
  label: string;
  score: number;
  verdict: string;
  icon: any;
};

type RiskItem = {
  title: string;
  severity: Severity;
  description: string;
  implication: string;
};

type OpportunityItem = {
  title: string;
  description: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
};

type AuditReport = {
  headline: string;
  overallScore: number;
  overallBand: string;
  dimensions: ScoreDimension[];
  risks: RiskItem[];
  opportunities: OpportunityItem[];
  recommendedNextAction: string;
  nextActionDetail: string;
};

/* ─── CONSTANTS ─────────────────────────────── */
const INDUSTRIES = [
  "B2B SaaS", "Consumer Mobile", "Fintech", "Digital Health",
  "Marketplace", "Developer Tools", "AI / ML", "E-commerce",
  "EdTech", "Climate Tech", "Other",
];

const PRICING_MODELS = [
  { value: "flat_rate", label: "Flat-rate subscription" },
  { value: "usage_based", label: "Usage-based / metered" },
  { value: "freemium", label: "Freemium" },
  { value: "enterprise", label: "Enterprise / negotiated" },
  { value: "free", label: "Free (no monetization yet)" },
  { value: "unclear", label: "Not yet defined" },
];

const ACQUISITION_CHANNELS = [
  "Organic / SEO", "Paid Search", "Outbound / Cold outreach",
  "Product-led / Viral", "Partner / Referral", "Community / Events",
  "Multiple channels", "Not yet defined",
];

/* ─── RULE ENGINE ────────────────────────────── */
function generateAudit(f: FormData): AuditReport {
  /* ── dimension scores ── */
  // 1. Product Clarity
  let clarity = 10;
  if (f.productName.trim()) clarity += 18;
  if (f.industry) clarity += 10;
  if (f.targetCustomer.trim().length > 10) clarity += 22;
  if (f.mainProblem.trim().length > 20) clarity += 28;
  if (f.biggestChallenge.trim().length > 10) clarity += 12;
  clarity = Math.min(clarity, 100);

  // 2. Monetization Strength
  const monMap: Record<string, number> = {
    flat_rate: 78, usage_based: 85, freemium: 62,
    enterprise: 74, free: 32, unclear: 24, "": 24,
  };
  const monetization = monMap[f.pricingModel] ?? 50;

  // 3. Onboarding Friction (higher score = LOWER friction = better)
  let friction: number;
  if (f.onboardingSteps <= 3) friction = 88;
  else if (f.onboardingSteps <= 5) friction = 68;
  else if (f.onboardingSteps <= 8) friction = 42;
  else if (f.onboardingSteps <= 12) friction = 26;
  else friction = 14;

  // 4. Market Positioning
  let positioning = 20;
  if (f.targetCustomer.trim().length > 10) positioning += 28;
  if (f.mainProblem.trim().length > 20) positioning += 30;
  if (f.acquisitionChannel && !f.acquisitionChannel.includes("Not yet")) positioning += 14;
  if (f.industry) positioning += 8;
  positioning = Math.min(positioning, 95);

  // 5. Compliance Exposure (higher score = LOWER exposure = better)
  const compMap: Record<ComplianceSensitivity, number> = { low: 88, medium: 52, high: 18 };
  const compliance = compMap[f.complianceSensitivity];

  // Overall weighted
  const overall = Math.round(
    clarity * 0.22 + monetization * 0.22 + friction * 0.18 +
    positioning * 0.22 + compliance * 0.16,
  );

  const overallBand =
    overall >= 80 ? "Strong" :
    overall >= 65 ? "Healthy" :
    overall >= 48 ? "Needs Work" :
    overall >= 30 ? "At Risk" : "Critical";

  /* ── headline ── */
  const headline =
    overall >= 65
      ? `${f.productName || "Your product"} shows a solid foundation. The key leverage now is tightening go-to-market and reducing friction.`
      : overall >= 48
        ? `${f.productName || "Your product"} has real potential but carries several execution risks that need addressing before scaling.`
        : `${f.productName || "Your product"} requires structural fixes in monetization, onboarding, or positioning before investing in growth.`;

  /* ── risks ── */
  const risks: RiskItem[] = [];

  if (f.onboardingSteps > 5) {
    risks.push({
      title: "Onboarding friction above safe threshold",
      severity: f.onboardingSteps > 9 ? "critical" : "high",
      description: `With ${f.onboardingSteps} steps before the user reaches core value, drop-off before activation is near-certain. Industry best practice is 3–5 steps maximum.`,
      implication: "High friction onboarding suppresses activation rates, inflates CAC, and creates negative first impressions that are rarely recovered.",
    });
  }

  if (f.complianceSensitivity === "high") {
    risks.push({
      title: "Compliance exposure blocks enterprise revenue",
      severity: "high",
      description: "Operating in a high-compliance domain without a documented security or regulatory posture will block procurement at any enterprise or mid-market account above $10K ACV.",
      implication: "Deals will stall in security review. Without SOC 2, ISO 27001, or equivalent, you are effectively locked out of a large share of the addressable market.",
    });
  }

  if (f.pricingModel === "unclear" || f.pricingModel === "free" || !f.pricingModel) {
    risks.push({
      title: "Monetization model undefined or premature",
      severity: f.pricingModel === "free" ? "medium" : "high",
      description: "An undefined or absent pricing model prevents product-market fit validation, makes investor conversations speculative, and creates misaligned incentives across the team.",
      implication: "Without a clear monetization hypothesis, it is impossible to calculate LTV, set CAC targets, or measure whether growth creates value or just cost.",
    });
  }

  if (!f.mainFriction.trim()) {
    risks.push({
      title: "Absence of documented user friction signals",
      severity: "medium",
      description: "Not having identified a primary user friction point suggests insufficient qualitative research. Teams that cannot name the #1 user frustration typically build the wrong solutions.",
      implication: "Roadmap decisions made without a documented friction model tend to optimize for internal assumptions rather than user behaviour, wasting engineering cycles.",
    });
  }

  if (!f.targetCustomer.trim() || f.targetCustomer.trim().length < 8) {
    risks.push({
      title: "Underspecified ideal customer profile",
      severity: "medium",
      description: "A vague or missing ICP definition leads to broad messaging, inefficient acquisition, and products that try to serve everyone and delight no one.",
      implication: "Without a sharp ICP, conversion rates across every funnel stage suffer, and the product roadmap lacks a clear arbiter for feature trade-offs.",
    });
  }

  if (f.acquisitionChannel?.includes("Not yet") || !f.acquisitionChannel) {
    risks.push({
      title: "No validated acquisition motion",
      severity: "medium",
      description: "Lacking a defined or tested acquisition channel means growth is opportunistic. Without repeatability, it is impossible to plan headcount, spend, or runway.",
      implication: "Investors and boards will flag the absence of a repeatable GTM motion as a fundability and scale risk.",
    });
  }

  // Always ensure at least 3 risks
  if (risks.length < 3) {
    risks.push({
      title: "Competitive differentiation risk",
      severity: "low",
      description: "Even with strong fundamentals, incumbents and well-funded competitors can replicate surface-level features quickly. Durable differentiation must be embedded in data, network effects, or switching costs.",
      implication: "Without a documented moat strategy, pricing power erodes over time and growth requires increasing acquisition spend.",
    });
  }

  /* ── opportunities ── */
  const opportunities: OpportunityItem[] = [];

  if (f.onboardingSteps <= 5 && f.mainFriction.trim()) {
    opportunities.push({
      title: "Compress time-to-value to under 5 minutes",
      description: `With ${f.onboardingSteps} onboarding steps and an identified friction point, you are 2–3 targeted changes away from a meaningfully faster activation loop. Pre-filled templates, smart defaults, and a single-goal first session can close this gap rapidly.`,
      effort: "low",
      impact: "high",
    });
  } else {
    opportunities.push({
      title: "Redesign onboarding around a single aha moment",
      description: "Define the one outcome that most predicts long-term retention. Ruthlessly remove every onboarding step that does not directly lead to that moment. This is the highest-ROI product investment available to early-stage teams.",
      effort: "medium",
      impact: "high",
    });
  }

  if (f.pricingModel === "flat_rate" || f.pricingModel === "freemium") {
    opportunities.push({
      title: "Introduce usage-based expansion revenue",
      description: "Layering a usage-based tier on top of a flat-rate or freemium base unlocks natural expansion MRR without additional sales effort. Power users self-select into higher tiers, increasing NRR without churn pressure.",
      effort: "medium",
      impact: "high",
    });
  } else {
    opportunities.push({
      title: "Formalize a value-metric pricing anchor",
      description: "Aligning price to a measurable unit of customer value (seats, usage, outcomes) creates a natural upsell lever and makes pricing conversations outcome-focused rather than cost-focused.",
      effort: "low",
      impact: "high",
    });
  }

  if (f.complianceSensitivity !== "low") {
    opportunities.push({
      title: "Turn compliance into a sales accelerant",
      description: "Teams that reach SOC 2 Type I within 90 days can position compliance as a trust signal rather than a procurement checkbox. A public trust center and DPA template remove legal friction and shorten sales cycles by 3–4 weeks on average.",
      effort: "medium",
      impact: "medium",
    });
  } else {
    opportunities.push({
      title: "Build a referral loop into the activation milestone",
      description: `In ${f.industry || "your market"}, product-led referral loops activated at the moment of first value (the aha moment) generate the lowest-CAC acquisition. One well-timed share prompt at activation can unlock 15–25% of new sign-ups from existing users.`,
      effort: "low",
      impact: "medium",
    });
  }

  /* ── recommended next action ── */
  let recommendedNextAction: string;
  let nextActionDetail: string;

  if (f.onboardingSteps > 5) {
    recommendedNextAction = "Fix onboarding before spending another dollar on acquisition";
    nextActionDetail = `Every new user you acquire right now is entering a ${f.onboardingSteps}-step funnel with a high probability of dropping before they see value. Map every step against the activation milestone and eliminate anything that does not directly contribute to it. Target 3–5 steps within the next sprint.`;
  } else if (f.pricingModel === "unclear" || !f.pricingModel) {
    recommendedNextAction = "Define and test a pricing hypothesis this week";
    nextActionDetail = "Pick one pricing model and a price point. Run 10 customer interviews with a willingness-to-pay question. The goal is not the perfect price — it is a falsifiable hypothesis you can validate in 30 days.";
  } else if (f.complianceSensitivity === "high") {
    recommendedNextAction = "Initiate a SOC 2 Type I engagement this quarter";
    nextActionDetail = "Choose a compliance automation platform and begin evidence collection. A Type I report is achievable in 60–90 days and immediately unlocks enterprise procurement conversations you are currently losing.";
  } else if (!f.targetCustomer.trim()) {
    recommendedNextAction = "Sharpen your ICP to one specific persona before the next growth push";
    nextActionDetail = "Interview your best 5 customers and identify the common job title, company size, trigger event, and desired outcome. Write a one-paragraph ICP statement. Make every marketing and product decision against this statement for the next 90 days.";
  } else {
    recommendedNextAction = "Run a structured retention analysis on your first 30-day cohort";
    nextActionDetail = "Pull cohort data for your last 90 days of signups. Identify the behavioural difference between users who stay and users who churn. The delta is your activation model. Build the next sprint around closing that gap.";
  }

  return {
    headline,
    overallScore: overall,
    overallBand,
    dimensions: [
      { label: "Product Clarity", score: clarity, verdict: clarity >= 70 ? "Well-defined" : clarity >= 45 ? "Needs sharpening" : "Underspecified", icon: Brain },
      { label: "Monetization Strength", score: monetization, verdict: monetization >= 70 ? "Strong model" : monetization >= 45 ? "Needs validation" : "Not defined", icon: TrendingUp },
      { label: "Onboarding Efficiency", score: friction, verdict: friction >= 70 ? "Streamlined" : friction >= 45 ? "Moderate friction" : "High friction", icon: Zap },
      { label: "Market Positioning", score: positioning, verdict: positioning >= 70 ? "Clear ICP" : positioning >= 45 ? "Broad targeting" : "Undefined", icon: Users },
      { label: "Compliance Exposure", score: compliance, verdict: compliance >= 70 ? "Low exposure" : compliance >= 40 ? "Moderate risk" : "High exposure", icon: ShieldCheck },
    ],
    risks: risks.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
    recommendedNextAction,
    nextActionDetail,
  };
}

/* ─── SUB-COMPONENTS ─────────────────────────── */
const SEVERITY_MAP: Record<Severity, { badge: "destructive" | "warning" | "secondary" | "success"; label: string; dot: string }> = {
  critical: { badge: "destructive", label: "Critical", dot: "bg-rose-400" },
  high:     { badge: "destructive", label: "High",     dot: "bg-orange-400" },
  medium:   { badge: "warning",     label: "Medium",   dot: "bg-amber-400" },
  low:      { badge: "secondary",   label: "Low",      dot: "bg-slate-400" },
};

const EFFORT_IMPACT_MAP = {
  low:    "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-300   bg-amber-500/10   border-amber-400/20",
  high:   "text-rose-300    bg-rose-500/10    border-rose-500/20",
};

function ScoreCard({ d, idx }: { d: ScoreDimension; idx: number }) {
  const Icon = d.icon;
  const tone = d.score >= 65 ? "good" : d.score >= 40 ? "warn" : "bad";
  const ring = tone === "good" ? "#22c55e" : tone === "warn" ? "#f59e0b" : "#f43f5e";
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (d.score / 100) * circ;

  return (
    <div className={cn(
      "rounded-xl border p-4 flex items-center gap-4 glass-hover transition-all",
      tone === "good" ? "border-emerald-500/15" : tone === "warn" ? "border-amber-500/15" : "border-rose-500/15"
    )}>
      <div className="relative shrink-0">
        <svg width={52} height={52} className="-rotate-90">
          <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
          <circle cx={26} cy={26} r={r} fill="none" stroke={ring} strokeWidth={5}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
          <span className="text-xs font-bold tabular-nums">{d.score}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground truncate">{d.label}</p>
        </div>
        <p className="text-sm font-semibold">{d.verdict}</p>
        <Progress value={d.score} className="h-1 mt-1.5"
          indicatorClassName={cn(
            tone === "good" ? "from-emerald-500 to-emerald-400" :
            tone === "warn" ? "from-amber-500 to-amber-400" :
            "from-rose-500 to-rose-400"
          )}
        />
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────── */
const DEFAULT_FORM: FormData = {
  productName: "",
  industry: "",
  targetCustomer: "",
  mainProblem: "",
  pricingModel: "",
  acquisitionChannel: "",
  onboardingSteps: 4,
  mainFriction: "",
  biggestChallenge: "",
  complianceSensitivity: "low",
};

export default function AuditPage() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = () => {
    setLoading(true);
    setReport(null);
    setTimeout(() => {
      setReport(generateAudit(form));
      setLoading(false);
      setTimeout(() => {
        document.getElementById("audit-report")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1600);
  };

  const isReady = form.productName.trim().length > 1;

  return (
    <AppShell
      title="Product Audit"
      subtitle="Answer 10 questions and receive a structured AI-style business analysis."
    >
      <div className={cn("grid gap-6", report ? "lg:grid-cols-2" : "max-w-2xl mx-auto")}>

        {/* ── FORM ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-300" />
                Product information
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                The more detail you provide, the sharper the analysis.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Product name + industry */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Product name <span className="text-rose-400">*</span></Label>
                  <Input
                    placeholder="e.g. HealthTrack AI"
                    value={form.productName}
                    onChange={(e) => set("productName", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target customer */}
              <div className="space-y-1.5">
                <Label>Target customer</Label>
                <Input
                  placeholder="e.g. B2B: HR managers at companies with 50–500 employees"
                  value={form.targetCustomer}
                  onChange={(e) => set("targetCustomer", e.target.value)}
                />
              </div>

              {/* Main problem */}
              <div className="space-y-1.5">
                <Label>Main problem solved</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 resize-none transition"
                  placeholder="Describe the core pain point your product addresses…"
                  value={form.mainProblem}
                  onChange={(e) => set("mainProblem", e.target.value)}
                />
              </div>

              <Separator />

              {/* Pricing + Acquisition */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Pricing model</Label>
                  <Select value={form.pricingModel} onValueChange={(v) => set("pricingModel", v)}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      {PRICING_MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Current acquisition channel</Label>
                  <Select value={form.acquisitionChannel} onValueChange={(v) => set("acquisitionChannel", v)}>
                    <SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger>
                    <SelectContent>
                      {ACQUISITION_CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Onboarding steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Onboarding steps before first value</Label>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      form.onboardingSteps <= 3 ? "text-emerald-300" :
                      form.onboardingSteps <= 5 ? "text-amber-300" : "text-rose-300"
                    )}>
                      {form.onboardingSteps}
                    </span>
                    <Badge variant={
                      form.onboardingSteps <= 3 ? "success" :
                      form.onboardingSteps <= 5 ? "warning" : "destructive"
                    } className="text-[10px]">
                      {form.onboardingSteps <= 3 ? "Streamlined" : form.onboardingSteps <= 5 ? "Acceptable" : "High friction"}
                    </Badge>
                  </div>
                </div>
                <input
                  type="range" min={1} max={20} step={1}
                  value={form.onboardingSteps}
                  onChange={(e) => set("onboardingSteps", Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 step</span>
                  <span className="text-amber-400/80">5 = benchmark</span>
                  <span>20 steps</span>
                </div>
              </div>

              <Separator />

              {/* Friction + Challenge */}
              <div className="space-y-1.5">
                <Label>Main user friction</Label>
                <Input
                  placeholder="e.g. Users abandon at the integrations setup step"
                  value={form.mainFriction}
                  onChange={(e) => set("mainFriction", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Current biggest business challenge</Label>
                <textarea
                  className="flex min-h-[72px] w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 resize-none transition"
                  placeholder="e.g. High churn after free trial, difficulty converting enterprise accounts…"
                  value={form.biggestChallenge}
                  onChange={(e) => set("biggestChallenge", e.target.value)}
                />
              </div>

              {/* Compliance sensitivity */}
              <div className="space-y-2">
                <Label>Compliance sensitivity</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as ComplianceSensitivity[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => set("complianceSensitivity", level)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize",
                        form.complianceSensitivity === level
                          ? level === "low"   ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                          : level === "medium" ? "border-amber-400/40  bg-amber-500/15  text-amber-200"
                          :                     "border-rose-400/40   bg-rose-500/15   text-rose-200"
                          : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {form.complianceSensitivity === "low"   && "Standard SaaS. No specific regulatory constraints."}
                  {form.complianceSensitivity === "medium" && "Handles PII or financial data. GDPR / SOC 2 relevant."}
                  {form.complianceSensitivity === "high"   && "Healthcare, fintech, or gov. SOC 2, HIPAA, or FedRAMP likely required."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-14 text-base"
            disabled={!isReady || loading}
            onClick={handleGenerate}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating audit…
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Audit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Loading state */}
          {loading && (
            <Card className="p-6">
              <div className="space-y-3">
                {[
                  "Evaluating product clarity…",
                  "Analysing monetization model…",
                  "Scoring onboarding friction…",
                  "Assessing compliance exposure…",
                  "Generating strategic diagnosis…",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── REPORT ── */}
        {report && (
          <div id="audit-report" className="space-y-4">

            {/* Overall header */}
            <Card glow className="relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.22),transparent_55%)]" />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                        AI Product Audit
                      </Badge>
                      <Badge variant={
                        report.overallScore >= 65 ? "success" :
                        report.overallScore >= 48 ? "warning" : "destructive"
                      }>
                        {report.overallBand}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold">{form.productName || "Your Product"}</h2>
                    {form.industry && (
                      <p className="text-sm text-muted-foreground mt-0.5">{form.industry}</p>
                    )}
                  </div>
                  <div className="text-center shrink-0">
                    <div className="text-4xl font-bold gradient-text tabular-nums">{report.overallScore}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">/ 100</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 bg-white/[0.03] rounded-lg border border-white/[0.05] p-4">
                  {report.headline}
                </p>
              </CardContent>
            </Card>

            {/* Dimension scores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gauge className="h-4 w-4 text-indigo-300" />
                  Audit dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2.5">
                {report.dimensions.map((d, i) => (
                  <ScoreCard key={i} d={d} idx={i} />
                ))}
              </CardContent>
            </Card>

            {/* Strategic risks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-rose-300" />
                  Top 3 strategic risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.risks.map((r, i) => {
                  const s = SEVERITY_MAP[r.severity];
                  return (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full shrink-0 mt-0.5", s.dot)} />
                          <p className="text-sm font-semibold leading-snug">{r.title}</p>
                        </div>
                        <Badge variant={s.badge} className="shrink-0 capitalize">{s.label}</Badge>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed mb-2">{r.description}</p>
                      <div className="flex items-start gap-1.5 bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{r.implication}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-amber-300" />
                  Top 3 product opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.opportunities.map((o, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                        <p className="text-sm font-semibold leading-snug">{o.title}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", EFFORT_IMPACT_MAP[o.effort])}>
                          Effort: {o.effort}
                        </span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", EFFORT_IMPACT_MAP[o.impact])}>
                          Impact: {o.impact}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{o.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommended next action */}
            <Card className="relative overflow-hidden border-indigo-400/20">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="h-4 w-4 text-indigo-300" />
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Recommended next action</p>
                </div>
                <p className="text-base font-semibold mb-3 leading-snug">{report.recommendedNextAction}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.nextActionDetail}</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  <Button size="sm">
                    <Map className="h-3.5 w-3.5" />
                    Prioritize Roadmap
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Run Scenario
                  </Button>
                  <Button variant="secondary" size="sm">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    View Risk Score
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </AppShell>
  );
}
