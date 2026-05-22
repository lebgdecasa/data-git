"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DIMENSIONS,
  LIKERT_SCALE,
  questionsForDimension,
  TOTAL_QUESTION_COUNT,
} from "@/lib/audit/auditQuestions";
import type { DiagnosticQuestion } from "@/lib/audit/auditTypes";
import { AttachmentsEditor } from "@/components/audit/attachments-editor";
import type { Audit, AuditAnswers, AuditAttachment } from "@/lib/types";

const TOTAL_STEPS = DIMENSIONS.length + 1; // dimensions + attachments step

export function Questionnaire({
  audit,
  userId,
}: {
  audit: Audit;
  userId: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AuditAnswers>(audit.answers ?? {});
  const [attachments, setAttachments] = useState<AuditAttachment[]>(
    audit.attachments ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isAttachmentsStep = step === DIMENSIONS.length;
  const dimension = DIMENSIONS[step];
  const progress = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => (v ?? "").trim()).length,
    [answers],
  );

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function dimensionComplete(dimensionId: (typeof DIMENSIONS)[number]["id"]) {
    return questionsForDimension(dimensionId).every((q) =>
      (answers[q.id] ?? "").trim(),
    );
  }

  async function persist(extra?: Partial<Audit>) {
    const res = await fetch(`/api/audits/${audit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, attachments, ...extra }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to save.");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await persist();
      toast.success("Progress saved");
    } catch (err) {
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await persist();
      const res = await fetch(`/api/audits/${audit.id}/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate report.");
      toast.success("Audit generated");
      router.push(`/audits/${audit.id}/results`);
      router.refresh();
    } catch (err) {
      toast.error("Generation failed", {
        description: err instanceof Error ? err.message : undefined,
      });
      setGenerating(false);
    }
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Step rail */}
      <aside className="hidden lg:block">
        <ol className="space-y-1">
          {DIMENSIONS.map((d, i) => {
            const done = dimensionComplete(d.id);
            return (
              <li key={d.id}>
                <button
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    step === i
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
                      done && "border-success bg-success text-white",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {d.title}
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setStep(DIMENSIONS.length)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isAttachmentsStep
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
                {DIMENSIONS.length + 1}
              </span>
              Links & screenshots
            </button>
          </li>
        </ol>
      </aside>

      <div>
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span>
              {answeredCount}/{TOTAL_QUESTION_COUNT} answered
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          {isAttachmentsStep ? (
            <>
              <CardHeader>
                <CardTitle>Links & screenshots</CardTitle>
                <CardDescription>
                  Add your landing page, pricing page or onboarding screenshots
                  to enrich the audit. Optional but recommended.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttachmentsEditor
                  auditId={audit.id}
                  userId={userId}
                  attachments={attachments}
                  onChange={setAttachments}
                />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>{dimension.title}</CardTitle>
                <CardDescription>{dimension.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Rate how much you agree with each statement.
                </p>
                {questionsForDimension(dimension.id).map((q) => (
                  <QuestionField
                    key={q.id}
                    question={q}
                    value={answers[q.id] ?? ""}
                    onChange={(v) => setAnswer(q.id, v)}
                  />
                ))}
              </CardContent>
            </>
          )}
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
            {isAttachmentsStep ? (
              <Button
                variant="gradient"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate audit
              </Button>
            ) : (
              <Button variant="gradient" onClick={next}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: DiagnosticQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={question.id}>{question.text}</Label>
      {question.helpText && (
        <p className="text-xs text-muted-foreground">{question.helpText}</p>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={question.id}>
          <SelectValue placeholder="Select a rating" />
        </SelectTrigger>
        <SelectContent>
          {LIKERT_SCALE.map((point) => (
            <SelectItem key={point.value} value={String(point.value)}>
              {point.value} — {point.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
