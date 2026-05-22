"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  Compass,
  ImageIcon,
  Loader2,
  PauseCircle,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ALL_QUESTIONS,
  DIMENSIONS,
  LIKERT_SCALE,
  questionsForDimension,
  requiredQuestionsForDimension,
  TOTAL_QUESTION_COUNT,
} from "@/lib/audit/auditQuestions";
import type { DiagnosticQuestion, DimensionId } from "@/lib/audit/auditTypes";
import { AttachmentsEditor } from "@/components/audit/attachments-editor";
import type { Audit, AuditAnswers, AuditAttachment } from "@/lib/types";

const TOTAL_STEPS = DIMENSIONS.length + 1; // dimensions + attachments step
const AUTOSAVE_DELAY = 1200;

type AnswerValue = string | string[] | undefined;
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function isAnswered(value: AnswerValue): boolean {
  if (value === undefined || value === null) return false;
  return Array.isArray(value) ? value.length > 0 : value.trim().length > 0;
}

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [generating, setGenerating] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Refs hold the latest values so the debounced save always sends fresh data.
  const answersRef = useRef(answers);
  const attachmentsRef = useRef(attachments);
  answersRef.current = answers;
  attachmentsRef.current = attachments;
  const mountedRef = useRef(false);

  const isAttachmentsStep = step === DIMENSIONS.length;
  const dimension = DIMENSIONS[step];

  const answeredCount = useMemo(
    () => ALL_QUESTIONS.filter((q) => isAnswered(answers[q.id])).length,
    [answers],
  );
  const completion = Math.round((answeredCount / TOTAL_QUESTION_COUNT) * 100);

  // --- persistence ---------------------------------------------------------
  const persist = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/audits/${audit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersRef.current,
          attachments: attachmentsRef.current,
          status: "in_progress",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save.");
      }
      setSaveState("saved");
      return true;
    } catch {
      setSaveState("error");
      return false;
    }
  }, [audit.id]);

  // Debounced auto-save on every change.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setSaveState("dirty");
    const t = setTimeout(() => void persist(), AUTOSAVE_DELAY);
    return () => clearTimeout(t);
  }, [answers, attachments, persist]);

  // --- answer helpers ------------------------------------------------------
  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function toggleCheckbox(id: string, optionValue: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      return { ...prev, [id]: next };
    });
  }

  function dimensionComplete(id: DimensionId) {
    return requiredQuestionsForDimension(id).every((q) =>
      isAnswered(answers[q.id]),
    );
  }

  function missingRequired(id: DimensionId): DiagnosticQuestion[] {
    return requiredQuestionsForDimension(id).filter(
      (q) => !isAnswered(answers[q.id]),
    );
  }

  // --- navigation ----------------------------------------------------------
  function validateAndAdvance() {
    if (isAttachmentsStep) return;
    const missing = missingRequired(dimension.id);
    if (missing.length > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        missing.forEach((q) => (next[q.id] = "This question is required."));
        return next;
      });
      toast.error("A few required questions are left", {
        description: "Please rate every statement in this section to continue.",
      });
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSaveAndExit() {
    setExiting(true);
    await persist();
    toast.success("Draft saved", {
      description: "Pick up right where you left off, anytime.",
    });
    router.push("/dashboard");
  }

  async function handleGenerate() {
    // Validate every dimension before generating.
    const firstIncomplete = DIMENSIONS.find((d) => !dimensionComplete(d.id));
    if (firstIncomplete) {
      const idx = DIMENSIONS.findIndex((d) => d.id === firstIncomplete.id);
      const missing = missingRequired(firstIncomplete.id);
      setErrors((prev) => {
        const next = { ...prev };
        missing.forEach((q) => (next[q.id] = "This question is required."));
        return next;
      });
      setStep(idx);
      toast.error("Almost there", {
        description: `Please finish the "${firstIncomplete.title}" section first.`,
      });
      return;
    }

    setGenerating(true);
    try {
      const saved = await persist();
      if (!saved) throw new Error("Could not save your answers.");
      const res = await fetch(`/api/audits/${audit.id}/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate report.");
      toast.success("Your audit is ready");
      router.push(`/audits/${audit.id}/results`);
      router.refresh();
    } catch (err) {
      toast.error("Generation failed", {
        description: err instanceof Error ? err.message : undefined,
      });
      setGenerating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Step rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-3xl font-bold tracking-tight">{completion}%</p>
            <p className="text-xs text-muted-foreground">
              {answeredCount} of {TOTAL_QUESTION_COUNT} questions answered
            </p>
            <Progress value={completion} className="mt-3" />
          </div>
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
        </div>
      </aside>

      <div>
        {/* Progress + autosave status */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {step + 1} of {TOTAL_STEPS} · {completion}% complete
            </span>
            <SaveIndicator state={saveState} />
          </div>
          <Progress value={completion} className="lg:hidden" />
        </div>

        {/* Friendly guide banner */}
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-accent/60 p-4">
          <Compass className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Answer honestly — there are no wrong answers. We save your draft
            automatically, so you can pause and pick up anytime.
          </p>
        </div>

        <Card>
          {isAttachmentsStep ? (
            <>
              <CardHeader>
                <CardTitle>Links &amp; screenshots</CardTitle>
                <CardDescription>
                  Last step — add your landing page, pricing page or onboarding
                  screenshots so your report has real context. Totally optional.
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
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Section {step + 1} of {DIMENSIONS.length}
                </p>
                <CardTitle>{dimension.title}</CardTitle>
                <CardDescription>{dimension.intro}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {questionsForDimension(dimension.id).map((q) => (
                  <QuestionField
                    key={q.id}
                    question={q}
                    value={answers[q.id]}
                    error={errors[q.id]}
                    auditId={audit.id}
                    userId={userId}
                    onChange={(v) => setAnswer(q.id, v)}
                    onToggle={(opt) => toggleCheckbox(q.id, opt)}
                  />
                ))}
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer navigation */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSaveAndExit}
              disabled={exiting}
            >
              {exiting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PauseCircle className="h-4 w-4" />
              )}
              Save &amp; exit
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
              <Button variant="gradient" onClick={validateAndAdvance}>
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

// ---------------------------------------------------------------------------
// Save indicator
// ---------------------------------------------------------------------------
function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return <span />;
  const map = {
    dirty: { icon: Cloud, text: "Unsaved changes", className: "text-muted-foreground" },
    saving: { icon: Loader2, text: "Saving…", className: "text-muted-foreground" },
    saved: { icon: CheckCircle2, text: "Draft saved", className: "text-success" },
    error: { icon: AlertCircle, text: "Couldn't save", className: "text-destructive" },
  } as const;
  const { icon: Icon, text, className } = map[state];
  return (
    <span className={cn("flex items-center gap-1.5 text-xs", className)}>
      <Icon className={cn("h-3.5 w-3.5", state === "saving" && "animate-spin")} />
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Question field (renders every supported type)
// ---------------------------------------------------------------------------
function QuestionField({
  question,
  value,
  error,
  auditId,
  userId,
  onChange,
  onToggle,
}: {
  question: DiagnosticQuestion;
  value: AnswerValue;
  error?: string;
  auditId: string;
  userId: string;
  onChange: (value: string | string[]) => void;
  onToggle: (optionValue: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="leading-snug">
        {question.text}
        {question.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {question.helpText && (
        <p className="text-xs text-muted-foreground">{question.helpText}</p>
      )}

      {question.type === "scale" && (
        <ScaleSlider value={value as string | undefined} onChange={onChange} />
      )}

      {(question.type === "text" || question.type === "url") && (
        <Input
          id={question.id}
          type={question.type === "url" ? "url" : "text"}
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "textarea" && (
        <Textarea
          id={question.id}
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "radio" && (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={onChange}
          className="gap-2"
        >
          {question.options?.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`${question.id}-${opt.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-accent"
            >
              <RadioGroupItem
                id={`${question.id}-${opt.value}`}
                value={opt.value}
              />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      )}

      {question.type === "checkbox" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options?.map((opt) => {
            const checked =
              Array.isArray(value) && value.includes(opt.value);
            return (
              <Label
                key={opt.value}
                htmlFor={`${question.id}-${opt.value}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-accent"
              >
                <Checkbox
                  id={`${question.id}-${opt.value}`}
                  checked={checked}
                  onCheckedChange={() => onToggle(opt.value)}
                />
                {opt.label}
              </Label>
            );
          })}
        </div>
      )}

      {question.type === "file" && (
        <FileUploadField
          questionId={question.id}
          auditId={auditId}
          userId={userId}
          value={value as string | undefined}
          onChange={onChange}
        />
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scale slider (1-5)
// ---------------------------------------------------------------------------
function ScaleSlider({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const answered = value !== undefined && value !== "";
  const [display, setDisplay] = useState(answered ? Number(value) : 3);

  useEffect(() => {
    if (answered) setDisplay(Number(value));
  }, [value, answered]);

  const point = LIKERT_SCALE.find((p) => p.value === display);

  return (
    <div className="pt-1">
      <Slider
        min={1}
        max={5}
        step={1}
        value={[display]}
        onValueChange={([v]) => setDisplay(v)}
        onValueCommit={([v]) => onChange(String(v))}
        className={cn(!answered && "opacity-70")}
        aria-label="Rate from 1 to 5"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {LIKERT_SCALE.map((p) => (
          <span key={p.value}>{p.value}</span>
        ))}
      </div>
      <p className="mt-1.5 text-sm font-medium">
        {answered ? (
          <>
            Your rating: {display} —{" "}
            <span className="text-primary">{point?.label}</span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Drag the slider to rate (1 = strongly disagree, 5 = strongly agree)
          </span>
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File upload (Supabase storage)
// ---------------------------------------------------------------------------
function FileUploadField({
  questionId,
  auditId,
  userId,
  value,
  onChange,
}: {
  questionId: string;
  auditId: string;
  userId: string;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filename = value ? value.split("/").pop() : null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${userId}/${auditId}/${questionId}-${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("audit-uploads")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      onChange(path);
      toast.success("Screenshot uploaded");
    } catch (err) {
      toast.error("Upload failed", {
        description:
          err instanceof Error
            ? err.message
            : "Check that Supabase storage is configured.",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      {filename ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2.5 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">{filename}</span>
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload screenshot
        </Button>
      )}
    </div>
  );
}
