"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { INDUSTRY_OPTIONS, STAGE_OPTIONS } from "@/lib/audit-config";
import type { BusinessProfile } from "@/lib/types";

export function NewAuditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    productName: "",
    website: "",
    industry: "",
    stage: "",
    targetAudience: "",
    primaryGoal: "",
    description: "",
  });

  function update<K extends keyof BusinessProfile>(
    key: K,
    value: BusinessProfile[K],
  ) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.productName.trim()) {
      toast.error("Product name is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create audit.");
      router.push(`/audits/${data.audit.id}/questionnaire`);
    } catch (err) {
      toast.error("Could not create audit", {
        description: err instanceof Error ? err.message : undefined,
      });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="productName">Product name *</Label>
            <Input
              id="productName"
              placeholder="e.g. Acme Analytics"
              value={profile.productName}
              onChange={(e) => update("productName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://acme.com"
              value={profile.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Select
              value={profile.industry}
              onValueChange={(v) => update("industry", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stage</Label>
            <Select
              value={profile.stage}
              onValueChange={(v) => update("stage", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g. B2B SaaS founders"
              value={profile.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="primaryGoal">Primary goal of this audit</Label>
            <Input
              id="primaryGoal"
              placeholder="e.g. Improve signup-to-activation conversion"
              value={profile.primaryGoal}
              onChange={(e) => update("primaryGoal", e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              placeholder="What does your product do and who is it for?"
              value={profile.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button type="submit" variant="gradient" size="lg" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Continue to questionnaire
        </Button>
      </div>
    </form>
  );
}
