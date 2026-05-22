import type {
  CategoryId,
  CategoryMeta,
  Dimension,
  DimensionId,
  DiagnosticQuestion,
  ScalePoint,
} from "@/lib/audit/auditTypes";

/**
 * The diagnostic question bank for Product Audit Studio.
 *
 * Every question is a positive statement rated on a shared 5-point Likert
 * scale. This makes scoring deterministic and lets dimensions be compared on
 * the same axis. Question and dimension weights tune how much each input
 * influences its dimension and the final score.
 */

export const LIKERT_SCALE: ScalePoint[] = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral / unsure" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "clarity",
    title: "Clarity & Positioning",
    description: "How clearly the product explains what it is and why it matters.",
  },
  {
    id: "market",
    title: "Market & Customer",
    description: "How well the product fits a real customer with an urgent need.",
  },
  {
    id: "experience",
    title: "Experience & Conversion",
    description: "How effectively visitors become activated, trusting users.",
  },
  {
    id: "growth",
    title: "Growth & Monetisation",
    description: "How sustainably the product retains, prices and acquires.",
  },
];

/** Small helper to declare a question with a default weight of 1. */
function q(
  id: string,
  dimension: DimensionId,
  text: string,
  opts: { weight?: number; helpText?: string } = {},
): DiagnosticQuestion {
  return {
    id,
    dimension,
    text,
    weight: opts.weight ?? 1,
    helpText: opts.helpText,
  };
}

