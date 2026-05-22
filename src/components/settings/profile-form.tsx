"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, type ProfileResult } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      Save changes
    </Button>
  );
}

export function ProfileForm({
  fullName,
  company,
}: {
  fullName: string;
  company: string;
}) {
  const [state, formAction] = useFormState<ProfileResult, FormData>(
    updateProfile,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) toast.success("Profile updated");
    else if (state.error) toast.error("Update failed", { description: state.error });
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" defaultValue={company} />
      </div>
      <SubmitButton />
    </form>
  );
}
