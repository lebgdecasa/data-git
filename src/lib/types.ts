/**
 * Domain types for Product Audit Studio.
 * These mirror the database schema in `supabase/migrations`.
 */

import type { AuditResult } from "@/lib/audit/auditTypes";

export type AuditStatus = "draft" | "in_progress" | "generating" | "completed";

/** The six audit pillars that a product is scored against. */
export type AuditDomainId =
  | "product"
  | "landing_page"
  | "onboarding"
  | "pricing"
  | "positioning"
  | "conversion_funnel";

export type QuestionType = "text" | "textarea" | "select" | "scale" | "url";

export interface AuditQuestion {
  id: string;
  domain: AuditDomainId;
  label: string;
  helpText?: string;
  type: QuestionType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface AuditDomain {
  id: AuditDomainId;
  title: string;
  description: string;
  icon: string; // lucide icon name
}

/** Business / product context captured when creating an audit. */
export interface BusinessProfile {
  productName: string;
  website?: string;
  industry?: string;
  stage?: string;
  targetAudience?: string;
  primaryGoal?: string;
  description?: string;
}

/** A single attachment: a link or an uploaded screenshot. */
export interface AuditAttachment {
  id: string;
  type: "link" | "screenshot";
  label: string;
  value: string; // URL or storage path
}

/** Map of question id -> answer value (string, or string[] for checkboxes). */
export type AuditAnswers = Record<string, string | string[]>;

export interface DomainScore {
  domain: AuditDomainId;
  score: number; // 0-100
  summary: string;
}

export interface AuditIssue {
  id: string;
  domain: AuditDomainId;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface AuditRecommendation {
  id: string;
  domain: AuditDomainId;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
}

/** The structured report produced by the AI generator. */
export interface AuditReport {
  overallScore: number; // 0-100
  headline: string;
  summary: string;
  domainScores: DomainScore[];
  strengths: string[];
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  generatedAt: string;
  provider: string;
}

export interface Audit {
  id: string;
  userId: string;
  title: string;
  status: AuditStatus;
  profile: BusinessProfile;
  answers: AuditAnswers;
  attachments: AuditAttachment[];
  report: AuditResult | null;
  createdAt: string;
  updatedAt: string;
}

/** Database row shape (snake_case) as stored in Supabase. */
export interface AuditRow {
  id: string;
  user_id: string;
  title: string;
  status: AuditStatus;
  profile: BusinessProfile;
  answers: AuditAnswers;
  attachments: AuditAttachment[];
  report: AuditResult | null;
  created_at: string;
  updated_at: string;
}

export function mapAuditRow(row: AuditRow): Audit {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
    profile: row.profile ?? ({} as BusinessProfile),
    answers: row.answers ?? {},
    attachments: row.attachments ?? [],
    report: row.report,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
