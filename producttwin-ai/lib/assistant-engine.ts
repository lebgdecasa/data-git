// Rule-based assistant engine. No external API.
// Generates contextual, profile-aware responses for the in-app AI Assistant.

import type { ProductProfile, AuditResult } from "./profile";

export type AssistantContext = {
  pathname: string;
  profile: ProductProfile;
  audit: AuditResult | null;
  isProfilePopulated: boolean;
};

// ─── Contextual greetings per route ─────────────────────────────────────

export function getContextualGreeting(ctx: AssistantContext): string {
  const { pathname, profile, isProfilePopulated: pop } = ctx;
  const name = pop ? profile.productName : "your product";

  if (pathname.startsWith("/audit")) {
    return pop
      ? `Welcome back. You're editing the profile for ${name}. Fill in any blanks and hit "Generate Audit" to refresh your diagnosis. Ask me about any field if you're unsure.`
      : "This is where you tell me about your product. Fill in the 5 sections (or load NutriFlow demo to explore) and I'll generate a scored audit. Ask me what any field means.";
  }
  if (pathname.startsWith("/dashboard")) {
    return pop
      ? `Welcome to your Workspace Home. You can see ${name}'s health score, log this week's KPIs, and check off action items here. What would you like help with?`
      : "This page shows your business health, section scores, KPI trends, and open action items. You need a profile first — try loading the demo.";
  }
  if (pathname.startsWith("/simulator")) {
    return pop
      ? `You're in the Simulator. Move the levers on the right to test product decisions before you ship them. Ask me which lever has the highest impact for ${name}.`
      : "The Simulator tests product decisions before you ship. Load a profile first so the math has something to work with.";
  }
  if (pathname.startsWith("/kpi")) {
    return "These are your KPIs grouped into 5 buckets: Acquisition, Activation, Retention, Revenue, Product. Ask me what any metric means or how to improve it.";
  }
  if (pathname.startsWith("/recommendations")) {
    return pop
      ? `This is your strategic report — synthesized from everything I know about ${name}. You can export it as PDF, copy a LinkedIn share, or refine the analysis. Ask me to explain any section.`
      : "The Recommendations page produces a McKinsey-style 10-section report from your profile. Load some data first.";
  }
  if (pathname.startsWith("/roadmap")) {
    return "Roadmap uses RICE scoring (Reach × Impact × Confidence / Effort) to rank features. I can explain the formula or suggest features for you.";
  }
  if (pathname.startsWith("/risk")) {
    return "Risk & Compliance scores 8 dimensions of enterprise readiness. Toggle frameworks (GDPR / HIPAA / SOC 2 etc.) to see how requirements stack against your readiness.";
  }
  if (pathname === "/") {
    return "Welcome to NIKA. I'm your in-app assistant — I can guide you through the workflow, explain features, and analyse your product. Ready to start?";
  }
  return "I'm your in-app assistant. Ask me about features, KPIs, or what to do next.";
}

// ─── Quick prompt suggestions per route ─────────────────────────────────

export function getQuickPrompts(ctx: AssistantContext): string[] {
  const { pathname, isProfilePopulated: pop } = ctx;

  const universal = ["What should I do next?", "Explain the workflow"];

  if (!pop) {
    return ["How do I start?", "Load demo data", "What does NIKA do?", "Explain the journey"];
  }

  if (pathname.startsWith("/audit")) {
    return ["What does each field mean?", "How is the score calculated?", "What's my biggest weakness?", ...universal];
  }
  if (pathname.startsWith("/dashboard")) {
    return ["Explain my composite score", "Why does it matter to log KPIs?", "Which section is weakest?", "What's the next action?"];
  }
  if (pathname.startsWith("/simulator")) {
    return ["Which lever should I try first?", "Explain the formulas", "What if I increase pricing?", "Save this scenario"];
  }
  if (pathname.startsWith("/recommendations")) {
    return ["Summarise the report", "Explain the survival score", "What is my biggest bottleneck?", "Export this"];
  }
  if (pathname.startsWith("/kpi") || pathname.startsWith("/roadmap") || pathname.startsWith("/risk")) {
    return ["Explain this page", "How do I read these metrics?", "What should I focus on?", ...universal];
  }

  return universal;
}

// ─── Main response generator ────────────────────────────────────────────

