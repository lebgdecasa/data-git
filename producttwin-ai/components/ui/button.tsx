"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-[1px]",
        secondary:
          "glass glass-hover text-white",
        outline:
          "border border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:border-white/20",
        ghost:
          "text-zinc-400 hover:bg-white/[0.05] hover:text-white",
        destructive:
          "bg-rose-600 text-white shadow-md shadow-rose-500/25 hover:bg-rose-500 hover:shadow-rose-500/40",
        link:
          "text-indigo-300 underline-offset-4 hover:underline hover:text-indigo-200",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8  rounded-lg px-3 text-xs",
        lg:      "h-12 rounded-xl px-7 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
