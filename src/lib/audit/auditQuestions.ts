import type {
  CategoryId,
  CategoryMeta,
  Dimension,
  DimensionId,
  DiagnosticQuestion,
  QuestionOption,
  QuestionType,
  ScalePoint,
} from "@/lib/audit/auditTypes";

/**
 * The diagnostic question bank for Product Audit Studio.
 *
 * `scale` questions are positive statements rated on a shared 5-point Likert
 * scale — these are the only questions that feed the deterministic score.
 * Other question types (text, textarea, radio, checkbox, url, file) capture
 * qualitative context that enriches the audit and the future AI layer.
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

/** A scored 1-5 statement. Required by default — it drives the score. */
function scale(
  id: string,
  dimension: DimensionId,
  text: string,
  opts: { weight?: number; helpText?: string } = {},
): DiagnosticQuestion {
  return {
    id,
    dimension,
    text,
    type: "scale",
    required: true,
    weight: opts.weight ?? 1,
    helpText: opts.helpText,
  };
}

/** A qualitative context question. Optional by default. */
function ask(
  id: string,
  dimension: DimensionId,
  text: string,
  type: QuestionType,
  opts: {
    helpText?: string;
    placeholder?: string;
    required?: boolean;
    options?: QuestionOption[];
  } = {},
): DiagnosticQuestion {
  return {
    id,
    dimension,
    text,
    type,
    weight: 1,
    required: opts.required ?? false,
    helpText: opts.helpText,
    placeholder: opts.placeholder,
    options: opts.options,
  };
}

