import {
  type DimensionId,
  type DimensionResult,
  type DimensionScore,
  type MaturityStage,
  type Priority,
  type RagStatus,
} from "@/lib/audit/auditTypes";
import { getDimension } from "@/lib/audit/auditQuestions";

/**
 * Deterministic recommendation engine.
 *
 * Given the numeric score for a dimension, it produces a human explanation,
 * concrete recommendations, suggested next actions and a priority level.
 * All copy is authored per dimension and per RAG band, so the same inputs
 * always yield the same guidance (the AI layer can later override this).
 */

interface BandContent {
  explanation: string;
  recommendations: string[];
  nextActions: string[];
}

type DimensionContent = Record<RagStatus, BandContent>;

/** Dimensions weighted at or above this are treated as high-leverage. */
const HIGH_LEVERAGE_WEIGHT = 1.1;

/** Priority is a function of health (status) and importance (weight). */
export function priorityFor(status: RagStatus, weight: number): Priority {
  const highLeverage = weight >= HIGH_LEVERAGE_WEIGHT;
  if (status === "green") return "low";
  if (status === "yellow") return highLeverage ? "high" : "medium";
  return highLeverage ? "critical" : "high"; // red
}

const CONTENT: Record<DimensionId, DimensionContent> = {
  positioning_clarity: {
    red: {
      explanation:
        "People can't quickly tell what you are or who you're for. Unclear positioning leaks attention at the top of every funnel.",
      recommendations: [
        "Write a one-sentence positioning statement: 'For [audience] who [need], we are the [category] that [differentiator].'",
        "Lead with the outcome you create, not the mechanism behind it.",
        "Audit your homepage, app and ads for a single, consistent message.",
      ],
      nextActions: [
        "Draft 3 positioning statements and test them with 5 target customers.",
        "Rewrite your hero headline around the clearest one.",
      ],
    },
    yellow: {
      explanation:
        "Your positioning is understandable but not yet sharp or differentiated enough to be memorable.",
      recommendations: [
        "Sharpen your category and the one thing that makes you different.",
        "Remove competing or hedging messages that dilute the core claim.",
      ],
      nextActions: [
        "A/B test a sharper headline against your current one.",
        "Align the team on a single positioning sentence.",
      ],
    },
    green: {
      explanation:
        "Your positioning is clear and consistent — a real asset. Protect it as you add features and channels.",
      recommendations: [
        "Document your positioning so it stays consistent as the team grows.",
      ],
      nextActions: ["Reuse the positioning statement across all new assets."],
    },
  },
  target_customer: {
    red: {
      explanation:
        "Without a precise target customer, messaging, product and pricing all blur. You're likely trying to serve everyone.",
      recommendations: [
        "Pick one primary segment and define the exact job they hire you for.",
        "Name the buyer and user personas explicitly.",
        "Decide who you will deliberately not serve.",
      ],
      nextActions: [
        "Interview 5 of your best-fit customers this week.",
        "Write a one-page ideal customer profile (ICP).",
      ],
    },
    yellow: {
      explanation:
        "You have a sense of your customer but it isn't validated or specific enough to drive sharp decisions.",
      recommendations: [
        "Validate your segment assumptions with real conversations or data.",
        "Tighten the ICP to the segment that gets the most value fastest.",
      ],
      nextActions: [
        "Segment current users by engagement to find your best-fit profile.",
      ],
    },
    green: {
      explanation:
        "You know who you serve and say no to the rest — that focus compounds across the whole product.",
      recommendations: ["Keep the ICP current as you learn from new cohorts."],
      nextActions: ["Review the ICP quarterly against actual best customers."],
    },
  },
  problem_urgency: {
    red: {
      explanation:
        "The problem may be real but it isn't urgent. Low-urgency problems lead to slow sales cycles and weak retention.",
      recommendations: [
        "Quantify the cost of the problem (time, money, risk) for your customer.",
        "Target situations or triggers where the pain is most acute.",
        "Reframe the problem around a consequence customers already care about.",
      ],
      nextActions: [
        "List the trigger events that make the problem urgent and target them.",
      ],
    },
    yellow: {
      explanation:
        "The problem matters but competes with other priorities. You need to make the pain unavoidable.",
      recommendations: [
        "Tie your value to a metric your customer is already measured on.",
        "Find the segment where the problem is most painful and lead there.",
      ],
      nextActions: ["Interview churned/lost deals to learn what wasn't urgent."],
    },
    green: {
      explanation:
        "You're solving a burning problem — the strongest possible foundation for growth.",
      recommendations: ["Double down on the segments where urgency is highest."],
      nextActions: ["Capture urgency language from customers for your copy."],
    },
  },
  value_proposition: {
    red: {
      explanation:
        "Your value is generic or hard to believe. Customers can't see why you're worth the switch.",
      recommendations: [
        "Express value as a concrete, measurable outcome (e.g. 'cut X by 40%').",
        "Replace adjectives with proof: numbers, examples, before/after.",
        "Make sure the value clearly outweighs the cost and effort to adopt.",
      ],
      nextActions: [
        "Collect 3 quantified customer outcomes and feature them prominently.",
      ],
    },
    yellow: {
      explanation:
        "Your value proposition is reasonable but not specific or proven enough to be compelling.",
      recommendations: [
        "Add measurable benefits and proof points to your core claim.",
        "Test outcome-led messaging against feature-led messaging.",
      ],
      nextActions: ["Add a quantified result to your hero section."],
    },
    green: {
      explanation:
        "Your value is concrete, specific and credible — customers get it and believe it.",
      recommendations: ["Keep refreshing proof points as you gather results."],
      nextActions: ["Turn new customer wins into fresh proof in your messaging."],
    },
  },
  landing_conversion: {
    red: {
      explanation:
        "Your landing page isn't converting attention into action. Visitors don't get it fast enough or don't know what to do.",
      recommendations: [
        "Make the hero communicate value in under 5 seconds.",
        "Use a single, obvious primary CTA and remove competing links.",
        "Add social proof near the CTA and address the top objection.",
      ],
      nextActions: [
        "Instrument conversion tracking, then rewrite the hero and CTA.",
      ],
    },
    yellow: {
      explanation:
        "Your page works but leaves conversion on the table — clarity, proof or focus can improve.",
      recommendations: [
        "Tighten copy to speak to the customer, not about yourself.",
        "Add objection-handling and proof above the fold.",
      ],
      nextActions: ["Run an A/B test on the hero headline and CTA."],
    },
    green: {
      explanation:
        "Your landing page is clear and persuasive. Keep testing to compound conversion.",
      recommendations: ["Maintain a steady experimentation cadence."],
      nextActions: ["Test one high-impact element each cycle."],
    },
  },
  onboarding_friction: {
    red: {
      explanation:
        "New users hit friction before reaching value. High early friction kills activation and retention.",
      recommendations: [
        "Map the path to first value and cut every non-essential step.",
        "Pre-fill data, add templates and provide a guided first run.",
        "Let users succeed without needing to contact your team.",
      ],
      nextActions: [
        "Measure time-to-first-value and remove the biggest blocker.",
      ],
    },
    yellow: {
      explanation:
        "Onboarding is functional but slower or rougher than it should be in places.",
      recommendations: [
        "Add an activation checklist and sample data.",
        "Instrument activation to find where users stall.",
      ],
      nextActions: ["Define your activation metric and track drop-off."],
    },
    green: {
      explanation:
        "Users reach value quickly and independently — a strong activation engine.",
      recommendations: ["Keep watching activation as you add features."],
      nextActions: ["Protect time-to-value when shipping new flows."],
    },
  },
  feature_clarity: {
    red: {
      explanation:
        "Your feature set is confusing or bloated. Users can't connect features to the outcomes they want.",
      recommendations: [
        "Map each core feature to a specific customer outcome.",
        "Hide or remove low-value features that add cognitive load.",
        "Rename features in customer language, not internal jargon.",
      ],
      nextActions: ["Run a feature audit: keep, cut or rename each one."],
    },
    yellow: {
      explanation:
        "Features are mostly clear but some overwhelm or aren't obviously valuable.",
      recommendations: [
        "Surface your most valuable feature more prominently.",
        "Simplify navigation around the core job-to-be-done.",
      ],
      nextActions: ["Reorder the UI around the primary outcome."],
    },
    green: {
      explanation:
        "Your features map cleanly to outcomes without overwhelming users.",
      recommendations: ["Maintain a strong point of view on what not to build."],
      nextActions: ["Pressure-test new features against the core outcome."],
    },
  },
  pricing_logic: {
    red: {
      explanation:
        "Pricing isn't aligned with value or is hard to understand, leaving money and conversions on the table.",
      recommendations: [
        "Align your price metric with how customers actually get value.",
        "Simplify tiers so each maps to a clear segment or need.",
        "Validate willingness to pay with interviews or experiments.",
      ],
      nextActions: ["Run willingness-to-pay interviews with 5 target customers."],
    },
    yellow: {
      explanation:
        "Pricing is workable but not clearly optimised for value capture or clarity.",
      recommendations: [
        "Test a value-metric-aligned tier against current packaging.",
        "Clarify what each tier is for at a glance.",
      ],
      nextActions: ["A/B test pricing page layout and tier framing."],
    },
    green: {
      explanation:
        "Pricing is clear and value-aligned — you're capturing value without friction.",
      recommendations: ["Revisit pricing as you add value or new segments."],
      nextActions: ["Review price vs value annually."],
    },
  },
  trust_credibility: {
    red: {
      explanation:
        "Visitors lack reasons to believe you. Missing proof and trust signals stall conversion, especially for new brands.",
      recommendations: [
        "Add social proof: logos, testimonials, reviews and case studies.",
        "Communicate security, privacy and transparent terms clearly.",
        "Make support visible and responsive.",
      ],
      nextActions: ["Collect and publish 3 customer testimonials this month."],
    },
    yellow: {
      explanation:
        "You have some credibility signals but not enough to fully reassure a skeptical visitor.",
      recommendations: [
        "Strengthen proof with quantified case studies or guarantees.",
        "Make trust signals visible at decision points.",
      ],
      nextActions: ["Place proof near every primary CTA."],
    },
    green: {
      explanation:
        "You convey strong credibility — visitors have clear reasons to trust you.",
      recommendations: ["Keep proof fresh and relevant to each segment."],
      nextActions: ["Refresh testimonials and metrics regularly."],
    },
  },
  retention_potential: {
    red: {
      explanation:
        "Customers aren't sticking. Weak retention undermines growth no matter how good acquisition is.",
      recommendations: [
        "Identify the core habit or workflow that drives repeat use.",
        "Build stickiness via data, integrations or recurring value.",
        "Measure retention cohorts to see where users fall off.",
      ],
      nextActions: ["Set up cohort retention tracking and review weekly."],
    },
    yellow: {
      explanation:
        "Retention is moderate. There's a returning core but meaningful churn remains.",
      recommendations: [
        "Deepen value for engaged users to increase stickiness.",
        "Target the churn drivers in your weakest cohorts.",
      ],
      nextActions: ["Interview recently churned users to find the cause."],
    },
    green: {
      explanation:
        "Customers return and stay — strong retention is the engine of durable growth.",
      recommendations: ["Expand value to lift retention even further."],
      nextActions: ["Productise what makes power users stick."],
    },
  },
  gtm_readiness: {
    red: {
      explanation:
        "You don't yet have a repeatable way to reach and convert customers, so growth is unpredictable.",
      recommendations: [
        "Find and double down on one repeatable acquisition channel.",
        "Document your go-to-market motion end to end.",
        "Track approximate CAC so you can judge channel viability.",
      ],
      nextActions: ["Pick one channel and run a focused 30-day experiment."],
    },
    yellow: {
      explanation:
        "You have early GTM traction but it isn't yet predictable or well-instrumented.",
      recommendations: [
        "Tailor messaging per channel and segment.",
        "Build the sales/marketing assets you're missing.",
      ],
      nextActions: ["Define your funnel stages and measure conversion at each."],
    },
    green: {
      explanation:
        "You can reach and convert customers repeatably — a strong base to scale spend.",
      recommendations: ["Layer in a second channel once the first is solid."],
      nextActions: ["Stress-test CAC as you increase volume."],
    },
  },
  pmf_signals: {
    red: {
      explanation:
        "There are few signs the market is pulling. Without PMF signals, scaling spend will amplify the wrong things.",
      recommendations: [
        "Focus on a narrow segment until you see strong retention and pull.",
        "Talk to your most engaged users and build more of what they love.",
        "Track leading indicators: retention, referrals and organic growth.",
      ],
      nextActions: [
        "Run the 'how disappointed would you be without us?' survey.",
      ],
    },
    yellow: {
      explanation:
        "You see early signals of fit but they aren't strong or consistent yet.",
      recommendations: [
        "Concentrate on the cohort showing the strongest engagement.",
        "Remove friction that blocks your best users from growing.",
      ],
      nextActions: ["Identify and nurture your most retained cohort."],
    },
    green: {
      explanation:
        "The market is pulling — strong PMF signals mean it's time to pour fuel on growth.",
      recommendations: ["Shift focus from finding fit to scaling it."],
      nextActions: ["Invest in your best-performing acquisition channels."],
    },
  },
};

