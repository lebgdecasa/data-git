import { Suspense } from "react";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Start auditing your product in minutes — no credit card required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </CardContent>
    </Card>
  );
}
