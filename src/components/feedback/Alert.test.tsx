import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "@/components/feedback/Alert";

describe("Alert", () => {
  it("renders children with role=alert", () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something happened");
  });

  it("defaults to top-center position with info variant", () => {
    render(<Alert>hi</Alert>);
    const el = screen.getByRole("alert");
    expect(el).toHaveClass("top-4", "left-1/2", "-translate-x-1/2");
    expect(el).toHaveClass("bg-background/95");
  });

  it("applies destructive styling", () => {
    render(<Alert variant="destructive">bad</Alert>);
    const el = screen.getByRole("alert");
    expect(el).toHaveClass("bg-destructive", "text-destructive-foreground");
  });

  it("uses a destructive icon by default for destructive variant", () => {
    render(<Alert variant="destructive">x</Alert>);
    expect(screen.getByText("⚠")).toBeInTheDocument();
  });

  it("uses an info icon by default for info variant", () => {
    render(<Alert>x</Alert>);
    expect(screen.getByText("ℹ")).toBeInTheDocument();
  });

  it("respects a custom icon", () => {
    render(<Alert icon="🚨">x</Alert>);
    expect(screen.getByText("🚨")).toBeInTheDocument();
  });
});
