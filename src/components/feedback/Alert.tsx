import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "destructive";
export type AlertPosition = "top-center" | "top-right" | "bottom-center";

const POSITION_CLASSES: Record<AlertPosition, string> = {
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info: "bg-background/95 border border-border text-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

const DEFAULT_ICON: Record<AlertVariant, string> = {
  info: "ℹ",
  destructive: "⚠",
};

interface AlertProps {
  variant?: AlertVariant;
  position?: AlertPosition;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  position = "top-center",
  icon,
  children,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "absolute z-[1000] px-4 py-2 rounded-md shadow-lg",
        "flex items-center gap-2",
        POSITION_CLASSES[position],
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <span aria-hidden="true">{icon ?? DEFAULT_ICON[variant]}</span>
      <span>{children}</span>
    </div>
  );
}
