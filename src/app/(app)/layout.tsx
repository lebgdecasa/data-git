import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { UserMenu } from "@/components/app/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
        <Logo href="/dashboard" />
        <div className="flex items-center gap-3">
          <Button variant="gradient" size="sm" asChild className="hidden sm:flex">
            <Link href="/audits/new">
              <PlusCircle className="h-4 w-4" />
              New audit
            </Link>
          </Button>
          <UserMenu email={user.email ?? ""} fullName={fullName} />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r md:block">
          <SidebarNav />
        </aside>

        {/* Main */}
        <main className="flex-1 bg-muted/30">
          <div className="container max-w-6xl py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