/** Enrich a numeric dimension score with qualitative guidance. */
export function enrichDimension(score: DimensionScore): DimensionResult {
  const dimension = getDimension(score.id);
  const band = CONTENT[score.id][score.status];
  return {
    ...score,
    title: dimension.title,
    category: dimension.category,
    priority: priorityFor(score.status, score.weight),
    explanation: band.explanation,
    recommendations: band.recommendations,
    nextActions: band.nextActions,
  };
}

const MATURITY_SUMMARY: Record<MaturityStage, string> = {
  Confused:
    "The fundamentals aren't aligned yet. Focus on clarity: who you serve, the urgent problem, and a sharp value proposition before scaling anything.",
  "Early Validation":
    "You have the beginnings of a story but it needs validation. Tighten positioning and prove the problem is urgent for a specific customer.",
  Promising:
    "The core is taking shape with real strengths. Close the highest-priority gaps to convert promise into repeatable traction.",
  "Growth Ready":
    "Most fundamentals are solid. Optimise conversion, retention and go-to-market to grow predictably.",
  "Scale Ready":
    "Strong across the board with clear product-market fit signals. Pour fuel on what's working and scale your growth engine.",
};

export function maturitySummary(stage: MaturityStage): string {
  return MATURITY_SUMMARY[stage];
}

/** Build the headline + summary narrative for the overall result. */
export function buildNarrative(params: {
  productName: string;
  overallScore: number;
  stage: MaturityStage;
  topPriorities: DimensionResult[];
  strengths: DimensionResult[];
}): { headline: string; summary: string } {
  const { productName, overallScore, stage, topPriorities, strengths } = params;

  const headline =
    overallScore >= 70
      ? `${productName} is ${stage.toLowerCase()} with clear momentum`
      : overallScore >= 50
        ? `${productName} is ${stage.toLowerCase()} with high-leverage gaps to close`
        : `${productName} needs to align fundamentals before scaling`;

  const focus = topPriorities
    .slice(0, 2)
    .map((d) => d.title.toLowerCase())
    .join(" and ");

  const strengthText = strengths.length
    ? ` Your strongest areas are ${strengths
        .slice(0, 2)
        .map((d) => d.title.toLowerCase())
        .join(" and ")}.`
    : "";

  const summary = `${productName} scores ${overallScore}/100 (${stage}).${strengthText}${
    focus ? ` The biggest opportunities are ${focus} — start there.` : ""
  }`;

  return { headline, summary };
}
