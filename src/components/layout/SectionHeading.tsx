import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <p
      className={cn(
        "text-xs text-muted-foreground tracking-[0.2em] font-display",
        className
      )}
    >
      {children}
    </p>
  );
}
