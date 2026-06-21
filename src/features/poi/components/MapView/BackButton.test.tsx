import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "@/features/poi/components/MapView/BackButton";

describe("BackButton", () => {
  it("renders with the NOVA BUSCA label", () => {
    render(<BackButton onClick={() => {}} />);
    expect(screen.getByText("NOVA BUSCA")).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<BackButton onClick={() => {}} />);
    expect(
      screen.getByLabelText("Voltar para a tela de busca")
    ).toBeInTheDocument();
  });

  it("calls onClick once when clicked", async () => {
    const onClick = vi.fn();
    render(<BackButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
