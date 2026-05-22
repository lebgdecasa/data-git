import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  isSupabaseConfigured,
  SUPABASE_SETUP_MESSAGE,
} from "@/lib/supabase/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col app-gradient">
      <div className="container flex h-16 items-center">
        <Logo />
      </div>
      {!configured && (
        <div className="container">
          <div className="mx-auto flex max-w-md items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>{SUPABASE_SETUP_MESSAGE}</span>
          </div>
        </div>
      )}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
