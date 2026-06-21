import type { ReactNode, MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

export type OverlayPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface OverlayButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  position?: OverlayPosition;
  active?: boolean;
  ariaLabel?: string;
  ariaBusy?: boolean;
  className?: string;
}

const POSITION_CLASSES: Record<OverlayPosition, string> = {
  "top-left": "top-6 left-6",
  "top-right": "top-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "bottom-right": "bottom-6 right-6",
};

export function OverlayButton({
  children,
  icon,
  onClick,
  disabled = false,
  position = "top-left",
  active = false,
  ariaLabel,
  ariaBusy,
  className,
}: OverlayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-busy={ariaBusy || undefined}
      className={cn(
        "absolute z-[1000] flex items-center gap-2 px-3 py-2",
        "text-xs font-display tracking-wide transition-colors",
        "border bg-background/80 border-border",
        active
          ? "bg-background/95 backdrop-blur border-cyan/40 text-cyan"
          : "text-muted-foreground hover:text-cyan",
        POSITION_CLASSES[position],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
