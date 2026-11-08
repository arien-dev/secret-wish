import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "accent" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "badge-default",
    primary: "badge-primary",
    accent: "badge-accent",
    outline: "badge-outline",
  };

  return (
    <span className={cn(variants[variant], className)} {...props} />
  );
}