export const DIMENSIONS: Dimension[] = [
  // -------------------------------------------------------------------------
  {
    id: "positioning_clarity",
    title: "Positioning Clarity",
    description: "Can people instantly grasp what you are and who you serve?",
    intro:
      "Let's start with how clearly the world understands you. We're checking whether someone can 'get' your product in just a few seconds.",
    category: "clarity",
    weight: 1.0,
    questions: [
      ask("pos_pitch", "positioning_clarity", "In one sentence, what does your product do?", "text", {
        placeholder: "We help [who] do [what] so they can [outcome].",
        helpText: "Don't overthink it — write it the way you'd say it to a friend.",
      }),
      scale("pos_1", "positioning_clarity", "We can describe what we do in one clear sentence.", { weight: 1.5 }),
      scale("pos_2", "positioning_clarity", "Our positioning clearly states who the product is for."),
      scale("pos_3", "positioning_clarity", "Visitors immediately understand what category of product we are."),
      scale("pos_4", "positioning_clarity", "We are clearly differentiated from the obvious alternatives."),
      scale("pos_5", "positioning_clarity", "Our messaging is consistent across site, app and marketing."),
      scale("pos_6", "positioning_clarity", "Everyone on the team describes the product the same way."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "target_customer",
    title: "Target Customer Definition",
    description: "Do you know exactly who you are building for?",
    intro:
      "Now let's get specific about who you're for. The sharper your target, the easier every other decision becomes.",
    category: "market",
    weight: 1.0,
    questions: [
      ask("tgt_profile", "target_customer", "Describe your ideal customer in a few sentences.", "textarea", {
        helpText: "Think about the one customer who gets the most value, fastest.",
        placeholder: "Role, company type, the situation they're in, what they care about...",
      }),
      scale("tgt_1", "target_customer", "We have a clearly defined primary customer segment.", { weight: 1.5 }),
      scale("tgt_2", "target_customer", "We know the specific job our customer hires us to do."),
      scale("tgt_3", "target_customer", "We can name the personas who buy and who use the product."),
      scale("tgt_4", "target_customer", "We understand where our target customers spend their time."),
      scale("tgt_5", "target_customer", "We have validated our segment with real conversations or data."),
      scale("tgt_6", "target_customer", "We intentionally decline customers outside our target."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "problem_urgency",
    title: "Problem Urgency",
    description: "Is the problem painful and pressing enough to act on?",
    intro:
      "Great products solve urgent problems. Let's gauge how badly your customers need a fix right now.",
    category: "market",
    weight: 1.2,
    questions: [
      scale("urg_1", "problem_urgency", "The problem we solve is a top priority for our customers.", { weight: 1.5 }),
      scale("urg_2", "problem_urgency", "Customers actively search for a solution to this problem."),
      scale("urg_3", "problem_urgency", "Customers feel real pain (cost, time, risk) without us."),
      scale("urg_4", "problem_urgency", "The problem occurs frequently, not just occasionally."),
      scale("urg_5", "problem_urgency", "Customers have budget allocated to solving this problem."),
      scale("urg_6", "problem_urgency", "Doing nothing is clearly worse than adopting our product."),
      ask("urg_freq", "problem_urgency", "How often does this problem occur for your customer?", "radio", {
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "rarely", label: "Rarely / one-off" },
        ],
      }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "value_proposition",
    title: "Value Proposition",
    description: "Is the value concrete, specific and believable?",
    intro:
      "Time to pressure-test your value. We're checking whether the benefit is concrete, specific and easy to believe.",
    category: "clarity",
    weight: 1.2,
    questions: [
      ask("val_reason", "value_proposition", "Complete this sentence: 'Customers choose us because…'", "text", {
        placeholder: "…we're the only tool that…",
      }),
      scale("val_1", "value_proposition", "Our core value can be expressed as a concrete outcome.", { weight: 1.5 }),
      scale("val_2", "value_proposition", "Customers can articulate the value they get from us."),
      scale("val_3", "value_proposition", "Our value proposition is specific, not generic."),
      scale("val_4", "value_proposition", "We communicate measurable benefits (numbers, %, time saved)."),
      scale("val_5", "value_proposition", "Our value clearly outweighs the cost and effort to adopt."),
      scale("val_6", "value_proposition", "Our promise is believable and backed by proof."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "landing_conversion",
    title: "Landing Page Conversion",
    description: "Does your landing page turn attention into action?",
    intro:
      "Your landing page is your first impression. Let's see how well it turns curiosity into action.",
    category: "experience",
    weight: 0.9,
    questions: [
      ask("lan_url", "landing_conversion", "What's your landing page URL?", "url", {
        placeholder: "https://yourproduct.com",
        helpText: "We'll reference this in your report.",
      }),
      scale("lan_1", "landing_conversion", "Our hero communicates the value within 5 seconds.", { weight: 1.5 }),
      scale("lan_2", "landing_conversion", "We have a single, obvious primary call-to-action."),
      scale("lan_3", "landing_conversion", "Our landing page addresses the visitor's main objections."),
      scale("lan_4", "landing_conversion", "We show social proof above the fold or near the CTA."),
      scale("lan_5", "landing_conversion", "Our page is fast, mobile-friendly and visually clear."),
      scale("lan_6", "landing_conversion", "We measure and track our landing page conversion rate."),
      scale("lan_7", "landing_conversion", "Our copy speaks to the customer, not about ourselves."),
      ask("lan_shot", "landing_conversion", "Upload a screenshot of your hero section (optional).", "file", {
        helpText: "A picture helps us understand your first impression.",
      }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "onboarding_friction",
    title: "Onboarding Friction",
    description: "How quickly and easily do new users reach value?",
    intro:
      "First impressions continue after signup. Let's map how quickly new users reach their 'aha' moment.",
    category: "experience",
    weight: 0.9,
    questions: [
      ask("onb_ttfv", "onboarding_friction", "How long until a new user reaches first value?", "radio", {
        options: [
          { value: "under_1m", label: "Under 1 minute" },
          { value: "1_5m", label: "1–5 minutes" },
          { value: "5_30m", label: "5–30 minutes" },
          { value: "over_30m", label: "Over 30 minutes" },
          { value: "unknown", label: "Not sure yet" },
        ],
      }),
      scale("onb_1", "onboarding_friction", "New users reach first value (the aha moment) quickly.", { weight: 1.5 }),
      scale("onb_2", "onboarding_friction", "Signup asks only for the information we truly need."),
      scale("onb_3", "onboarding_friction", "We guide new users with a clear first-run experience."),
      scale("onb_4", "onboarding_friction", "Users can succeed without having to talk to our team."),
      scale("onb_5", "onboarding_friction", "We reduce setup work with templates, samples or defaults."),
      scale("onb_6", "onboarding_friction", "We measure activation and know where users drop off."),
      ask("onb_shot", "onboarding_friction", "Upload a screenshot of your onboarding/first-run (optional).", "file"),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "feature_clarity",
    title: "Feature Clarity",
    description: "Do features map cleanly to outcomes without overwhelm?",
    intro:
      "Features should serve outcomes, not clutter. Let's check how clearly yours connect to value.",
    category: "clarity",
    weight: 0.8,
    questions: [
      ask("fea_core", "feature_clarity", "What's your single most important feature, and why?", "textarea", {
        placeholder: "The one feature you'd keep if you could only keep one.",
      }),
      scale("fea_1", "feature_clarity", "Our core feature set maps directly to customer outcomes.", { weight: 1.5 }),
      scale("fea_2", "feature_clarity", "Users understand what each key feature does."),
      scale("fea_3", "feature_clarity", "We avoid overwhelming users with too many features."),
      scale("fea_4", "feature_clarity", "Our most valuable feature is easy to find and use."),
      scale("fea_5", "feature_clarity", "Feature naming uses customer language, not internal jargon."),
      scale("fea_6", "feature_clarity", "We have a clear point of view on what NOT to build."),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "pricing_logic",
    title: "Pricing Logic",
    description: "Is pricing aligned with value and easy to understand?",
    intro:
      "Pricing is where value becomes revenue. Let's see how aligned and clear yours is.",
    category: "growth",
    weight: 1.0,
    questions: [
      ask("pri_model", "pricing_logic", "What's your primary pricing model?", "radio", {
        options: [
          { value: "free", label: "Free / not monetised yet" },
          { value: "freemium", label: "Freemium" },
          { value: "subscription", label: "Subscription" },
          { value: "usage", label: "Usage-based" },
          { value: "one_time", label: "One-time purchase" },
          { value: "enterprise", label: "Sales-led / enterprise" },
        ],
      }),
      scale("pri_1", "pricing_logic", "Our pricing is aligned with the value customers receive.", { weight: 1.5 }),
      scale("pri_2", "pricing_logic", "Our pricing model matches how customers get value (seats, usage, etc.)."),
      scale("pri_3", "pricing_logic", "Our tiers map to clear customer segments or needs."),
      scale("pri_4", "pricing_logic", "Our pricing is easy to understand on first read."),
      scale("pri_5", "pricing_logic", "We are confident we are neither significantly under- nor over-priced."),
      scale("pri_6", "pricing_logic", "We have tested or validated willingness to pay."),
      ask("pri_url", "pricing_logic", "Pricing page URL (optional).", "url", {
        placeholder: "https://yourproduct.com/pricing",
      }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "trust_credibility",
    title: "Trust & Credibility",
    description: "Do you give visitors enough reasons to believe you?",
    intro:
      "People buy from products they trust. Let's inventory the proof you're giving visitors.",
    category: "experience",
    weight: 0.8,
    questions: [
      scale("tru_1", "trust_credibility", "We display credible social proof (logos, testimonials, reviews).", { weight: 1.5 }),
      scale("tru_2", "trust_credibility", "We clearly communicate our security and privacy practices."),
      scale("tru_3", "trust_credibility", "Our brand looks professional and trustworthy."),
      scale("tru_4", "trust_credibility", "We are transparent about pricing, terms and limitations."),
      scale("tru_5", "trust_credibility", "We provide responsive, visible support options."),
      scale("tru_6", "trust_credibility", "We back claims with proof (case studies, metrics, guarantees)."),
      ask("tru_elements", "trust_credibility", "Which trust elements do you currently have on your site?", "checkbox", {
        helpText: "Tick all that apply.",
        options: [
          { value: "testimonials", label: "Testimonials" },
          { value: "customer_logos", label: "Customer logos" },
          { value: "case_studies", label: "Case studies" },
          { value: "security_page", label: "Security / privacy page" },
          { value: "reviews", label: "Third-party reviews" },
          { value: "guarantee", label: "Money-back guarantee" },
        ],
      }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "retention_potential",
    title: "Retention Potential",
    description: "Will customers keep coming back and stay?",
    intro:
      "Acquisition is nothing without retention. Let's look at whether customers stick around.",
    category: "growth",
    weight: 1.1,
    questions: [
      scale("ret_1", "retention_potential", "Customers return to the product regularly.", { weight: 1.5 }),
      scale("ret_2", "retention_potential", "The product becomes more valuable the more it is used."),
      scale("ret_3", "retention_potential", "We have habit or workflow lock-in (data, integrations, routine)."),
      scale("ret_4", "retention_potential", "Our churn is low or steadily improving."),
      scale("ret_5", "retention_potential", "We actively measure retention cohorts."),
      scale("ret_6", "retention_potential", "Customers would be very disappointed if we disappeared.", { weight: 1.5 }),
      ask("ret_w4", "retention_potential", "What does your week-4 retention look like?", "radio", {
        options: [
          { value: "strong", label: "Strong (most users return)" },
          { value: "moderate", label: "Moderate" },
          { value: "weak", label: "Weak (heavy churn)" },
          { value: "unknown", label: "Not measured yet" },
        ],
      }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "gtm_readiness",
    title: "GTM Readiness",
    description: "Can you reach and convert customers repeatably?",
    intro:
      "Let's assess whether you can reach customers repeatably and predictably — the engine of growth.",
    category: "growth",
    weight: 0.9,
    questions: [
      scale("gtm_1", "gtm_readiness", "We have at least one repeatable acquisition channel.", { weight: 1.5 }),
      scale("gtm_2", "gtm_readiness", "We know our approximate customer acquisition cost."),
      scale("gtm_3", "gtm_readiness", "We have a clear, documented go-to-market motion."),
      scale("gtm_4", "gtm_readiness", "Our messaging is tailored per channel and segment."),
      scale("gtm_5", "gtm_readiness", "We can predictably generate new qualified leads."),
      scale("gtm_6", "gtm_readiness", "We have the assets and collateral needed to sell."),
      ask("gtm_channels", "gtm_readiness", "Which acquisition channels are currently working for you?", "checkbox", {
        helpText: "Tick all that apply.",
        options: [
          { value: "seo", label: "SEO / organic search" },
          { value: "content", label: "Content / blog" },
          { value: "paid_ads", label: "Paid ads" },
          { value: "social", label: "Social media" },
          { value: "referrals", label: "Referrals / word of mouth" },
          { value: "outbound", label: "Outbound / sales" },
          { value: "communities", label: "Communities" },
          { value: "partnerships", label: "Partnerships" },
        ],
      }),
    ],
  },
  // -------------------------------------------------------------------------
  {
    id: "pmf_signals",
    title: "Product-Market Fit Signals",
    description: "Is the market pulling the product out of your hands?",
    intro:
      "Finally, the big one: is the market pulling? Let's read your product-market fit signals.",
    category: "market",
    weight: 1.4,
    questions: [
      scale("pmf_1", "pmf_signals", "We have strong organic growth or word of mouth.", { weight: 1.5 }),
      scale("pmf_2", "pmf_signals", "Usage and engagement grow without heavy spend."),
      scale("pmf_3", "pmf_signals", "Customers refer others to the product."),
      scale("pmf_4", "pmf_signals", "We have a core of highly engaged, retained users.", { weight: 1.5 }),
      scale("pmf_5", "pmf_signals", "Demand is outpacing our ability to serve it."),
      scale("pmf_6", "pmf_signals", "Quantitative signals (retention, NPS, growth) indicate fit."),
      ask("pmf_signal", "pmf_signals", "What's your strongest signal of product-market fit so far?", "textarea", {
        helpText:
          "e.g. a retention curve that flattens, organic referrals, or users who'd be 'very disappointed' without you.",
      }),
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

export function requiredQuestionsForDimension(
  id: DimensionId,
): DiagnosticQuestion[] {
  return getDimension(id).questions.filter((q) => q.required);
}

export function dimensionsForCategory(id: CategoryId): Dimension[] {
  return DIMENSIONS.filter((d) => d.category === id);
}
