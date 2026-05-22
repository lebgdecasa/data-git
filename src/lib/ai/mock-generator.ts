import type {
  Audit,
  AuditDomainId,
  AuditReport,
  DomainScore,
} from "@/lib/types";
import { AUDIT_DOMAINS, AUDIT_QUESTIONS, getDomain } from "@/lib/audit-config";

/**
 * Deterministic, heuristic report generator. Lets the whole app run end-to-end
 * with zero external API keys. Scores are derived from the actual answers so
 * the output feels responsive to user input rather than random.
 */

function scaleAnswerToScore(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  if (Number.isFinite(n) && n >= 1 && n <= 5) {
    return Math.round((n / 5) * 100);
  }
  return null;
}

function answeredRatio(domain: AuditDomainId, answers: Audit["answers"]): number {
  const qs = AUDIT_QUESTIONS.filter((q) => q.domain === domain);
  if (qs.length === 0) return 0;
  const answered = qs.filter((q) => (answers[q.id] ?? "").trim().length > 0);
  return answered.length / qs.length;
}

function domainScore(domain: AuditDomainId, audit: Audit): number {
  const qs = AUDIT_QUESTIONS.filter((q) => q.domain === domain);
  const scaleScores = qs
    .map((q) => scaleAnswerToScore(audit.answers[q.id]))
    .filter((s): s is number => s !== null);

  const completion = answeredRatio(domain, audit.answers);
  // Base from scale answers, nudged by how much context was provided.
  const base =
    scaleScores.length > 0
      ? scaleScores.reduce((a, b) => a + b, 0) / scaleScores.length
      : 55;
  const score = Math.round(base * 0.75 + completion * 100 * 0.25);
  return Math.max(20, Math.min(98, score));
}

const DOMAIN_STRENGTH_COPY: Record<AuditDomainId, string> = {
  product: "Clear sense of the core problem you solve.",
  landing_page: "A defined primary call-to-action is in place.",
  onboarding: "You are tracking time-to-first-value.",
  pricing: "You have an explicit monetisation model.",
  positioning: "Your target customer is articulated.",
  conversion_funnel: "Acquisition channels are identified.",
};

const DOMAIN_ISSUE_COPY: Record<
  AuditDomainId,
  { title: string; description: string }
> = {
  product: {
    title: "Value proposition needs sharper proof",
    description:
      "The core value is stated but lacks quantified outcomes. Add concrete before/after metrics to make the promise believable.",
  },
  landing_page: {
    title: "Hero clarity is below the 5-second bar",
    description:
      "Visitors may not grasp what you do at a glance. Lead with the outcome, not the mechanism, and place the CTA above the fold.",
  },
  onboarding: {
    title: "Time-to-first-value is too long",
    description:
      "Users wait too long before experiencing the 'aha' moment. Remove setup steps and pre-fill sample data to accelerate activation.",
  },
  pricing: {
    title: "Pricing may be leaving value on the table",
    description:
      "Confidence in pricing is low. Run willingness-to-pay interviews and consider value-metric aligned tiers.",
  },
  positioning: {
    title: "Differentiation vs alternatives is thin",
    description:
      "The reason to choose you over the status quo is not yet sharp. Anchor against the real alternative customers use today.",
  },
  conversion_funnel: {
    title: "Funnel has an unmeasured leak",
    description:
      "Key conversion or retention steps are not instrumented. Add analytics to find where the biggest drop-off occurs.",
  },
};

const DOMAIN_REC_COPY: Record<
  AuditDomainId,
  { title: string; description: string; impact: "high" | "medium" | "low"; effort: "high" | "medium" | "low" }
> = {
  product: {
    title: "Add an outcome-based value statement",
    description:
      "Rewrite your headline around the measurable result customers get, e.g. 'cut onboarding time by 40%'.",
    impact: "high",
    effort: "low",
  },
  landing_page: {
    title: "Rewrite the hero for instant clarity",
    description:
      "One sentence describing the outcome + a single strong CTA + social proof. Remove competing links.",
    impact: "high",
    effort: "low",
  },
  onboarding: {
    title: "Design a guided first-run experience",
    description:
      "Add a 3-step checklist and sample data so users hit value within their first session.",
    impact: "high",
    effort: "medium",
  },
  pricing: {
    title: "Test a value-metric pricing tier",
    description:
      "Introduce a usage- or seat-based tier and A/B test it against your current packaging.",
    impact: "medium",
    effort: "medium",
  },
  positioning: {
    title: "Write a one-line positioning statement",
    description:
      "'For [audience] who [need], we are the [category] that [differentiator].' Validate it with 5 customers.",
    impact: "high",
    effort: "low",
  },
  conversion_funnel: {
    title: "Instrument the activation funnel",
    description:
      "Track signup -> activation -> retention and review week-over-week to find the biggest leak.",
    impact: "high",
    effort: "medium",
  },
};

export function generateMockReport(audit: Audit): AuditReport {
  const domainScores: DomainScore[] = AUDIT_DOMAINS.map((d) => {
    const score = domainScore(d.id, audit);
    return {
      domain: d.id,
      score,
      summary:
        score >= 75
          ? `${d.title} is a relative strength. Keep compounding it.`
          : score >= 50
            ? `${d.title} is solid but has clear room to improve.`
            : `${d.title} is a priority area that is holding back growth.`,
    };
  });

  const overallScore = Math.round(
    domainScores.reduce((a, d) => a + d.score, 0) / domainScores.length,
  );

  // Weakest domains drive issues + recommendations.
  const ranked = [...domainScores].sort((a, b) => a.score - b.score);
  const weakest = ranked.slice(0, 4);
  const strongest = ranked.slice(-2).reverse();

  const issues = weakest.map((d, i) => ({
    id: `issue_${d.domain}`,
    domain: d.domain,
    title: DOMAIN_ISSUE_COPY[d.domain].title,
    description: DOMAIN_ISSUE_COPY[d.domain].description,
    severity: (d.score < 45 ? "high" : i < 2 ? "medium" : "low") as
      | "high"
      | "medium"
      | "low",
  }));

  const recommendations = weakest.map((d) => ({
    id: `rec_${d.domain}`,
    domain: d.domain,
    ...DOMAIN_REC_COPY[d.domain],
  }));

  const strengths = strongest.map(
    (d) => DOMAIN_STRENGTH_COPY[d.domain],
  );

  const headline =
    overallScore >= 75
      ? `${audit.profile.productName} is in strong shape with targeted upside`
      : overallScore >= 50
        ? `${audit.profile.productName} has a solid core with clear growth levers`
        : `${audit.profile.productName} has high-impact fixes that can unlock growth`;

  return {
    overallScore,
    headline,
    summary: `Across six pillars, ${audit.profile.productName} scores ${overallScore}/100. The biggest opportunities are in ${weakest
      .slice(0, 2)
      .map((d) => getDomain(d.domain).title.toLowerCase())
      .join(" and ")}. Focus there first for the fastest measurable wins.`,
    domainScores,
    strengths,
    issues,
    recommendations,
    generatedAt: new Date().toISOString(),
    provider: "mock",
  };
}
