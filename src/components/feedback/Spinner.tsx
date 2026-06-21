import { cn } from "@/lib/utils";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const SIZE: Record<SpinnerSize, string> = {
  xs: "w-2 h-2 border",
  sm: "w-3 h-3 border",
  md: "w-4 h-4 border-2",
  lg: "w-6 h-6 border-2",
};

export function Spinner({ size = "sm", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-hidden="true"
      className={cn(
        "border-cyan border-t-transparent rounded-full animate-spin",
        SIZE[size],
        className
      )}
    />
  );
}