export const DIMENSIONS: Dimension[] = [
  // -------------------------------------------------------------------------
  {
    id: "positioning_clarity",
    title: "Positioning Clarity",
    description: "Can people instantly grasp what you are and who you serve?",
    category: "clarity",
    weight: 1.0,
    questions: [
      q("pos_1", "positioning_clarity", "We can describe what we do in one clear sentence.", { weight: 1.5 }),
      q("pos_2", "positioning_clarity", "Our positioning clearly states who the product is for."),
      q("pos_3", "positioning_clarity", "Visitors immediately understand what category of product we are."),
      q("pos_4", "positioning_clarity", "We are clearly differentiated from the obvious alternatives."),
      q("pos_5", "positioning_clarity", "Our messaging is consistent across site, app and marketing."),
      q("pos_6", "positioning_clarity", "Everyone on the team describes the product the same way."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "target_customer",
    title: "Target Customer Definition",
    description: "Do you know exactly who you are building for?",
    category: "market",
    weight: 1.0,
    questions: [
      q("tgt_1", "target_customer", "We have a clearly defined primary customer segment.", { weight: 1.5 }),
      q("tgt_2", "target_customer", "We know the specific job our customer hires us to do."),
      q("tgt_3", "target_customer", "We can name the personas who buy and who use the product."),
      q("tgt_4", "target_customer", "We understand where our target customers spend their time."),
      q("tgt_5", "target_customer", "We have validated our segment with real conversations or data."),
      q("tgt_6", "target_customer", "We intentionally decline customers outside our target."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "problem_urgency",
    title: "Problem Urgency",
    description: "Is the problem painful and pressing enough to act on?",
    category: "market",
    weight: 1.2,
    questions: [
      q("urg_1", "problem_urgency", "The problem we solve is a top priority for our customers.", { weight: 1.5 }),
      q("urg_2", "problem_urgency", "Customers actively search for a solution to this problem."),
      q("urg_3", "problem_urgency", "Customers feel real pain (cost, time, risk) without us."),
      q("urg_4", "problem_urgency", "The problem occurs frequently, not just occasionally."),
      q("urg_5", "problem_urgency", "Customers have budget allocated to solving this problem."),
      q("urg_6", "problem_urgency", "Doing nothing is clearly worse than adopting our product."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "value_proposition",
    title: "Value Proposition",
    description: "Is the value concrete, specific and believable?",
    category: "clarity",
    weight: 1.2,
    questions: [
      q("val_1", "value_proposition", "Our core value can be expressed as a concrete outcome.", { weight: 1.5 }),
      q("val_2", "value_proposition", "Customers can articulate the value they get from us."),
      q("val_3", "value_proposition", "Our value proposition is specific, not generic."),
      q("val_4", "value_proposition", "We communicate measurable benefits (numbers, %, time saved)."),
      q("val_5", "value_proposition", "Our value clearly outweighs the cost and effort to adopt."),
      q("val_6", "value_proposition", "Our promise is believable and backed by proof."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "landing_conversion",
    title: "Landing Page Conversion",
    description: "Does your landing page turn attention into action?",
    category: "experience",
    weight: 0.9,
    questions: [
      q("lan_1", "landing_conversion", "Our hero communicates the value within 5 seconds.", { weight: 1.5 }),
      q("lan_2", "landing_conversion", "We have a single, obvious primary call-to-action."),
      q("lan_3", "landing_conversion", "Our landing page addresses the visitor's main objections."),
      q("lan_4", "landing_conversion", "We show social proof above the fold or near the CTA."),
      q("lan_5", "landing_conversion", "Our page is fast, mobile-friendly and visually clear."),
      q("lan_6", "landing_conversion", "We measure and track our landing page conversion rate."),
      q("lan_7", "landing_conversion", "Our copy speaks to the customer, not about ourselves."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "onboarding_friction",
    title: "Onboarding Friction",
    description: "How quickly and easily do new users reach value?",
    category: "experience",
    weight: 0.9,
    questions: [
      q("onb_1", "onboarding_friction", "New users reach first value (the aha moment) quickly.", { weight: 1.5 }),
      q("onb_2", "onboarding_friction", "Signup asks only for the information we truly need."),
      q("onb_3", "onboarding_friction", "We guide new users with a clear first-run experience."),
      q("onb_4", "onboarding_friction", "Users can succeed without having to talk to our team."),
      q("onb_5", "onboarding_friction", "We reduce setup work with templates, samples or defaults."),
      q("onb_6", "onboarding_friction", "We measure activation and know where users drop off."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "feature_clarity",
    title: "Feature Clarity",
    description: "Do features map cleanly to outcomes without overwhelm?",
    category: "clarity",
    weight: 0.8,
    questions: [
      q("fea_1", "feature_clarity", "Our core feature set maps directly to customer outcomes.", { weight: 1.5 }),
      q("fea_2", "feature_clarity", "Users understand what each key feature does."),
      q("fea_3", "feature_clarity", "We avoid overwhelming users with too many features."),
      q("fea_4", "feature_clarity", "Our most valuable feature is easy to find and use."),
      q("fea_5", "feature_clarity", "Feature naming uses customer language, not internal jargon."),
      q("fea_6", "feature_clarity", "We have a clear point of view on what NOT to build."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "pricing_logic",
    title: "Pricing Logic",
    description: "Is pricing aligned with value and easy to understand?",
    category: "growth",
    weight: 1.0,
    questions: [
      q("pri_1", "pricing_logic", "Our pricing is aligned with the value customers receive.", { weight: 1.5 }),
      q("pri_2", "pricing_logic", "Our pricing model matches how customers get value (seats, usage, etc.)."),
      q("pri_3", "pricing_logic", "Our tiers map to clear customer segments or needs."),
      q("pri_4", "pricing_logic", "Our pricing is easy to understand on first read."),
      q("pri_5", "pricing_logic", "We are confident we are neither significantly under- nor over-priced."),
      q("pri_6", "pricing_logic", "We have tested or validated willingness to pay."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "trust_credibility",
    title: "Trust & Credibility",
    description: "Do you give visitors enough reasons to believe you?",
    category: "experience",
    weight: 0.8,
    questions: [
      q("tru_1", "trust_credibility", "We display credible social proof (logos, testimonials, reviews).", { weight: 1.5 }),
      q("tru_2", "trust_credibility", "We clearly communicate our security and privacy practices."),
      q("tru_3", "trust_credibility", "Our brand looks professional and trustworthy."),
      q("tru_4", "trust_credibility", "We are transparent about pricing, terms and limitations."),
      q("tru_5", "trust_credibility", "We provide responsive, visible support options."),
      q("tru_6", "trust_credibility", "We back claims with proof (case studies, metrics, guarantees)."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "retention_potential",
    title: "Retention Potential",
    description: "Will customers keep coming back and stay?",
    category: "growth",
    weight: 1.1,
    questions: [
      q("ret_1", "retention_potential", "Customers return to the product regularly.", { weight: 1.5 }),
      q("ret_2", "retention_potential", "The product becomes more valuable the more it is used."),
      q("ret_3", "retention_potential", "We have habit or workflow lock-in (data, integrations, routine)."),
      q("ret_4", "retention_potential", "Our churn is low or steadily improving."),
      q("ret_5", "retention_potential", "We actively measure retention cohorts."),
      q("ret_6", "retention_potential", "Customers would be very disappointed if we disappeared.", { weight: 1.5 }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "gtm_readiness",
    title: "GTM Readiness",
    description: "Can you reach and convert customers repeatably?",
    category: "growth",
    weight: 0.9,
    questions: [
      q("gtm_1", "gtm_readiness", "We have at least one repeatable acquisition channel.", { weight: 1.5 }),
      q("gtm_2", "gtm_readiness", "We know our approximate customer acquisition cost."),
      q("gtm_3", "gtm_readiness", "We have a clear, documented go-to-market motion."),
      q("gtm_4", "gtm_readiness", "Our messaging is tailored per channel and segment."),
      q("gtm_5", "gtm_readiness", "We can predictably generate new qualified leads."),
      q("gtm_6", "gtm_readiness", "We have the assets and collateral needed to sell."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "pmf_signals",
    title: "Product-Market Fit Signals",
    description: "Is the market pulling the product out of your hands?",
    category: "market",
    weight: 1.4,
    questions: [
      q("pmf_1", "pmf_signals", "We have strong organic growth or word of mouth.", { weight: 1.5 }),
      q("pmf_2", "pmf_signals", "Usage and engagement grow without heavy spend."),
      q("pmf_3", "pmf_signals", "Customers refer others to the product."),
      q("pmf_4", "pmf_signals", "We have a core of highly engaged, retained users.", { weight: 1.5 }),
      q("pmf_5", "pmf_signals", "Demand is outpacing our ability to serve it."),
      q("pmf_6", "pmf_signals", "Quantitative signals (retention, NPS, growth) indicate fit."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Lookups & helpers
// ---------------------------------------------------------------------------

export const ALL_QUESTIONS: DiagnosticQuestion[] = DIMENSIONS.flatMap(
  (d) => d.questions,
);

export const TOTAL_QUESTION_COUNT = ALL_QUESTIONS.length;

const DIMENSION_MAP = new Map<DimensionId, Dimension>(
  DIMENSIONS.map((d) => [d.id, d]),
);

const CATEGORY_MAP = new Map<CategoryId, CategoryMeta>(
  CATEGORIES.map((c) => [c.id, c]),
);

export function getDimension(id: DimensionId): Dimension {
  const dimension = DIMENSION_MAP.get(id);
  if (!dimension) throw new Error(`Unknown dimension: ${id}`);
  return dimension;
}

export function getCategory(id: CategoryId): CategoryMeta {
  const category = CATEGORY_MAP.get(id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

export function questionsForDimension(id: DimensionId): DiagnosticQuestion[] {
  return getDimension(id).questions;
}

export function dimensionsForCategory(id: CategoryId): Dimension[] {
  return DIMENSIONS.filter((d) => d.category === id);
}
