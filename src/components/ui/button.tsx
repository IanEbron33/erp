import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#1E88E5] to-[#1565C0] text-white shadow-sm hover:shadow-md hover:shadow-blue-500/25 hover:from-[#1976D2] hover:to-[#0D47A1] border border-blue-400/20",
        secondary:
          "bg-white text-slate-700 border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:shadow-xs",
        outline:
          "border border-slate-200/90 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-2xs",
        destructive:
          "bg-gradient-to-b from-rose-50 to-rose-100/60 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-2xs hover:shadow-rose-500/10",
        destructiveSolid:
          "bg-gradient-to-b from-rose-600 to-rose-700 text-white border border-rose-500 shadow-sm hover:shadow-md hover:shadow-rose-500/20 hover:from-rose-700 hover:to-rose-800",
        ghost:
          "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900",
        link:
          "text-[#1E88E5] underline-offset-4 hover:underline font-medium",
        dark:
          "bg-[#1B222C] text-white hover:bg-[#252E3B] border border-slate-700/50 shadow-sm",
        success:
          "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border border-emerald-500 shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:from-emerald-700 hover:to-emerald-800",
        cyan:
          "bg-gradient-to-b from-[#00BCD4] to-[#0097A7] text-white border border-cyan-400/30 shadow-sm hover:shadow-md hover:shadow-cyan-500/20",
      },
      size: {
        default: "h-9.5 px-4 py-2 text-xs md:text-sm",
        sm: "h-8 rounded-lg px-3 text-xs font-semibold",
        lg: "h-11 rounded-xl px-6 text-base font-bold",
        icon: "h-9 w-9 rounded-lg",
        iconSm: "h-7.5 w-7.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
