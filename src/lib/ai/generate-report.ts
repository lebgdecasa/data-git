import type { Audit, AuditReport } from "@/lib/types";
import { buildAuditPrompt } from "@/lib/ai/prompt";
import { generateMockReport } from "@/lib/ai/mock-generator";

type Provider = "mock" | "openai" | "anthropic";

function resolveProvider(): Provider {
  const p = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (p === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (p === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

/**
 * Generates a structured audit report. Falls back to the deterministic mock
 * generator whenever a real provider is not configured or the call fails, so
 * the product is always functional.
 */
export async function generateReport(audit: Audit): Promise<AuditReport> {
  const provider = resolveProvider();

  try {
    if (provider === "openai") return await generateWithOpenAI(audit);
    if (provider === "anthropic") return await generateWithAnthropic(audit);
  } catch (err) {
    console.error(`[generate-report] ${provider} failed, using mock:`, err);
  }

  return generateMockReport(audit);
}

// ---------------------------------------------------------------------------
// OpenAI integration (placeholder — wired but inert until OPENAI_API_KEY set).
// Uses the Chat Completions JSON mode. Swap the model via OPENAI_MODEL.
// ---------------------------------------------------------------------------
async function generateWithOpenAI(audit: Audit): Promise<AuditReport> {
  const { system, user } = buildAuditPrompt(audit);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return finalizeReport(JSON.parse(content), "openai");
}

// ---------------------------------------------------------------------------
// Anthropic / Claude integration (placeholder — inert until ANTHROPIC_API_KEY).
// ---------------------------------------------------------------------------
async function generateWithAnthropic(audit: Audit): Promise<AuditReport> {
  const { system, user } = buildAuditPrompt(audit);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "{}";
  // Strip any accidental markdown fences before parsing.
  const json = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return finalizeReport(JSON.parse(json), "anthropic");
}

/** Normalises an LLM JSON response into a complete AuditReport. */
function finalizeReport(
  raw: Partial<AuditReport>,
  provider: string,
): AuditReport {
  return {
    overallScore: clampScore(raw.overallScore ?? 0),
    headline: raw.headline ?? "Product audit report",
    summary: raw.summary ?? "",
    domainScores: (raw.domainScores ?? []).map((d) => ({
      ...d,
      score: clampScore(d.score),
    })),
    strengths: raw.strengths ?? [],
    issues: raw.issues ?? [],
    recommendations: raw.recommendations ?? [],
    generatedAt: new Date().toISOString(),
    provider,
  };
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
