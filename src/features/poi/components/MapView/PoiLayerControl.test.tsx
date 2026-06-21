import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PoiLayerControl } from "@/features/poi/components/MapView/PoiLayerControl";
import type { CategoriesSummary } from "@/features/poi/types";
import type { SortMode } from "@/features/poi/hooks/usePoiFiltering";

const emptySummary: CategoriesSummary = {};

const summary: CategoriesSummary = {
  amenity: { total: 5, hospital: 3, clinic: 2 },
};

const noop = () => {};

describe("PoiLayerControl", () => {
  it("renders the button with the total count when not loading", () => {
    render(
      <PoiLayerControl
        poisLoading={false}
        totalPois={5}
        categoriesSummary={summary}
        hiddenCategories={new Set()}
        expandedGroups={new Set()}
        sortMode={"count" as SortMode}
        onToggleCategory={noop}
        onToggleGroup={noop}
        onToggleSourceTag={noop}
      />
    );
    expect(screen.getByText("POIs")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("opens and closes the legend on click", async () => {
    const user = userEvent.setup();
    render(
      <PoiLayerControl
        poisLoading={false}
        totalPois={5}
        categoriesSummary={summary}
        hiddenCategories={new Set()}
        expandedGroups={new Set()}
        sortMode={"count" as SortMode}
        onToggleCategory={noop}
        onToggleGroup={noop}
        onToggleSourceTag={noop}
      />
    );
    const button = screen.getByRole("button", { name: /controle de pontos/i });

    expect(screen.queryByText("PONTOS DE INTERESSE")).not.toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText("PONTOS DE INTERESSE")).toBeInTheDocument();

    await user.click(button);
    expect(screen.queryByText("PONTOS DE INTERESSE")).not.toBeInTheDocument();
  });

  it("does not open legend while poisLoading", async () => {
    const user = userEvent.setup();
    render(
      <PoiLayerControl
        poisLoading={true}
        totalPois={0}
        categoriesSummary={emptySummary}
        hiddenCategories={new Set()}
        expandedGroups={new Set()}
        sortMode={"count" as SortMode}
        onToggleCategory={noop}
        onToggleGroup={noop}
        onToggleSourceTag={noop}
      />
    );
    const button = screen.getByRole("button", { name: /controle de pontos/i });
    await user.click(button);
    expect(screen.queryByText("PONTOS DE INTERESSE")).not.toBeInTheDocument();
  });

  it("forwards toggle callbacks from the legend", async () => {
    const user = userEvent.setup();
    const onToggleCategory = vi.fn();
    const onToggleGroup = vi.fn();
    const onToggleSourceTag = vi.fn();
    render(
      <PoiLayerControl
        poisLoading={false}
        totalPois={5}
        categoriesSummary={summary}
        hiddenCategories={new Set()}
        expandedGroups={new Set()}
        sortMode={"count" as SortMode}
        onToggleCategory={onToggleCategory}
        onToggleGroup={onToggleGroup}
        onToggleSourceTag={onToggleSourceTag}
      />
    );
    await user.click(screen.getByRole("button", { name: /controle de pontos/i }));

    await user.click(screen.getByRole("button", { name: /expandir serviços/i }));
    expect(onToggleGroup).toHaveBeenCalledWith("amenity");
  });
});
