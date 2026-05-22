import type { Audit } from "@/lib/types";
import { AUDIT_QUESTIONS, getDomain } from "@/lib/audit-config";

/**
 * Builds the system + user prompt sent to the LLM. Kept separate so it can be
 * unit-tested and reused across providers.
 */
export function buildAuditPrompt(audit: Audit): {
  system: string;
  user: string;
} {
  const system = [
    "You are a world-class product strategist and growth consultant.",
    "You audit early-stage digital products across six pillars: product, landing page, onboarding, pricing, positioning and conversion funnel.",
    "You are pragmatic, specific and honest. You prioritise high-impact, low-effort recommendations.",
    "Return ONLY valid JSON matching the provided schema. Do not include markdown fences or commentary.",
  ].join(" ");

  const answerLines = AUDIT_QUESTIONS.map((q) => {
    const answer = audit.answers[q.id];
    if (!answer) return null;
    return `- [${getDomain(q.domain).title}] ${q.label}\n  Answer: ${answer}`;
  })
    .filter(Boolean)
    .join("\n");

  const attachmentLines = audit.attachments
    .map((a) => `- (${a.type}) ${a.label}: ${a.value}`)
    .join("\n");

  const schema = `{
  "overallScore": number (0-100),
  "headline": string,
  "summary": string (2-3 sentences),
  "domainScores": [{ "domain": one of product|landing_page|onboarding|pricing|positioning|conversion_funnel, "score": number, "summary": string }],
  "strengths": string[],
  "issues": [{ "domain": <domain>, "title": string, "description": string, "severity": "high"|"medium"|"low" }],
  "recommendations": [{ "domain": <domain>, "title": string, "description": string, "impact": "high"|"medium"|"low", "effort": "high"|"medium"|"low" }]
}`;

  const user = [
    `Audit the following product and produce a structured report.`,
    ``,
    `## Business profile`,
    `Product: ${audit.profile.productName}`,
    audit.profile.website ? `Website: ${audit.profile.website}` : null,
    audit.profile.industry ? `Industry: ${audit.profile.industry}` : null,
    audit.profile.stage ? `Stage: ${audit.profile.stage}` : null,
    audit.profile.targetAudience
      ? `Target audience: ${audit.profile.targetAudience}`
      : null,
    audit.profile.primaryGoal
      ? `Primary goal: ${audit.profile.primaryGoal}`
      : null,
    audit.profile.description ? `Description: ${audit.profile.description}` : null,
    ``,
    `## Questionnaire answers`,
    answerLines || "(none provided)",
    ``,
    `## Attachments`,
    attachmentLines || "(none provided)",
    ``,
    `## Output JSON schema`,
    schema,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { system, user };
}
