import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 py-2 text-xs md:text-sm text-slate-800 shadow-2xs transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:border-[#1E88E5] focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
