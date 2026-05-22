import "server-only";

import type {
  AuditNarrative,
  AuditResult,
  DimensionResult,
} from "@/lib/audit/auditTypes";
import type { AuditAnswers, BusinessProfile } from "@/lib/types";
import {
  buildAuditReportPrompt,
  type AuditReportInput,
} from "@/lib/ai/aiAuditPrompt";
import { buildDeterministicNarrative } from "@/lib/ai/deterministicReport";

type Provider = "mock" | "openai" | "anthropic";

function resolveProvider(): Provider {
  const p = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (p === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (p === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

/**
 * Assemble the generator input from the deterministic scoring result plus the
 * user's business info and raw answers. Falls back to lowest/highest scoring
 * dimensions if the result has no explicit priorities/strengths.
 */
export function buildReportInput(
  result: AuditResult,
  business: BusinessProfile,
  answers: AuditAnswers,
): AuditReportInput {
  const weakest: DimensionResult[] = result.topPriorities.length
    ? result.topPriorities
    : [...result.dimensions].sort((a, b) => a.score - b.score).slice(0, 3);
  const strongest: DimensionResult[] = result.strengths.length
    ? result.strengths
    : [...result.dimensions].sort((a, b) => b.score - a.score).slice(0, 3);

  return {
    business,
    answers,
    finalScore: result.overallScore,
    maturityStage: result.maturityStage,
    categoryScores: result.categories,
    weakest,
    strongest,
    dimensions: result.dimensions,
  };
}

/**
 * Generate the strategic audit report. Uses the configured AI provider when a
 * key is present; otherwise (or on any failure) returns the deterministic
 * report so the product always produces a complete result.
 *
 * Server-only: API keys are read from the environment and never leave the
 * server. Call this from a route handler or server action.
 */
export async function generateAuditReport(
  input: AuditReportInput,
): Promise<AuditNarrative> {
  const fallback = buildDeterministicNarrative(input);
  const provider = resolveProvider();
  if (provider === "mock") return fallback;

  try {
    const { system, user } = buildAuditReportPrompt(input);
    const ai =
      provider === "openai"
        ? await callOpenAI(system, user)
        : await callAnthropic(system, user);
    return normalize(ai, fallback, provider);
  } catch (err) {
    console.error(`[generateAuditReport] ${provider} failed, using fallback:`, err);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Provider calls
// ---------------------------------------------------------------------------
async function callOpenAI(system: string, user: string): Promise<unknown> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { json: JSON.parse(data.choices?.[0]?.message?.content ?? "{}"), model };
}

async function callAnthropic(system: string, user: string): Promise<unknown> {
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "{}";
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return { json: JSON.parse(cleaned), model };
}

// ---------------------------------------------------------------------------
// Normalisation: overlay AI fields onto the deterministic report so the result
// is always complete, even if the model omits a field.
// ---------------------------------------------------------------------------
function normalize(
  raw: unknown,
  fallback: AuditNarrative,
  provider: string,
): AuditNarrative {
  const { json, model } = raw as { json: Partial<AuditNarrative>; model?: string };

  const str = (v: unknown, d: string) =>
    typeof v === "string" && v.trim() ? v : d;
  const arr = (v: unknown, d: string[]) =>
    Array.isArray(v) && v.length ? (v as string[]) : d;

  return {
    executiveSummary: str(json.executiveSummary, fallback.executiveSummary),
    productDiagnosis: str(json.productDiagnosis, fallback.productDiagnosis),
    scoreOverview: str(json.scoreOverview, fallback.scoreOverview),
    growthBottlenecks: arr(json.growthBottlenecks, fallback.growthBottlenecks),
    positioningAnalysis: str(json.positioningAnalysis, fallback.positioningAnalysis),
    landingPageAnalysis: str(json.landingPageAnalysis, fallback.landingPageAnalysis),
    onboardingAnalysis: str(json.onboardingAnalysis, fallback.onboardingAnalysis),
    pricingAnalysis: str(json.pricingAnalysis, fallback.pricingAnalysis),
    trustAnalysis: str(json.trustAnalysis, fallback.trustAnalysis),
    pmfAnalysis: str(json.pmfAnalysis, fallback.pmfAnalysis),
    topActions:
      Array.isArray(json.topActions) && json.topActions.length
        ? json.topActions.map((a) => ({
            title: str(a?.title, "Action"),
            detail: str(a?.detail, ""),
            priority: (["critical", "high", "medium", "low"] as const).includes(
              a?.priority as never,
            )
              ? a.priority!
              : "medium",
          }))
        : fallback.topActions,
    roadmap30Day:
      Array.isArray(json.roadmap30Day) && json.roadmap30Day.length
        ? json.roadmap30Day.map((p) => ({
            timeframe: str(p?.timeframe, ""),
            focus: str(p?.focus, ""),
            actions: arr(p?.actions, []),
          }))
        : fallback.roadmap30Day,
    quickWins: arr(json.quickWins, fallback.quickWins),
    strategicRisks: arr(json.strategicRisks, fallback.strategicRisks),
    finalRecommendation: str(json.finalRecommendation, fallback.finalRecommendation),
    generatedAt: new Date().toISOString(),
    engine: "ai",
    model: model ?? provider,
  };
}
