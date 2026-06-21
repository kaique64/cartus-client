import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowLeft } from "lucide-react";
import { OverlayButton } from "@/components/layout/OverlayButton";

describe("OverlayButton", () => {
  it("renders children and an icon", () => {
    render(<OverlayButton icon={<ArrowLeft data-testid="ic" />}>NOVA BUSCA</OverlayButton>);
    expect(screen.getByText("NOVA BUSCA")).toBeInTheDocument();
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });

  it("applies top-left position by default", () => {
    render(<OverlayButton>X</OverlayButton>);
    expect(screen.getByRole("button")).toHaveClass("top-6", "left-6");
  });

  it("applies top-right position when specified", () => {
    render(<OverlayButton position="top-right">X</OverlayButton>);
    expect(screen.getByRole("button")).toHaveClass("top-6", "right-6");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OverlayButton onClick={onClick}>X</OverlayButton>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as disabled when disabled prop is true", () => {
    render(<OverlayButton disabled>X</OverlayButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
