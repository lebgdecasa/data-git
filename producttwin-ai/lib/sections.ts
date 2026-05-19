// Modular business sections. Each section is an independently auditable
// dimension that rolls up into the composite business health score.

import type { ProductProfile } from "./profile";
import { clamp } from "./profile";

export type SectionId =
  | "marketing"
  | "sales"
  | "product"
  | "operations"
  | "customer"
  | "finance"
  | "growth"
  | "compliance";

export type SectionDef = {
  id: SectionId;
  name: string;
  iconName: string;             // lucide-react name
  color: string;                // tailwind bg class
  description: string;
  weight: number;               // composite weight (sums to 1)
};

export const SECTIONS: SectionDef[] = [
  { id: "marketing",  name: "Marketing",          iconName: "Megaphone",   color: "bg-pink-500/80",    description: "Brand reach, channel mix, content velocity.",        weight: 0.10 },
  { id: "sales",      name: "Sales",              iconName: "ShoppingBag", color: "bg-orange-500/80",  description: "Pipeline health, conversion, ARPU growth.",          weight: 0.10 },
  { id: "product",    name: "Product",            iconName: "Sparkles",    color: "bg-indigo-500/80",  description: "Activation, retention, feature adoption.",           weight: 0.20 },
  { id: "operations", name: "Operations",         iconName: "Settings",    color: "bg-zinc-500/80",    description: "Execution velocity, roadmap discipline, tooling.",   weight: 0.10 },
  { id: "customer",   name: "Customer Experience",iconName: "Heart",       color: "bg-rose-500/80",    description: "NPS, support, churn signals, satisfaction.",         weight: 0.15 },
  { id: "finance",    name: "Finance",            iconName: "DollarSign",  color: "bg-emerald-500/80", description: "Unit economics, runway, capital efficiency.",        weight: 0.15 },
  { id: "growth",     name: "Growth",             iconName: "TrendingUp",  color: "bg-cyan-500/80",    description: "Acquisition channels, viral loops, expansion.",      weight: 0.10 },
  { id: "compliance", name: "Compliance & Risk",  iconName: "ShieldCheck", color: "bg-amber-500/80",   description: "Regulatory readiness, security, audit posture.",     weight: 0.10 },
];

export type SectionScore = {
  sectionId: SectionId;
  score: number;          // 0-100
  band: "Strong" | "Moderate" | "Weak";
  insight: string;
  topRisk?: string;
};

// ─── Score derivation ───────────────────────────────────────────────────────

export function computeSectionScore(sectionId: SectionId, p: ProductProfile): SectionScore {
  switch (sectionId) {
    case "marketing":     return scoreMarketing(p);
    case "sales":         return scoreSales(p);
    case "product":       return scoreProduct(p);
    case "operations":    return scoreOperations(p);
    case "customer":      return scoreCustomer(p);
    case "finance":       return scoreFinance(p);
    case "growth":        return scoreGrowth(p);
    case "compliance":    return scoreCompliance(p);
  }
}

export function computeAllSectionScores(p: ProductProfile): SectionScore[] {
  return SECTIONS.map((s) => computeSectionScore(s.id, p));
}

export function computeCompositeBusinessScore(p: ProductProfile): number {
  const scores = computeAllSectionScores(p);
  const weighted = scores.reduce((sum, s) => {
    const def = SECTIONS.find((sec) => sec.id === s.sectionId)!;
    return sum + s.score * def.weight;
  }, 0);
  return Math.round(weighted);
}

function bandOf(s: number): "Strong" | "Moderate" | "Weak" {
  return s >= 70 ? "Strong" : s >= 45 ? "Moderate" : "Weak";
}

function scoreMarketing(p: ProductProfile): SectionScore {
  // Heuristic: CAC efficiency + clarity of positioning/ICP
  const cacScore = p.cac > 0 ? clamp(0, 60, (100 / p.cac) * 30) : 30;
  const positioningScore = p.targetCustomer.trim().length > 20 ? 25 : 10;
  const channelMixScore = p.industry.trim().length > 5 ? 15 : 5;
  const score = Math.round(clamp(0, 100, cacScore + positioningScore + channelMixScore));
  return {
    sectionId: "marketing",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Marketing is efficient (CAC $${p.cac}) with a clear ICP. Channel mix is working.`
      : score >= 45
        ? `Marketing is producing leads but CAC of $${p.cac} has room to improve. Sharpen the ICP narrative.`
        : `Marketing is underperforming. Either CAC is too high (${p.cac > 100 ? "yes" : "monitor"}) or positioning is too vague.`,
    topRisk: score < 50 ? "CAC trending toward unsustainable territory." : undefined,
  };
}

function scoreSales(p: ProductProfile): SectionScore {
  const arpuScore = clamp(0, 40, p.arpu * 1.5);
  const mrrScore = p.mrr > 0 ? clamp(0, 30, Math.log10(Math.max(1, p.mrr)) * 10) : 0;
  const pricingClarity = p.pricingModel.length > 15 ? 20 : 5;
  const score = Math.round(clamp(0, 100, arpuScore + mrrScore + pricingClarity + 10));
  return {
    sectionId: "sales",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Sales engine is converting. ARPU of $${p.arpu.toFixed(0)} and MRR of $${(p.mrr/1000).toFixed(1)}k show traction.`
      : score >= 45
        ? `Sales is working but ARPU at $${p.arpu.toFixed(0)} could expand. Test higher-tier packaging.`
        : `Sales pipeline is thin. Reassess pricing tiers and discovery process.`,
    topRisk: p.arpu < 20 ? "ARPU too low to absorb CAC at current rates." : undefined,
  };
}