export function generateAssistantResponse(query: string, ctx: AssistantContext): string {
  const q = query.toLowerCase().trim();
  const { profile, audit, isProfilePopulated: pop } = ctx;

  // Empty input
  if (!q) return "Ask me anything — feature questions, KPI explanations, or what to do next.";

  // ── Greeting / pleasantries ─────────────────────────
  if (matches(q, ["hi", "hello", "hey", "yo"])) {
    return pop
      ? `Hi! I can help you understand any part of ${profile.productName}'s analysis. What's on your mind?`
      : "Hello. Load a product profile (or NutriFlow demo) and I can give you specific guidance. What would you like to know?";
  }
  if (matches(q, ["thanks", "thank you", "ty"])) {
    return "You're welcome. Ping me anytime.";
  }

  // ── What does this product do? ──────────────────────
  if (matches(q, ["what is producttwin", "what does this do", "what is this", "explain producttwin", "what's this for"])) {
    return "NIKA is a strategic operating dashboard for early-stage product teams. You define your product once, then use the workspace weekly: review section scores, complete action items, log KPI snapshots, run simulations of decisions before you ship them, and generate executive-style reports. The goal is to make better product decisions with evidence instead of intuition.";
  }

  // ── How do I start? ─────────────────────────────────
  if (matches(q, ["how do i start", "where do i begin", "first step", "start fresh", "i'm new"])) {
    return pop
      ? "You already have a profile loaded. Open the Workspace Home (Step 2) to see your composite score and section breakdown, or jump into the Simulator to test a decision."
      : "Two paths: (1) Click 'Load NutriFlow Demo' to explore with realistic data, then poke around to see how everything connects. (2) Go to Business Profile (Step 1) and enter your own product data. Once your profile is in, the rest of the journey unlocks.";
  }

  // ── Workflow ────────────────────────────────────────
  if (matches(q, ["workflow", "journey", "steps", "what's the journey", "process"])) {
    return "Five steps:\n\n1. Business Profile — define your product\n2. Workspace Home — diagnose health, complete action items, log KPIs\n3. Scenario Simulator — test product decisions\n4. Impact Results — see KPI breakdowns\n5. Recommendations — get an executive report\n\nEach step builds on the last. Sidebar shows your progress (✓ = completed step).";
  }

  // ── Next action ─────────────────────────────────────
  if (matches(q, ["what next", "what should i do", "what now", "next action", "next step", "recommend an action"])) {
    if (!pop) return "Start by loading the NutriFlow demo or entering your product in Business Profile. Until you have a profile, the workspace can't analyse anything.";
    if (!audit) return `You have a profile (${profile.productName}) but no audit yet. Go to Business Profile and click 'Generate Audit' to unlock the rest.`;
    return suggestNextAction(profile, audit);
  }

  // ── KPI explanations ────────────────────────────────
  if (matches(q, ["what is activation", "explain activation", "activation rate"])) {
    const detail = pop ? ` Your current activation is ${profile.activationRate}%${profile.activationRate < 45 ? " — below the 45% benchmark, so this is likely your biggest lever." : "."}` : "";
    return `Activation = the % of new signups who reach your product's "aha moment" (the first time they get value). Industry benchmark is 45-55% for B2C SaaS.${detail}`;
  }
  if (matches(q, ["what is churn", "explain churn"])) {
    const detail = pop ? ` Your monthly churn is ${profile.churnRate}% — annualised that's roughly ${Math.round((1 - Math.pow(1 - profile.churnRate / 100, 12)) * 100)}% logo loss per year.` : "";
    return `Churn = the % of paying users who cancel each month. Below 5% is healthy for SaaS. Above 7% means growth becomes a treadmill.${detail}`;
  }
  if (matches(q, ["ltv", "lifetime value", "what is ltv"])) {
    const ltv = profile.ltv;
    const detail = pop ? ` Your LTV is $${ltv}.` : "";
    return `LTV (Lifetime Value) = how much revenue you'll get from one customer over their lifetime. The simplest formula: ARPU / monthly churn rate. Lower churn → higher LTV.${detail}`;
  }
  if (matches(q, ["cac", "customer acquisition cost", "what is cac"])) {
    const ratio = profile.cac > 0 ? (profile.ltv / profile.cac).toFixed(1) : null;
    const detail = pop && ratio ? ` Your LTV/CAC is ${ratio}x. Healthy SaaS sits at 3x or higher.` : "";
    return `CAC = the cost to acquire one new paying customer. The critical ratio is LTV/CAC: it should be ≥3 for sustainable growth.${detail}`;
  }
  if (matches(q, ["mrr", "what is mrr"])) {
    const detail = pop ? ` Your MRR is $${profile.mrr.toLocaleString()}.` : "";
    return `MRR (Monthly Recurring Revenue) = your monthly subscription revenue, normalised. It's the most important SaaS metric.${detail}`;
  }
  if (matches(q, ["rice", "what is rice", "explain rice"])) {
    return "RICE = (Reach × Impact × Confidence) / Effort.\n\n• Reach: how many users this affects per month\n• Impact: how much it moves the needle (3=massive, 2=high, 1=medium, 0.5=low)\n• Confidence: how sure you are (%)\n• Effort: person-months of work\n\nHigher RICE = higher priority. The Roadmap page does this scoring live.";
  }
  if (matches(q, ["retention", "what is retention"])) {
    const detail = pop ? ` Your 30-day retention is ${profile.retentionRate30}%.` : "";
    return `Retention = the % of new signups still active N days later. 30-day retention of 45%+ is healthy for SaaS. Steep drops in the first week usually point to onboarding friction.${detail}`;
  }
  if (matches(q, ["arpu", "average revenue"])) {
    const detail = pop ? ` Your ARPU is $${profile.arpu.toFixed(1)}.` : "";
    return `ARPU (Average Revenue Per User) = MRR / paying users. It tells you your pricing power.${detail}`;
  }

  // ── Health / score queries ──────────────────────────
  if (matches(q, ["my score", "my health", "how am i doing", "audit score", "composite score"])) {
    if (!pop) return "Load a profile first and I'll give you a score breakdown.";
    if (!audit) return "Generate your first audit to see your composite score.";
    return `Your audit score is ${audit.overallScore}/100 — ${audit.band}. The weakest dimension is "${[...audit.dimensions].sort((a, b) => a.score - b.score)[0].name}" at ${[...audit.dimensions].sort((a, b) => a.score - b.score)[0].score}/100. Focus there first.`;
  }
  if (matches(q, ["biggest problem", "biggest weakness", "main issue", "what's wrong", "bottleneck"])) {
    if (!pop) return "Load a profile and I'll find it.";
    return findBiggestBottleneck(profile);
  }
  if (matches(q, ["biggest strength", "what's working", "strongest"])) {
    if (!pop) return "Load a profile and I'll tell you.";
    return findBiggestStrength(profile);
  }

  // ── How to improve a metric ─────────────────────────
  if (matches(q, ["improve activation", "fix activation", "raise activation"])) {
    return "Three highest-leverage activation moves:\n\n1. Reduce onboarding steps (each step removed adds ~4pp activation)\n2. Front-load the highest-value action in the first session\n3. Add a 'success' moment (animation, confirmation, share) when the user completes the activation event\n\nThe Simulator can show you the projected impact in seconds.";
  }
  if (matches(q, ["improve churn", "reduce churn", "fix churn"])) {
    return "Most churn is caused upstream of the cancel button:\n\n1. Improve early-week engagement (the day-1 to day-7 drop usually predicts churn)\n2. Add cancel-flow exit surveys + retention offers\n3. Improve activation — churn drops as activation rises\n\nA pricing increase usually adds churn; price last, not first.";
  }
  if (matches(q, ["improve ltv", "raise ltv"])) {
    return "LTV ≈ ARPU / churn. So two ways:\n\n1. Reduce churn (highest leverage)\n2. Expand ARPU via tier upgrades, usage-based add-ons, or annual prepay\n\nReducing churn from 8% to 6% lifts LTV by 33% with no other change.";
  }
  if (matches(q, ["improve compliance", "fix compliance", "soc 2", "hipaa", "gdpr"])) {
    return "Three first steps:\n\n1. Adopt an automated compliance platform (Vanta, Drata, Secureframe) — pulls evidence automatically\n2. Draft DPA templates for enterprise buyers\n3. Implement audit logs for admin actions and sensitive data access\n\nThe Risk & Compliance page (in the Advanced sidebar section) shows framework-specific gaps.";
  }

  // ── Simulator-specific ──────────────────────────────
  if (matches(q, ["which lever", "best lever", "highest impact lever", "what should i simulate"])) {
    if (!pop) return "Load a profile and I'll tell you specifically.";
    const acGap = 60 - profile.activationRate;
    const churnExcess = profile.churnRate - 5;
    if (acGap > 15) return `For ${profile.productName}, the highest-leverage lever is reducing onboarding steps. You're at ${profile.activationRate}% activation, ${acGap}pp below benchmark. Drag the onboarding slider to 3 in the simulator and watch what happens to MRR.`;
    if (churnExcess > 2) return `Your churn (${profile.churnRate}%) is the dominant constraint. Try the "Reduce churn by" lever at 30% — that compounds into LTV directly.`;
    return "Your metrics are reasonably balanced. Try the marketing budget lever to model paid acquisition return at your current activation rate.";
  }
  if (matches(q, ["formula", "how is this calculated", "what's the math"])) {
    return "The simulator uses deterministic rules:\n\n• Onboarding ↓ → Activation ↑ (~4pp per step removed)\n• Activation ↑ → Retention ↑ and Churn ↓\n• Churn ↓ → LTV ↑ (LTV = ARPU / churn)\n• Pricing ↑ → MRR ↑ + small churn penalty\n• Marketing ↑ → Users ↑ (×0.5) and CAC ↑ sublinearly\n• Compliance investment → Risk score ↓, short-term churn drag\n\nNo external API, no hallucinations — fully reproducible.";
  }

  // ── Recommendations page ────────────────────────────
  if (matches(q, ["report", "summarise", "summary", "summarize", "executive summary"])) {
    if (!pop) return "Load a profile to get a personalised report.";
    if (!audit) return "Generate an audit first — the report synthesises from it.";
    return `The report (Step 5) has 10 sections: Executive Summary, Product Health, Growth Bottleneck, Retention Risk, Roadmap Priority, Compliance, 30-day Plan, 90-day Strategy, Survival Score, Final Recommendation. All sections are calibrated to ${profile.productName}'s actual data. You can export as PDF or copy a LinkedIn-ready share post.`;
  }
  if (matches(q, ["survival score"])) {
    return "The Survival Score is a weighted composite: Unit Economics (25%) + Growth (20%) + Product-Market Fit (20%) + Retention (15%) + Compliance (10%) + Operational (10%). 60+ is above the seed-stage threshold, 80+ is the fundable Series A band.";
  }

  // ── Demo / data ─────────────────────────────────────
  if (matches(q, ["load demo", "use demo", "nutriflow"])) {
    return "Click the 'Load NutriFlow Demo' button (on the Workspace Home empty state, or in the topbar). It loads a realistic digital health product with MRR $62k, 8.5% churn, 36% activation — designed to show every feature working.";
  }
  if (matches(q, ["save data", "persisted", "local storage"])) {
    return "Your profile, audit history, KPI snapshots, action items, and saved scenarios are all stored in your browser's localStorage. They survive page reloads but are scoped to this browser. No backend, no account, no data sent anywhere.";
  }

  // ── Navigation ──────────────────────────────────────
  if (matches(q, ["where is the simulator", "go to simulator", "open simulator"])) {
    return "It's Step 3 in the sidebar — labelled 'Scenario Simulator'.";
  }
  if (matches(q, ["where is the audit", "open audit"])) {
    return "Step 1 in the sidebar — 'Business Profile'. That's also where you generate the audit.";
  }
  if (matches(q, ["where is risk", "compliance page"])) {
    return "Risk & Compliance is in the 'Advanced' section at the bottom of the sidebar — click to expand.";
  }
  if (matches(q, ["where is roadmap"])) {
    return "Roadmap is in the 'Advanced' section at the bottom of the sidebar.";
  }

  // ── KPI logging ─────────────────────────────────────
  if (matches(q, ["log kpi", "log kpis", "weekly snapshot", "why log"])) {
    return "Logging a weekly KPI snapshot captures your current MRR, churn, activation, retention, LTV, CAC into a time-series. Over time this powers the sparklines on the Workspace Home and shows whether your actions are actually moving the numbers. Throttled to one log per day.";
  }

  // ── Action items ────────────────────────────────────
  if (matches(q, ["action items", "tasks", "todo"])) {
    return "Action items are auto-generated from each audit based on your weakest sections. You can also add manual ones from the Workspace Home. Tick them off as you complete them — completed items stay in history so you can see progress.";
  }

  // ── Help / list common questions ────────────────────
  if (matches(q, ["help", "what can you do", "what can i ask"])) {
    return "Things I can answer:\n\n• Explain KPIs (activation, churn, LTV, CAC, ARPU, RICE...)\n• Tell you the next best action based on your profile\n• Identify your biggest bottleneck\n• Explain features and the workflow\n• Show how to improve specific metrics\n• Walk through the simulator formulas\n\nJust ask — I'm contextual to whichever page you're on.";
  }

  // ── Fallback ────────────────────────────────────────
  return `I'm not sure I caught that. Try asking about a specific metric (activation, churn, LTV...), a feature (simulator, audit, roadmap...), or what to do next. You can also type "help" to see what I can answer.`;
}

