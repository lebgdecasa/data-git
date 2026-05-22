import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AUDIT_DOMAINS } from "@/lib/audit-config";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col app-gradient">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center py-24 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 py-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered product audits
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Find out what&apos;s holding your{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              product back
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Audit your product, landing page, onboarding, pricing, positioning
            and conversion funnel. Get a structured report with scores, issues
            and prioritised recommendations in minutes.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/signup">
                Start your free audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Works without API keys
          </p>
        </section>

        {/* Domains / Features */}
        <section id="features" className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Six pillars, one clear score
            </h2>
            <p className="mt-3 text-muted-foreground">
              We evaluate the dimensions that actually move growth — and tell
              you exactly where to focus first.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIT_DOMAINS.map((domain) => (
              <Card key={domain.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{domain.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {domain.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              From answers to action in 3 steps
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "1. Describe your product",
                body: "Add your business context and answer a structured questionnaire across all six pillars.",
              },
              {
                icon: Zap,
                title: "2. Generate the audit",
                body: "Our engine analyses your inputs and produces scores, issues and prioritised recommendations.",
              },
              {
                icon: FileText,
                title: "3. Export & act",
                body: "Review your report, share it with your team, and export a polished PDF.",
              },
            ].map((step) => (
              <Card key={step.title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              {
                name: "Free",
                price: "$0",
                features: [
                  "1 active audit",
                  "All six pillars",
                  "Scores & recommendations",
                  "PDF export",
                ],
                cta: "Get started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$29",
                period: "/mo",
                features: [
                  "Unlimited audits",
                  "Audit history & trends",
                  "Screenshot uploads",
                  "Priority AI generation",
                ],
                cta: "Start free trial",
                highlight: true,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlight
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : ""
                }
              >
                <CardContent className="p-8">
                  {plan.highlight && (
                    <Badge className="mb-4">Most popular</Badge>
                  )}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={plan.highlight ? "gradient" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container py-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 px-8 py-16 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to audit your product?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              Join founders and product teams using Product Audit Studio to find
              their biggest growth levers.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/signup">
                Start free audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
