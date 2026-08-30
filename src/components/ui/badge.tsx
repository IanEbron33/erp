import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-all shadow-2xs select-none",
  {
    variants: {
      variant: {
        default:
          "border border-blue-400/30 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white shadow-blue-500/10",
        secondary:
          "border border-slate-200/90 bg-slate-100/90 text-slate-700",
        outline:
          "border border-slate-200/90 bg-white text-slate-700 shadow-2xs",
        success:
          "border border-emerald-300 bg-emerald-50 text-emerald-700",
        warning:
          "border border-amber-300 bg-amber-50 text-amber-800",
        danger:
          "border border-rose-300 bg-rose-50 text-rose-700",
        info:
          "border border-blue-300 bg-blue-50 text-blue-700",
        purple:
          "border border-purple-300 bg-purple-50 text-purple-700",
        cyan:
          "border border-cyan-300 bg-cyan-50 text-cyan-800",
        dark:
          "border border-slate-700 bg-[#1B222C] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
