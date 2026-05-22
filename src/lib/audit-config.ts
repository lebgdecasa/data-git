import type { AuditDomain, AuditQuestion } from "@/lib/types";

/**
 * The six pillars every product is audited against. Order here drives the
 * order they appear in the questionnaire and the report.
 */
export const AUDIT_DOMAINS: AuditDomain[] = [
  {
    id: "product",
    title: "Product",
    description: "Core value, feature focus and product-market fit signals.",
    icon: "Boxes",
  },
  {
    id: "landing_page",
    title: "Landing Page",
    description: "Clarity, messaging and first-impression conversion.",
    icon: "LayoutTemplate",
  },
  {
    id: "onboarding",
    title: "Onboarding",
    description: "Activation flow and time-to-first-value.",
    icon: "Workflow",
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Packaging, willingness-to-pay and monetisation.",
    icon: "Tags",
  },
  {
    id: "positioning",
    title: "Positioning",
    description: "Differentiation, target market and category.",
    icon: "Compass",
  },
  {
    id: "conversion_funnel",
    title: "Conversion Funnel",
    description: "Acquisition, activation and retention leaks.",
    icon: "Filter",
  },
];

const SCALE_OPTIONS = [
  { value: "1", label: "1 — Very weak" },
  { value: "2", label: "2 — Weak" },
  { value: "3", label: "3 — Average" },
  { value: "4", label: "4 — Strong" },
  { value: "5", label: "5 — Very strong" },
];

/**
 * Structured audit questionnaire. Each domain has a mix of qualitative and
 * scale questions so the report can be both narrative and quantitative.
 */
export const AUDIT_QUESTIONS: AuditQuestion[] = [
  // ---- Product ----
  {
    id: "product_value_prop",
    domain: "product",
    label: "In one sentence, what core problem does your product solve?",
    type: "textarea",
    placeholder: "We help X do Y so they can Z...",
    required: true,
  },
  {
    id: "product_pmf_signal",
    domain: "product",
    label: "How strong are your product-market fit signals today?",
    helpText: "Retention, organic growth, users who'd be 'very disappointed' without it.",
    type: "scale",
    options: SCALE_OPTIONS,
    required: true,
  },
  {
    id: "product_core_feature",
    domain: "product",
    label: "What is the single most-used feature?",
    type: "text",
    placeholder: "e.g. The AI report generator",
  },

  // ---- Landing Page ----
  {
    id: "landing_url",
    domain: "landing_page",
    label: "Landing page URL",
    type: "url",
    placeholder: "https://yourproduct.com",
  },
  {
    id: "landing_clarity",
    domain: "landing_page",
    label: "How clearly does your hero communicate what you do in 5 seconds?",
    type: "scale",
    options: SCALE_OPTIONS,
    required: true,
  },
  {
    id: "landing_cta",
    domain: "landing_page",
    label: "What is your primary call-to-action?",
    type: "text",
    placeholder: "e.g. Start free audit",
  },

  // ---- Onboarding ----
  {
    id: "onboarding_ttfv",
    domain: "onboarding",
    label: "How long until a new user reaches their first 'aha' moment?",
    type: "select",
    options: [
      { value: "under_1m", label: "Under 1 minute" },
      { value: "1_5m", label: "1–5 minutes" },
      { value: "5_30m", label: "5–30 minutes" },
      { value: "over_30m", label: "Over 30 minutes" },
      { value: "unknown", label: "Not sure" },
    ],
    required: true,
  },
  {
    id: "onboarding_friction",
    domain: "onboarding",
    label: "Where do new users get stuck or drop off?",
    type: "textarea",
    placeholder: "Describe the biggest friction points in your signup/activation flow.",
  },

  // ---- Pricing ----
  {
    id: "pricing_model",
    domain: "pricing",
    label: "What is your pricing model?",
    type: "select",
    options: [
      { value: "free", label: "Free / not monetised yet" },
      { value: "freemium", label: "Freemium" },
      { value: "subscription", label: "Subscription" },
      { value: "usage", label: "Usage-based" },
      { value: "one_time", label: "One-time purchase" },
      { value: "enterprise", label: "Sales-led / enterprise" },
    ],
    required: true,
  },
  {
    id: "pricing_confidence",
    domain: "pricing",
    label: "How confident are you that your pricing captures the value you deliver?",
    type: "scale",
    options: SCALE_OPTIONS,
    required: true,
  },
  {
    id: "pricing_tiers",
    domain: "pricing",
    label: "Briefly describe your plans / tiers.",
    type: "textarea",
    placeholder: "Free, Pro ($X/mo), Team ($Y/mo)...",
  },

  // ---- Positioning ----
  {
    id: "positioning_audience",
    domain: "positioning",
    label: "Who is your primary target customer?",
    type: "text",
    placeholder: "e.g. Solo SaaS founders pre-product-market-fit",
    required: true,
  },
  {
    id: "positioning_alternative",
    domain: "positioning",
    label: "What do customers use today instead of you?",
    type: "text",
    placeholder: "Competitor, spreadsheet, agency, doing nothing...",
  },
  {
    id: "positioning_differentiation",
    domain: "positioning",
    label: "Why do customers choose you over the alternative?",
    type: "textarea",
    placeholder: "Your unique, hard-to-copy advantage.",
  },

  // ---- Conversion Funnel ----
  {
    id: "funnel_top",
    domain: "conversion_funnel",
    label: "What are your main acquisition channels?",
    type: "text",
    placeholder: "SEO, paid ads, content, referrals, communities...",
  },
  {
    id: "funnel_signup_rate",
    domain: "conversion_funnel",
    label: "How well does traffic convert to signups?",
    type: "scale",
    options: SCALE_OPTIONS,
    required: true,
  },
  {
    id: "funnel_retention",
    domain: "conversion_funnel",
    label: "What does week-4 retention look like?",
    type: "select",
    options: [
      { value: "strong", label: "Strong (most users return)" },
      { value: "moderate", label: "Moderate" },
      { value: "weak", label: "Weak (heavy churn)" },
      { value: "unknown", label: "Not measured yet" },
    ],
  },
];

export function questionsForDomain(domain: AuditDomain["id"]): AuditQuestion[] {
  return AUDIT_QUESTIONS.filter((q) => q.domain === domain);
}

export function getDomain(id: AuditDomain["id"]): AuditDomain {
  return AUDIT_DOMAINS.find((d) => d.id === id)!;
}

export const INDUSTRY_OPTIONS = [
  "SaaS / Software",
  "E-commerce",
  "Marketplace",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Developer tools",
  "Agency / Services",
  "Consumer app",
  "Other",
];

export const STAGE_OPTIONS = [
  "Idea / pre-launch",
  "MVP",
  "Early traction",
  "Product-market fit",
  "Scaling",
];
