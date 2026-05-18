"use client";

import React, { useState, useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Shield,
  Lock,
  Brain,
  FileCheck,
  Network,
  Link2,
  Scale,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "Low" | "Medium" | "High";

type RiskCat = {
  id: string;
  name: string;
  Icon: React.ElementType;
  score: number; // readiness 0-100 (higher = better prepared)
  iconBg: string;
  accentColor: string;
  explanation: string;
  mitigation: string;
};

type FrameworkAffect = { id: string; delta: number; note: string };

type Framework = {
  id: string;
  shortName: string;
  fullName: string;
  chipCls: string;
  description: string;
  affectedRisks: FrameworkAffect[];
  gaps: string[];
  enterpriseNote: string;
};

// ─── Risk Data ────────────────────────────────────────────────────────────────

const RISKS: RiskCat[] = [
  {
    id: "privacy",
    name: "Data Privacy Risk",
    Icon: Shield,
    score: 65,
    iconBg: "bg-indigo-500/20",
    accentColor: "#6366f1",
    explanation:
      "User health data is collected, stored, and processed with standard encryption. Consent flows exist but lack granularity - users cannot opt out of specific processing activities. No data residency guarantees are in place for non-US markets.",
    mitigation:
      "Implement a consent management platform (CMP) with per-category opt-outs. Add data residency configuration per market. Publish a privacy notice with explicit data lifecycle and deletion timelines.",
  },
  {
    id: "security",
    name: "Security Risk",
    Icon: Lock,
    score: 52,
    iconBg: "bg-amber-500/20",
    accentColor: "#f59e0b",
    explanation:
      "Authentication supports email/password with optional MFA. No automated vulnerability scanning in CI/CD. No penetration test on record. Several API endpoints lack rate limiting. Secrets are managed via environment variables without a dedicated secrets manager.",
    mitigation:
      "Enforce MFA for all accounts. Integrate SAST/DAST into CI pipeline. Commission an annual penetration test. Migrate secrets to HashiCorp Vault or AWS Secrets Manager. Apply rate limiting to all endpoints.",
  },
  {
    id: "ai-reliability",
    name: "AI Reliability Risk",
    Icon: Brain,
    score: 71,
    iconBg: "bg-emerald-500/20",
    accentColor: "#10b981",
    explanation:
      "The AI recommendation engine uses deterministic, rule-based logic - reducing hallucination risk. Outputs are labeled as 'suggestions', not diagnoses. No A/B framework tracks recommendation quality over time. No human-review layer exists for high-stakes outputs.",
    mitigation:
      "Display confidence intervals on AI outputs. Document decision logic for potential regulatory review. Implement feedback loops to detect drift. Add a human-review gate for any health recommendation classified as clinical in scope.",
  },
  {
    id: "compliance",
    name: "Compliance Readiness",
    Icon: FileCheck,
    score: 38,
    iconBg: "bg-rose-500/20",
    accentColor: "#f43f5e",
    explanation:
      "No formal compliance program exists. Privacy policy and terms have not had legal review in 18 months. No Data Processing Agreement templates for enterprise buyers. No documented incident response plan. No formal vendor risk management process.",
    mitigation:
      "Engage a compliance consultant for a gap assessment. Create DPA templates for enterprise onboarding. Draft and test an incident response playbook. Schedule annual legal review of all user-facing policies.",
  },
  {
    id: "operational",
    name: "Operational Dependency",
    Icon: Network,
    score: 61,
    iconBg: "bg-violet-500/20",
    accentColor: "#8b5cf6",
    explanation:
      "The product depends on 4 third-party APIs (payment, analytics, notifications, AI inference). Two lack formal SLA guarantees. No fallback behavior when the AI inference API is unavailable. No formal uptime SLA has been defined for customers.",
    mitigation:
      "Define internal uptime SLAs (start at 99.5%). Implement graceful degradation for all third-party failures. Request SLAs from critical vendors. Add a status page and an incident communication process.",
  },
  {
    id: "vendor-lock",
    name: "Vendor Lock-in Risk",
    Icon: Link2,
    score: 74,
    iconBg: "bg-cyan-500/20",
    accentColor: "#06b6d4",
    explanation:
      "Infrastructure runs on a single cloud provider (AWS) with no multi-cloud contingency. The database uses a managed service with proprietary features. Frontend deployment is tightly coupled to Vercel. AI inference relies on a single provider API with no fallback.",
    mitigation:
      "Abstract infrastructure behind provider-agnostic interfaces where feasible. Document a cloud exit strategy. Evaluate open-source AI inference alternatives. Limit use of proprietary SQL extensions to ease future migrations.",
  },
  {
    id: "regulatory",
    name: "Regulatory Exposure",
    Icon: Scale,
    score: 43,
    iconBg: "bg-orange-500/20",
    accentColor: "#f97316",
    explanation:
      "Operating in digital health creates simultaneous exposure to HIPAA (US health data), GDPR (EU users), EU AI Act (automated recommendations), and potential FDA SaMD classification if features expand into clinical advice. No regulatory mapping has been performed.",
    mitigation:
      "Commission a regulatory mapping exercise across all target markets. Engage a healthcare regulatory attorney. Monitor EU AI Act enforcement (2025-2027 timeline). Determine FDA SaMD classification risk before expanding clinical use cases.",
  },
  {
    id: "audit",
    name: "Audit Readiness",
    Icon: ClipboardCheck,
    score: 29,
    iconBg: "bg-rose-500/20",
    accentColor: "#f43f5e",
    explanation:
      "No audit logs exist for administrative actions or PHI access events. No automated evidence collection. The company has never undergone an external audit. Security controls, data flows, and vendor assessments are inadequately documented.",
    mitigation:
      "Implement audit logging for all admin and data access events immediately. Adopt an automated compliance platform (e.g., Vanta, Drata, Secureframe). Run a documentation sprint to capture current-state controls. Budget for SOC 2 Type I as a first external audit milestone.",
  },
];

// ─── Framework Data ───────────────────────────────────────────────────────────

const FRAMEWORKS: Framework[] = [
  {
    id: "gdpr",
    shortName: "GDPR",
    fullName: "General Data Protection Regulation",
    chipCls: "border-indigo-500/40 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20",
    description: "EU regulation governing personal data collection, storage, and processing for EU residents.",
    affectedRisks: [
      { id: "privacy", delta: -18, note: "GDPR requires granular consent, right to erasure, and data portability - currently incomplete." },
      { id: "audit", delta: -15, note: "GDPR mandates Records of Processing Activities (RoPA) and ability to demonstrate compliance on request." },
      { id: "compliance", delta: -12, note: "DPAs with sub-processors are required. Legal basis for each processing activity must be documented." },
      { id: "regulatory", delta: -10, note: "Fines can reach 4% of global annual turnover - significant exposure without a formal program." },
    ],
    gaps: [
      "No Records of Processing Activities (RoPA) maintained",
      "Right to erasure not fully automated - manual process required",
      "Sub-processor DPAs not in place",
      "Data breach notification process missing (72-hour window)",
      "No Data Protection Impact Assessment (DPIA) template",
    ],
    enterpriseNote: "EU enterprise buyers will require a signed DPA and written evidence of GDPR compliance before procurement.",
  },
  {
    id: "hipaa",
    shortName: "HIPAA",
    fullName: "Health Insurance Portability and Accountability Act",
    chipCls: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20",
    description: "US federal regulation protecting sensitive patient health information from unauthorized disclosure.",
    affectedRisks: [
      { id: "privacy", delta: -20, note: "HIPAA requires Business Associate Agreements and strict PHI handling procedures." },
      { id: "security", delta: -18, note: "HIPAA Security Rule mandates access controls, audit controls, and transmission security." },
      { id: "compliance", delta: -22, note: "No BAA process exists. A formal risk analysis and management program is required." },
      { id: "audit", delta: -18, note: "HIPAA requires 6-year retention of documentation and audit logs for all PHI access." },
    ],
    gaps: [
      "No Business Associate Agreement (BAA) process",
      "PHI access audit logs not implemented",
      "No formal HIPAA risk analysis completed",
      "Employee HIPAA training not documented",
      "Breach notification policy missing (60-day HHS notification requirement)",
    ],
    enterpriseNote: "US healthcare enterprise customers require a signed BAA. Without it, the product cannot legally process PHI - blocking all clinical sales.",
  },
  {
    id: "iso27001",
    shortName: "ISO 27001",
    fullName: "ISO/IEC 27001 - Information Security Management",
    chipCls: "border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20",
    description: "International standard for information security management systems (ISMS).",
    affectedRisks: [
      { id: "security", delta: -15, note: "ISO 27001 requires a documented ISMS with defined policies, procedures, and controls." },
      { id: "audit", delta: -20, note: "Certification requires documented controls, risk treatment plans, and annual internal audits." },
      { id: "operational", delta: -12, note: "Business continuity and supplier management controls are mandatory." },
      { id: "vendor-lock", delta: -8, note: "Supplier risk assessments must be formally performed and documented." },
    ],
    gaps: [
      "No Information Security Management System (ISMS) documented",
      "Asset inventory not maintained",
      "No formal risk treatment plan",
      "Supplier security assessments not performed",
      "No internal audit process established",
    ],
    enterpriseNote: "ISO 27001 certification is often a hard procurement requirement in European markets and financial sector deals.",
  },
  {
    id: "soc2",
    shortName: "SOC 2",
    fullName: "SOC 2 Type II - Trust Services Criteria",
    chipCls: "border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20",
    description: "US auditing standard verifying controls for security, availability, processing integrity, confidentiality, and privacy.",
    affectedRisks: [
      { id: "security", delta: -15, note: "SOC 2 Security criterion requires logical access controls, encryption, and continuous monitoring." },
      { id: "audit", delta: -22, note: "SOC 2 Type II requires 6-12 months of evidence across all selected Trust Services Criteria." },
      { id: "compliance", delta: -12, note: "Documented policies and procedures are mandatory for each selected Trust Service Category." },
      { id: "operational", delta: -10, note: "Availability criterion requires defined uptime SLAs, monitoring, and incident response." },
    ],
    gaps: [
      "No continuous evidence collection process in place",
      "Logical access control policies not documented",
      "Change management process not formalized",
      "No continuous monitoring tooling deployed",
      "Vendor assessment program missing",
    ],
    enterpriseNote: "SOC 2 Type II is the most common enterprise security requirement in the US. Without it, deals routinely stall at the security review stage.",
  },
  {
    id: "fda",
    shortName: "FDA SaMD",
    fullName: "FDA Software as a Medical Device Guidance",
    chipCls: "border-orange-500/40 text-orange-300 bg-orange-500/10 hover:bg-orange-500/20",
    description: "FDA guidance on software intended to perform medical device functions, including AI-driven health recommendations.",
    affectedRisks: [
      { id: "ai-reliability", delta: -25, note: "FDA SaMD requires software validation, clinical evidence, and documented intended use." },
      { id: "compliance", delta: -28, note: "510(k) clearance or De Novo pathway may be required depending on intended use expansion." },
      { id: "regulatory", delta: -25, note: "Marketing health recommendations without clearance may constitute an unauthorized medical device." },
      { id: "audit", delta: -15, note: "FDA requires Design History Files (DHF) and Device Master Records (DMR) for regulated software." },
    ],
    gaps: [
      "No intended use statement (clinical vs. wellness) formally documented",
      "No SaMD classification analysis performed",
      "AI output not validated against clinical benchmarks",
      "No Design History File (DHF) maintained",
      "Quality Management System (QMS) not established",
    ],
    enterpriseNote: "If the product expands to clinical recommendations (diagnosis or treatment guidance), FDA clearance will be required before US hospitals or clinical buyers can use it.",
  },
  {
    id: "euai",
    shortName: "EU AI Act",
    fullName: "EU Artificial Intelligence Act",
    chipCls: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20",
    description: "EU regulation classifying AI systems by risk level and imposing transparency, accuracy, and human oversight requirements.",
    affectedRisks: [
      { id: "ai-reliability", delta: -20, note: "EU AI Act requires technical documentation, accuracy metrics, and human oversight for high-risk AI." },
      { id: "regulatory", delta: -22, note: "Health AI systems may be classified as high-risk under Annex III - triggering conformity assessment." },
      { id: "privacy", delta: -12, note: "Data governance requirements apply to training and inference data used by the AI system." },
      { id: "audit", delta: -12, note: "Conformity assessment documentation and CE marking process required for high-risk systems." },
    ],
    gaps: [
      "AI system risk classification under EU AI Act not determined",
      "No technical documentation per Annex IV prepared",
      "Human oversight mechanisms not formally implemented",
      "Fundamental rights impact assessment not performed",
      "No post-market monitoring plan for AI outputs",
    ],
    enterpriseNote: "EU AI Act enforcement ramps between 2025-2027. Health AI with automated recommendations should begin high-risk classification preparation now.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskLevel(score: number): RiskLevel {
  if (score >= 70) return "Low";
  if (score >= 40) return "Medium";
  return "High";
}

const RISK_STYLES: Record<RiskLevel, { badge: string; bar: string; glow: string }> = {
  Low:    { badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40", bar: "#10b981", glow: "shadow-emerald-500/10" },
  Medium: { badge: "bg-amber-500/15   text-amber-300   border-amber-500/40",   bar: "#f59e0b", glow: "shadow-amber-500/10"   },
  High:   { badge: "bg-rose-500/15    text-rose-300    border-rose-500/40",    bar: "#f43f5e", glow: "shadow-rose-500/10"    },
};

function buildRecommendation(
  adjusted: Record<string, { score: number; delta: number; notes: string[] }>,
  activeFrameworks: string[]
): string {
  const sorted = RISKS
    .map((r) => ({ ...r, adj: adjusted[r.id]?.score ?? r.score }))
    .sort((a, b) => a.adj - b.adj);

  const worst3 = sorted.slice(0, 3);

  const labelMap: Record<string, string> = {
    audit: "audit documentation and evidence collection",
    compliance: "formal compliance program and DPA templates",
    regulatory: "regulatory mapping and legal exposure analysis",
    privacy: "data processing transparency and consent granularity",
    security: "security posture and vulnerability management",
    "ai-reliability": "AI output validation and human oversight mechanisms",
    operational: "operational resilience and third-party SLAs",
    "vendor-lock": "vendor diversification and cloud portability",
  };

  const labels = worst3.map((r) => labelMap[r.id] ?? r.name.toLowerCase());

  let base = `Before targeting enterprise customers, the product should improve ${labels[0]}, ${labels[1]}, and ${labels[2]}.`;

  if (activeFrameworks.length > 0) {
    const fwNames = activeFrameworks
      .map((id) => FRAMEWORKS.find((f) => f.id === id)?.shortName)
      .filter(Boolean)
      .join(", ");
    const lowestFwScore = sorted[0];
    base += ` For ${fwNames} compliance specifically, the most critical gap is ${labelMap[lowestFwScore.id] ?? lowestFwScore.name.toLowerCase()} - this area requires immediate attention before any enterprise sales motion.`;
  }

  return base;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const level = riskLevel(score);
  const color = RISK_STYLES[level].bar;
  const dash = (score / 100) * circ;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff0d" strokeWidth={size * 0.09} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={size * 0.09}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold tabular-nums" style={{ fontSize: size * 0.22 }}>{score}</span>
      </div>
    </div>
  );
}

// ─── Risk Card ────────────────────────────────────────────────────────────────

function RiskCard({
  cat,
  adjScore,
  delta,
  frameworkNotes,
  expanded,
  onToggle,
}: {
  cat: RiskCat;
  adjScore: number;
  delta: number;
  frameworkNotes: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const level = riskLevel(adjScore);
  const styles = RISK_STYLES[level];

  return (
    <div
      className={cn(
        "glass rounded-xl border overflow-hidden transition-all duration-200",
        level === "High" ? "border-rose-500/20" : level === "Medium" ? "border-amber-500/10" : "border-emerald-500/10"
      )}
    >
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.03] transition-colors"
        onClick={onToggle}
      >
        {/* Icon */}
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", cat.iconBg)}>
          <cat.Icon className="w-5 h-5" style={{ color: cat.accentColor }} />
        </div>

        {/* Name + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-white truncate">{cat.name}</span>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", styles.badge)}>
              {level} Risk
            </span>
            {delta < 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30">
                {delta} under framework
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 line-clamp-1">{cat.explanation.slice(0, 90)}…</p>
        </div>

        {/* Ring + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <ScoreRing score={adjScore} size={56} />
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {/* Progress bar strip */}
      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${adjScore}%`, backgroundColor: styles.bar }}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 py-4 space-y-4 border-t border-white/5">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">Current State</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{cat.explanation}</p>
          </div>

          <div className="rounded-lg bg-indigo-500/8 border border-indigo-500/20 p-3">
            <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Mitigation
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">{cat.mitigation}</p>
          </div>

          {frameworkNotes.length > 0 && (
            <div className="rounded-lg bg-rose-500/8 border border-rose-500/20 p-3 space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Framework Gaps
              </p>
              {frameworkNotes.map((note, i) => (
                <p key={i} className="text-xs text-zinc-400 leading-relaxed">{note}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Framework Chip ───────────────────────────────────────────────────────────

function FrameworkChip({
  fw,
  active,
  onClick,
}: {
  fw: Framework;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
        active
          ? fw.chipCls.replace("hover:", "") + " ring-1 ring-offset-1 ring-offset-transparent"
          : "border-white/10 text-zinc-400 bg-transparent hover:border-white/20 hover:text-zinc-300"
      )}
    >
      {fw.shortName}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RiskPage() {
  const [selectedFws, setSelectedFws] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFw = (id: string) =>
    setSelectedFws((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const toggleCard = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  // Compute adjusted scores
  const adjusted = useMemo(() => {
    const result: Record<string, { score: number; delta: number; notes: string[] }> = {};
    RISKS.forEach((r) => {
      let score = r.score;
      let delta = 0;
      const notes: string[] = [];
      selectedFws.forEach((fwId) => {
        const fw = FRAMEWORKS.find((f) => f.id === fwId);
        if (!fw) return;
        const match = fw.affectedRisks.find((a) => a.id === r.id);
        if (match) {
          delta += match.delta;
          notes.push(`[${fw.shortName}] ${match.note}`);
        }
      });
      result[r.id] = { score: Math.max(0, score + delta), delta, notes };
    });
    return result;
  }, [selectedFws]);

  const enterpriseScore = useMemo(
    () => Math.round(RISKS.reduce((sum, r) => sum + (adjusted[r.id]?.score ?? r.score), 0) / RISKS.length),
    [adjusted]
  );

  const enterpriseLevel = riskLevel(enterpriseScore);
  const enterpriseStyles = RISK_STYLES[enterpriseLevel];

  const recommendation = useMemo(() => buildRecommendation(adjusted, selectedFws), [adjusted, selectedFws]);

  const radarData = RISKS.map((r) => ({
    subject: r.name.replace(" Risk", "").replace(" Readiness", "").replace(" Dependency", "").replace(" Exposure", ""),
    score: adjusted[r.id]?.score ?? r.score,
    fullMark: 100,
  }));

  const activeFwDefs = FRAMEWORKS.filter((f) => selectedFws.includes(f.id));

  return (
    <AppShell title="Risk & Compliance" subtitle="HealthTrack AI · Enterprise Readiness Assessment">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Enterprise Readiness Score */}
          <Card className="glass border-white/10 flex-1">
            <CardContent className="p-5 flex items-center gap-5">
              <ScoreRing score={enterpriseScore} size={96} />
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Enterprise Readiness Score</p>
                <p className="text-3xl font-bold text-white mb-1">{enterpriseScore} <span className="text-base font-normal text-zinc-400">/ 100</span></p>
                <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", enterpriseStyles.badge)}>
                  {enterpriseLevel === "Low" ? "Enterprise Ready" : enterpriseLevel === "Medium" ? "Partially Ready" : "Not Enterprise Ready"}
                </span>
                {selectedFws.length > 0 && (
                  <p className="text-xs text-zinc-500 mt-2">Score adjusted for {selectedFws.length} active framework{selectedFws.length > 1 ? "s" : ""}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compliance frameworks selector */}
          <Card className="glass border-white/10 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                Compliance Framework Overlay
              </CardTitle>
              <p className="text-xs text-zinc-500">Select frameworks to see adjusted risk scores and specific gaps</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {FRAMEWORKS.map((fw) => (
                  <FrameworkChip
                    key={fw.id}
                    fw={fw}
                    active={selectedFws.includes(fw.id)}
                    onClick={() => toggleFw(fw.id)}
                  />
                ))}
              </div>
              {selectedFws.length === 0 && (
                <p className="text-xs text-zinc-600 mt-2 italic">No frameworks selected - showing baseline readiness scores</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Framework gap panels ─────────────────────────────── */}
        {activeFwDefs.length > 0 && (
          <div className="space-y-3">
            {activeFwDefs.map((fw) => (
              <Card key={fw.id} className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border", fw.chipCls)}>
                        {fw.shortName}
                      </span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{fw.fullName}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{fw.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-1.5 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" /> Open Gaps
                          </p>
                          <ul className="space-y-1">
                            {fw.gaps.map((g, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                                <span className="text-rose-400 mt-0.5 shrink-0">·</span> {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 p-3">
                          <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1.5 flex items-center gap-1.5">
                            <Info className="w-3 h-3" /> Enterprise Sales Impact
                          </p>
                          <p className="text-xs text-zinc-400 leading-relaxed">{fw.enterpriseNote}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Risk cards grid ──────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Risk Category Breakdown</h2>
            <p className="text-xs text-zinc-500">Click any row to expand details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RISKS.map((cat) => {
              const adj = adjusted[cat.id] ?? { score: cat.score, delta: 0, notes: [] };
              return (
                <RiskCard
                  key={cat.id}
                  cat={cat}
                  adjScore={adj.score}
                  delta={adj.delta}
                  frameworkNotes={adj.notes}
                  expanded={expandedId === cat.id}
                  onToggle={() => toggleCard(cat.id)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Radar chart ─────────────────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Readiness Profile - Radar View</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#ffffff0d" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "1px solid #6366f1", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [`${v} / 100`, "Readiness"]}
                />
                <Radar
                  name="Readiness"
                  dataKey="score"
                  stroke="#818cf8"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-zinc-400 mt-2 italic border-l-2 border-indigo-500/40 pl-3 leading-relaxed">
              A perfect enterprise-ready product scores ≥ 70 across all eight dimensions. Two or more dimensions below 40 typically block enterprise procurement. Audit Readiness and Compliance are the current bottlenecks.
            </p>
          </CardContent>
        </Card>

        {/* ── AI Recommendation ────────────────────────────────── */}
        <Card className="glass border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-purple-950/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-2">Strategic Recommendation</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Score summary table ──────────────────────────────── */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Readiness Scorecard</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left px-4 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide">Category</th>
                    <th className="text-right px-4 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide">Baseline</th>
                    {selectedFws.length > 0 && (
                      <th className="text-right px-4 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide">Adjusted</th>
                    )}
                    <th className="text-center px-4 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide">Risk Level</th>
                    <th className="px-4 py-2.5 text-zinc-400 font-medium text-xs uppercase tracking-wide">Readiness Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RISKS.sort((a, b) => (adjusted[a.id]?.score ?? a.score) - (adjusted[b.id]?.score ?? b.score)).map((cat) => {
                    const adj = adjusted[cat.id] ?? { score: cat.score, delta: 0 };
                    const level = riskLevel(adj.score);
                    const styles = RISK_STYLES[level];
                    return (
                      <tr key={cat.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", cat.iconBg)}>
                              <cat.Icon className="w-3.5 h-3.5" style={{ color: cat.accentColor }} />
                            </div>
                            <span className="text-white text-sm">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-400 font-mono text-sm">{cat.score}</td>
                        {selectedFws.length > 0 && (
                          <td className={cn("px-4 py-2.5 text-right font-mono text-sm font-semibold", adj.delta < 0 ? "text-rose-400" : "text-white")}>
                            {adj.score}
                            {adj.delta < 0 && <span className="text-xs ml-1 opacity-70">({adj.delta})</span>}
                          </td>
                        )}
                        <td className="px-4 py-2.5 text-center">
                          <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium border", styles.badge)}>
                            {level}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 w-40">
                          <div className="w-full h-1.5 rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${adj.score}%`, backgroundColor: styles.bar }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Disclaimer ───────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-zinc-700/50 bg-zinc-900/40 p-4">
          <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-500 leading-relaxed">
            <span className="font-semibold text-zinc-400">Disclaimer: </span>
            This is a strategic readiness simulation, not a legal compliance certification. All scores, gaps, and recommendations are based on a hypothetical product model for PM portfolio demonstration purposes only. Nothing on this page constitutes legal, regulatory, or compliance advice. Consult qualified legal counsel and certified compliance professionals for actual compliance assessments.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
