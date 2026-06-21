import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PoiLegend } from "@/features/poi/components/MapView/PoiLegend";
import type { CategoriesSummary } from "@/features/poi/types";
import type { SortMode } from "@/features/poi/hooks/usePoiFiltering";

const summary: CategoriesSummary = {
  amenity: { total: 5, hospital: 3, clinic: 2 },
  shop: { total: 4, supermarket: 4 },
};

const noop = () => {};

function ControlledLegend({
  initialExpanded = new Set<string>(),
  initialHidden = new Set<string>(),
  sortMode = "count" as SortMode,
  onToggleCategory = noop,
  onToggleSourceTag = noop,
  onToggleSortMode = noop,
}: {
  initialExpanded?: Set<string>;
  initialHidden?: Set<string>;
  sortMode?: SortMode;
  onToggleCategory?: (cat: string) => void;
  onToggleSourceTag?: (cats: string[]) => void;
  onToggleSortMode?: () => void;
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  return (
    <PoiLegend
      categoriesSummary={summary}
      hiddenCategories={initialHidden}
      expandedGroups={expanded}
      sortMode={sortMode}
      onToggleCategory={onToggleCategory}
      onToggleGroup={(g) => setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(g)) next.delete(g);
        else next.add(g);
        return next;
      })}
      onToggleSourceTag={onToggleSourceTag}
      onToggleSortMode={onToggleSortMode}
    />
  );
}

function renderLegend(overrides: Partial<{
  hiddenCategories: Set<string>;
  expandedGroups: Set<string>;
  sortMode: SortMode;
  onToggleCategory: (cat: string) => void;
  onToggleGroup: (group: string) => void;
  onToggleSourceTag: (cats: string[]) => void;
  onToggleSortMode: () => void;
}> = {}) {
  return render(
    <PoiLegend
      categoriesSummary={summary}
      hiddenCategories={overrides.hiddenCategories ?? new Set()}
      expandedGroups={overrides.expandedGroups ?? new Set()}
      sortMode={overrides.sortMode ?? "count"}
      onToggleCategory={overrides.onToggleCategory ?? noop}
      onToggleGroup={overrides.onToggleGroup ?? noop}
      onToggleSourceTag={overrides.onToggleSourceTag ?? noop}
      onToggleSortMode={overrides.onToggleSortMode ?? noop}
    />
  );
}

describe("PoiLegend", () => {
  it("renders the header", () => {
    renderLegend();
    expect(screen.getByText("PONTOS DE INTERESSE")).toBeInTheDocument();
  });

  it("renders each source tag with its total", () => {
    renderLegend();
    const chevron = screen.getByRole("button", { name: /expandir serviços/i });
    const group = chevron.closest("div.flex.flex-col") as HTMLElement;
    expect(within(group).getByText("Serviços e Conveniências")).toBeInTheDocument();
    expect(within(group).getByText("5")).toBeInTheDocument();
  });

  it("does not show categories until group is expanded", () => {
    renderLegend();
    expect(screen.queryByText("Hospital")).not.toBeInTheDocument();
  });

  it("expands a group and shows its categories", async () => {
    const user = userEvent.setup();
    render(<ControlledLegend />);
    await user.click(screen.getByRole("button", { name: /expandir serviços/i }));
    expect(screen.getByText("Hospital")).toBeInTheDocument();
    expect(screen.getByText("Clínica")).toBeInTheDocument();
  });

  it("calls onToggleGroup when chevron is clicked", async () => {
    const user = userEvent.setup();
    const onToggleGroup = vi.fn();
    renderLegend({ onToggleGroup });
    await user.click(screen.getByRole("button", { name: /expandir serviços/i }));
    expect(onToggleGroup).toHaveBeenCalledWith("amenity");
  });

  it("calls onToggleCategory when a category is clicked", async () => {
    const user = userEvent.setup();
    const onToggleCategory = vi.fn();
    render(
      <ControlledLegend
        initialExpanded={new Set(["amenity"])}
        onToggleCategory={onToggleCategory}
      />
    );
    const hospitalButton = screen.getByText("Hospital").closest("button")!;
    await user.click(hospitalButton);
    expect(onToggleCategory).toHaveBeenCalledWith("hospital");
  });

  it("calls onToggleSourceTag when the source tag label is clicked", async () => {
    const user = userEvent.setup();
    const onToggleSourceTag = vi.fn();
    renderLegend({ onToggleSourceTag });
    await user.click(screen.getByText("Serviços e Conveniências"));
    expect(onToggleSourceTag).toHaveBeenCalledWith(["hospital", "clinic"]);
  });

  it("dims the source tag when all its categories are hidden", () => {
    const { container } = renderLegend({
      hiddenCategories: new Set(["hospital", "clinic"]),
    });
    const group = container.querySelector("div.flex.flex-col") as HTMLElement;
    const button = within(group).getByText("Serviços e Conveniências").closest("button")!;
    expect(button.style.opacity).toBe("0.4");
  });

  it("calls onToggleSortMode when the sort button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleSortMode = vi.fn();
    renderLegend({ onToggleSortMode });
    const sortButton = document.querySelector<HTMLButtonElement>(
      "button[title*='Quantidade'], button[title*='Alfabeticamente']"
    )!;
    await user.click(sortButton);
    expect(onToggleSortMode).toHaveBeenCalledTimes(1);
  });
});
