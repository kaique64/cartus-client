import { useState } from "react";
import { Layers } from "lucide-react";
import { OverlayButton } from "@/components/layout/OverlayButton";
import { Spinner } from "@/components/feedback/Spinner";
import { PoiLegend } from "./PoiLegend";
import type { CategoriesSummary } from "@/features/poi/types";
import type { SortMode } from "@/features/poi/hooks/usePoiFiltering";

interface PoiLayerControlProps {
  poisLoading: boolean;
  totalPois: number;
  categoriesSummary: CategoriesSummary;
  hiddenCategories: Set<string>;
  expandedGroups: Set<string>;
  sortMode: SortMode;
  onToggleCategory: (category: string) => void;
  onToggleGroup: (group: string) => void;
  onToggleSourceTag: (categories: string[]) => void;
}

export function PoiLayerControl({
  poisLoading,
  totalPois,
  categoriesSummary,
  hiddenCategories,
  expandedGroups,
  sortMode,
  onToggleCategory,
  onToggleGroup,
  onToggleSourceTag,
}: PoiLayerControlProps) {
  const [showLegend, setShowLegend] = useState(false);

  return (
    <div className="absolute top-6 right-6 z-[1000]">
      <OverlayButton
        position="top-right"
        active={showLegend && totalPois > 0}
        disabled={poisLoading}
        ariaBusy={poisLoading}
        icon={poisLoading ? <Spinner size="xs" /> : <Layers className="w-3 h-3" />}
        onClick={() => !poisLoading && totalPois > 0 && setShowLegend((v) => !v)}
        ariaLabel="Controle de pontos de interesse"
      >
        <span>POIs</span>
        {!poisLoading && totalPois > 0 && (
          <span className="text-[9px] text-muted-foreground ml-1">{totalPois}</span>
        )}
      </OverlayButton>
      {showLegend && !poisLoading && totalPois > 0 && (
        <PoiLegend
          categoriesSummary={categoriesSummary}
          hiddenCategories={hiddenCategories}
          expandedGroups={expandedGroups}
          sortMode={sortMode}
          onToggleCategory={onToggleCategory}
          onToggleGroup={onToggleGroup}
          onToggleSourceTag={onToggleSourceTag}
          onToggleSortMode={() => {
            /* sort mode lives in parent usePoiFiltering */
          }}
        />
      )}
    </div>
  );
}
