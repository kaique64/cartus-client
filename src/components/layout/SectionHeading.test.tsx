import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "@/components/layout/SectionHeading";

describe("SectionHeading", () => {
  it("renders children as uppercase tracking text", () => {
    render(<SectionHeading>Demografia</SectionHeading>);
    const el = screen.getByText("Demografia");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("tracking-[0.2em]", "font-display", "text-xs");
  });

  it("applies custom className", () => {
    render(<SectionHeading className="text-cyan">X</SectionHeading>);
    expect(screen.getByText("X")).toHaveClass("text-cyan");
  });
});
