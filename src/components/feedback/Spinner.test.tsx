import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "@/components/feedback/Spinner";

describe("Spinner", () => {
  it("renders a div with animate-spin by default", () => {
    const { container } = render(<Spinner />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("animate-spin");
    expect(el.tagName).toBe("DIV");
  });

  it("applies the given size class", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild as HTMLElement).toHaveClass("w-6");
  });

  it("is hidden from assistive tech by default", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
