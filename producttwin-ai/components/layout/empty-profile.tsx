"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, ArrowRight, FileText } from "lucide-react";
import { useProfileStore } from "@/lib/profile-store";

/**
 * Renders when a page is reached without a saved product profile.
 * Replaces fake mock data with a clear, single-action redirect.
 */
export function EmptyProfile({
  pageLabel,
  pageDescription,
}: {
  pageLabel: string;
  pageDescription: string;
}) {
  const loadDemo = useProfileStore((s) => s.loadDemo);

  return (
    <Card className="glass-elevated">
      <CardContent className="p-8 md:p-12">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center mx-auto mb-5">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <p className="eyebrow text-indigo-300 mb-2">{pageLabel}</p>
          <h2 className="text-xl font-semibold text-white mb-2">No product loaded yet</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {pageDescription} Start by entering your product data in Business Profile,
            or load the NutriFlow demo to explore.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/audit">
              <Button size="lg">
                Start with Business Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={loadDemo}>
              <Database className="h-4 w-4" />
              Load NutriFlow Demo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
