import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-500/15 text-indigo-200 border-indigo-500/20",
        secondary:
          "border-transparent bg-white/[0.05] text-foreground border-white/10",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/15 text-amber-300 border-amber-500/20",
        destructive:
          "border-transparent bg-rose-500/15 text-rose-300 border-rose-500/20",
        info: "border-transparent bg-sky-500/15 text-sky-300 border-sky-500/20",
        outline: "text-foreground border-white/10",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
