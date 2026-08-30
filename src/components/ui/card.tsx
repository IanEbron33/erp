import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-xs transition-shadow hover:shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight text-slate-800",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "#1E88E5",
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md",
        className
      )}
    >
      {/* Left Vertical Indicator Bar */}
      <div
        className="absolute left-0 top-1/2 h-10 w-1.5 -translate-y-1/2 rounded-r-full"
        style={{ backgroundColor: accentColor }}
      />

      {/* Metric Label & Value */}
      <div className="pl-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <h4 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {value}
        </h4>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
        {trend && (
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold">
            <span
              className={
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              }
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        )}
      </div>

      {/* Circular Outline Icon Badge */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-blue-50/60 text-[#1E88E5] transition-transform hover:scale-105"
        style={{ borderColor: `${accentColor}40` }}
      >
        {icon}
      </div>
    </div>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