function scoreProduct(p: ProductProfile): SectionScore {
  const activation = p.activationRate;
  const retention = p.retentionRate30;
  const onboardingPenalty = Math.max(0, p.onboardingSteps - 3) * 6;
  const score = Math.round(clamp(0, 100, (activation * 0.5) + (retention * 0.5) - onboardingPenalty + 20));
  return {
    sectionId: "product",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Product is performing: ${activation}% activation, ${retention}% retention. Build on what works.`
      : score >= 45
        ? `Product has friction. Activation at ${activation}% and ${p.onboardingSteps}-step onboarding cap engagement.`
        : `Product is the bottleneck. Onboarding (${p.onboardingSteps} steps) is suffocating activation.`,
    topRisk: activation < 45 ? "Activation collapse is the dominant constraint." : undefined,
  };
}

function scoreOperations(p: ProductProfile): SectionScore {
  const complexityPenalty = p.roadmapComplexity * 0.5;
  const score = Math.round(clamp(0, 100, 90 - complexityPenalty));
  return {
    sectionId: "operations",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Operational discipline is solid. Roadmap complexity at ${p.roadmapComplexity}/100 is manageable.`
      : score >= 45
        ? `Operations are stretched. Roadmap complexity (${p.roadmapComplexity}/100) is eroding velocity.`
        : `Operations are over-extended. Cut roadmap scope before adding anything new.`,
    topRisk: p.roadmapComplexity > 70 ? "Roadmap complexity is killing throughput." : undefined,
  };
}

function scoreCustomer(p: ProductProfile): SectionScore {
  const churnHealth = clamp(0, 60, 100 - p.churnRate * 8);
  const retentionHealth = clamp(0, 40, p.retentionRate30 * 0.6);
  const score = Math.round(churnHealth + retentionHealth);
  return {
    sectionId: "customer",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Customer experience is healthy. ${p.churnRate}% churn keeps LTV intact.`
      : score >= 45
        ? `Customer signals are mixed. ${p.churnRate}% churn is workable but trending pressure-wise.`
        : `Customer experience is bleeding value. ${p.churnRate}% monthly churn is unsustainable.`,
    topRisk: p.churnRate > 7 ? "Churn is compressing LTV faster than acquisition can refill." : undefined,
  };
}

function scoreFinance(p: ProductProfile): SectionScore {
  const ltvCac = p.cac > 0 ? p.ltv / p.cac : 0;
  const ratioScore = clamp(0, 70, ltvCac * 15);
  const mrrSignal = p.mrr > 0 ? 20 : 0;
  const score = Math.round(clamp(0, 100, ratioScore + mrrSignal + 10));
  return {
    sectionId: "finance",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Unit economics are strong. LTV/CAC of ${ltvCac.toFixed(1)}x is well above the 3x threshold.`
      : score >= 45
        ? `Unit economics are workable. LTV/CAC of ${ltvCac.toFixed(1)}x has room to improve.`
        : `Unit economics are below sustainable. LTV/CAC of ${ltvCac.toFixed(1)}x means growth burns capital.`,
    topRisk: ltvCac > 0 && ltvCac < 3 ? "Each new customer is unprofitable over their lifetime." : undefined,
  };
}

function scoreGrowth(p: ProductProfile): SectionScore {
  // Growth = activation × retention as a proxy for compounding engagement
  const compounding = (p.activationRate / 100) * (p.retentionRate30 / 100) * 100;
  const score = Math.round(clamp(0, 100, compounding * 2.5));
  return {
    sectionId: "growth",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Growth engine is compounding. Activation × retention is producing healthy user economics.`
      : score >= 45
        ? `Growth has potential but isn't compounding yet. Lift activation first, retention will follow.`
        : `Growth is leaky. Activation × retention combo is too weak to sustain paid acquisition.`,
    topRisk: compounding < 15 ? "Funnel leaks faster than acquisition can refill it." : undefined,
  };
}