// ─── Helper functions ────────────────────────────────────────────────────

function matches(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

function suggestNextAction(p: ProductProfile, audit: AuditResult): string {
  const weakest = [...audit.dimensions].sort((a, b) => a.score - b.score)[0];

  if (weakest.name === "Friction" && p.onboardingSteps > 4) {
    return `For ${p.productName}: reduce onboarding from ${p.onboardingSteps} steps to 3. This is the highest-leverage move and the Simulator can show you the projected impact in seconds. Open the Simulator and drag the onboarding lever.`;
  }
  if (weakest.name === "Compliance" && p.complianceSensitivity === "High") {
    return `For ${p.productName}: start a compliance program. Adopt Vanta/Drata, draft DPA templates, implement audit logs. The Risk & Compliance page (Advanced section) shows which frameworks have the biggest gaps for you.`;
  }
  if (weakest.name === "Monetization") {
    return `For ${p.productName}: unit economics need work. Either reduce churn (lifts LTV directly) or expand ARPU via tier upgrades. The Simulator's "reduce churn" lever shows the LTV impact instantly.`;
  }
  return `Your weakest dimension is ${weakest.name} (${weakest.score}/100). Look at the audit recommendations or open the Simulator to model fixes.`;
}

function findBiggestBottleneck(p: ProductProfile): string {
  const candidates = [
    { key: "activation", score: p.activationRate < 50 ? 100 - p.activationRate : 0, label: "Activation", desc: `Only ${p.activationRate}% of signups activate.` },
    { key: "churn",      score: p.churnRate > 5 ? p.churnRate * 8 : 0, label: "Churn", desc: `${p.churnRate}% monthly churn is unsustainable.` },
    { key: "retention",  score: p.retentionRate30 < 45 ? 100 - p.retentionRate30 : 0, label: "Retention", desc: `${p.retentionRate30}% D30 retention is below benchmark.` },
    { key: "compliance", score: p.complianceSensitivity === "High" && p.complianceReadiness < 60 ? 100 - p.complianceReadiness : 0, label: "Compliance", desc: `${p.complianceReadiness}% readiness blocks enterprise deals.` },
  ];
  const winner = candidates.sort((a, b) => b.score - a.score)[0];
  if (winner.score === 0) return "Honestly, no dimension is critically off. You're in optimisation mode — look for marginal gains.";
  return `Your biggest bottleneck is ${winner.label}. ${winner.desc} Fix it before scaling anything else — every other lever depends on it.`;
}

function findBiggestStrength(p: ProductProfile): string {
  const ltvCac = p.cac > 0 ? p.ltv / p.cac : 0;
  if (ltvCac >= 4) return `Your unit economics. LTV/CAC of ${ltvCac.toFixed(1)}x is well above the 3x sustainability threshold — this is a moat. Protect it as you scale.`;
  if (p.activationRate >= 55) return `Your activation engine. ${p.activationRate}% is at or above benchmark — most products would kill for this.`;
  if (p.churnRate > 0 && p.churnRate <= 4) return `Your retention. ${p.churnRate}% monthly churn is best-in-class.`;
  if (p.mrr >= 50_000) return `Your revenue base. $${(p.mrr/1000).toFixed(1)}k MRR proves the model works.`;
  return "Your strongest dimension isn't clearly above the others yet. Once you sharpen one, the others compound from it.";
}
