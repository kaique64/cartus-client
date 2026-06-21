import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "@/components/layout/Separator";

describe("Separator", () => {
  it("renders a div with default border classes", () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("border-t", "border-border", "my-6");
  });

  it("applies custom className", () => {
    const { container } = render(<Separator className="my-2" />);
    expect(container.firstChild).toHaveClass("my-2");
  });
});