function scoreCompliance(p: ProductProfile): SectionScore {
  const sensitivityFactor = p.complianceSensitivity === "Low" ? 1.1
    : p.complianceSensitivity === "Medium" ? 1.0 : 0.85;
  const readiness = p.complianceReadiness * sensitivityFactor;
  const frameworkBonus = Math.min(15, p.selectedFrameworks.length * 3);
  const score = Math.round(clamp(0, 100, readiness + frameworkBonus));
  return {
    sectionId: "compliance",
    score,
    band: bandOf(score),
    insight: score >= 70
      ? `Compliance is matched to sensitivity (${p.complianceSensitivity}). Enterprise-ready.`
      : score >= 45
        ? `Compliance is partial. ${p.complianceSensitivity} sensitivity with ${p.complianceReadiness}/100 readiness will surface gaps in enterprise reviews.`
        : `Compliance is the most urgent gap. ${p.complianceSensitivity} sensitivity at ${p.complianceReadiness}/100 blocks enterprise sales motion.`,
    topRisk: p.complianceSensitivity === "High" && p.complianceReadiness < 60
      ? "Active deal-blocker for any enterprise pursuit." : undefined,
  };
}

// ─── Action item generation ─────────────────────────────────────────────────

export type ActionItemDraft = {
  title: string;
  source: "audit" | "simulator" | "manual";
  sectionId?: SectionId;
  priority: "high" | "med" | "low";
  impact?: string;
};

/**
 * Generate suggested action items from a profile + section scores.
 * Each weak section produces 1-2 concrete next actions.
 */
export function generateActionItems(p: ProductProfile): ActionItemDraft[] {
  const items: ActionItemDraft[] = [];
  const scores = computeAllSectionScores(p);

  // Find the 3 weakest sections and generate concrete tasks for each
  const weakest = [...scores].sort((a, b) => a.score - b.score).slice(0, 3);

  for (const s of weakest) {
    if (s.sectionId === "product" && p.onboardingSteps > 4) {
      items.push({
        title: `Reduce onboarding from ${p.onboardingSteps} to 3 steps`,
        source: "audit", sectionId: "product", priority: "high",
        impact: "Activation +12-15pp",
      });
    }
    if (s.sectionId === "product" && p.activationRate < 50) {
      items.push({
        title: "Front-load the AI-driven recommendation in the first session",
        source: "audit", sectionId: "product", priority: "high",
        impact: "Compounds across retention and LTV",
      });
    }
    if (s.sectionId === "customer" && p.churnRate > 6) {
      items.push({
        title: "Add cancel-flow exit survey + retention offer",
        source: "audit", sectionId: "customer", priority: "high",
        impact: `Churn -${(p.churnRate * 0.15).toFixed(1)}pp`,
      });
    }
    if (s.sectionId === "compliance" && p.complianceReadiness < 60) {
      items.push({
        title: "Implement audit logs for admin and PHI access events",
        source: "audit", sectionId: "compliance", priority: "high",
        impact: "Audit readiness +18 pts",
      });
      if (p.complianceSensitivity === "High") {
        items.push({
          title: "Adopt automated compliance platform (Vanta/Drata)",
          source: "audit", sectionId: "compliance", priority: "med",
          impact: "Unlocks SOC 2 evidence collection",
        });
      }
    }
    if (s.sectionId === "finance" && p.cac > 0 && p.ltv / p.cac < 3) {
      items.push({
        title: `Pause acquisition above $${Math.round(p.cac * 1.1)} CAC until activation > 50%`,
        source: "audit", sectionId: "finance", priority: "med",
        impact: "Reduces unit-economics burn",
      });
    }
    if (s.sectionId === "marketing" && p.cac > 80) {
      items.push({
        title: "Reallocate budget from paid to product-led growth channel",
        source: "audit", sectionId: "marketing", priority: "med",
        impact: "Lower blended CAC over 90 days",
      });
    }
    if (s.sectionId === "sales" && p.arpu < 30) {
      items.push({
        title: "Test a higher-tier package with enterprise admin features",
        source: "audit", sectionId: "sales", priority: "med",
        impact: "ARPU expansion via tier upgrade",
      });
    }
    if (s.sectionId === "operations" && p.roadmapComplexity > 65) {
      items.push({
        title: "Freeze roadmap items outside the top 3 priorities for 30 days",
        source: "audit", sectionId: "operations", priority: "med",
        impact: "Restore execution velocity",
      });
    }
    if (s.sectionId === "growth" && p.activationRate < 50) {
      items.push({
        title: "Launch referral mechanic for power users only",
        source: "audit", sectionId: "growth", priority: "low",
        impact: "Organic CAC reduction at low risk",
      });
    }
  }

  // Always include a "weekly KPI snapshot" task to encourage habit
  items.push({
    title: "Log this week's KPIs (MRR · churn · activation)",
    source: "audit", priority: "low",
    impact: "Builds trend data for next audit",
  });

  return items.slice(0, 6);
}
