import Link from "next/link";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
        <Gauge className="h-5 w-5" />
      </span>
      {showText && (
        <span className="text-base font-semibold tracking-tight">
          Product Audit <span className="text-primary">Studio</span>
        </span>
      )}
    </Link>
  );
}
