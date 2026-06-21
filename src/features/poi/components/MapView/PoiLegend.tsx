import { ArrowDownAZ, ArrowDown10, ChevronDown, ChevronRight } from "lucide-react";
import {
  getCategoryLabel,
  getSourceTagColor,
  getSourceTagLabel,
  readTotal,
  readCategoryCount,
  type CategoriesSummary,
} from "@/features/poi/types";
import type { SortMode } from "@/features/poi/hooks/usePoiFiltering";

interface PoiLegendProps {
  categoriesSummary: CategoriesSummary;
  hiddenCategories: Set<string>;
  expandedGroups: Set<string>;
  sortMode: SortMode;
  onToggleCategory: (category: string) => void;
  onToggleGroup: (group: string) => void;
  onToggleSourceTag: (categories: string[]) => void;
  onToggleSortMode: () => void;
}

export function PoiLegend({
  categoriesSummary,
  hiddenCategories,
  expandedGroups,
  sortMode,
  onToggleCategory,
  onToggleGroup,
  onToggleSourceTag,
  onToggleSortMode,
}: PoiLegendProps) {
  const entries = Object.entries(categoriesSummary).sort(([tagA, detailsA], [tagB, detailsB]) => {
    if (sortMode === "alpha") {
      return getSourceTagLabel(tagA).localeCompare(getSourceTagLabel(tagB));
    }
    return readTotal(detailsB) - readTotal(detailsA);
  });

  return (
    <div className="mt-1 bg-background/95 backdrop-blur border border-border p-3 min-w-[240px] max-h-[70vh] overflow-y-auto animate-fade-in custom-scrollbar">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] text-muted-foreground tracking-[0.2em] font-display">
          PONTOS DE INTERESSE
        </p>
        <button
          onClick={onToggleSortMode}
          className="p-1 text-muted-foreground hover:text-cyan transition-colors bg-background/50 border border-border rounded"
          aria-label={sortMode === "alpha" ? "Ordenar por quantidade" : "Ordenar alfabeticamente"}
          title={sortMode === "alpha" ? "Ordenar por Quantidade" : "Ordenar Alfabeticamente"}
        >
          {sortMode === "alpha" ? <ArrowDown10 className="w-3 h-3" /> : <ArrowDownAZ className="w-3 h-3" />}
        </button>
      </div>
      <div className="space-y-3">
        {entries.map(([sourceTag, details]) => {
          const total = readTotal(details);
          if (total === 0) return null;
          const isExpanded = expandedGroups.has(sourceTag);
          const color = getSourceTagColor(sourceTag);
          const label = getSourceTagLabel(sourceTag);

          const categoriesEntries = Object.entries(details)
            .filter(([key]) => key !== "total")
            .sort(([catA], [catB]) => {
              if (sortMode === "alpha") {
                return getCategoryLabel(catA).localeCompare(getCategoryLabel(catB));
              }
              return readCategoryCount(details, catB) - readCategoryCount(details, catA);
            });

          const categoryKeys = categoriesEntries.map(([k]) => k);
          const allHidden =
            categoryKeys.length > 0 && categoryKeys.every((cat) => hiddenCategories.has(cat));

          return (
            <div key={sourceTag} className="flex flex-col gap-1">
              <div className="flex items-center gap-1 group w-full py-1">
                <button
                  onClick={() => onToggleGroup(sourceTag)}
                  aria-label={isExpanded ? `Recolher ${label}` : `Expandir ${label}`}
                  className="p-1 -ml-1 text-muted-foreground hover:text-cyan"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onToggleSourceTag(categoryKeys)}
                  className="flex items-center gap-2 flex-1 text-left transition-opacity"
                  style={{ opacity: allHidden ? 0.4 : 1 }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-all"
                    style={{
                      background: color,
                      boxShadow: !allHidden ? `0 0 6px ${color}60` : "none",
                    }}
                  />
                  <span className="text-[11px] font-bold text-foreground truncate">{label}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-display shrink-0">
                    {total}
                  </span>
                </button>
              </div>
              {isExpanded && (
                <div className="pl-6 space-y-0.5 mt-1">
                  {categoriesEntries.map(([cat]) => {
                    const isVisible = !hiddenCategories.has(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => onToggleCategory(cat)}
                        className="flex items-center gap-2 py-1 w-full text-left group transition-opacity"
                        style={{ opacity: isVisible ? 1 : 0.4 }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                          style={{
                            background: color,
                            boxShadow: isVisible ? `0 0 6px ${color}60` : "none",
                          }}
                        />
                        <span className="text-[10px] font-body text-muted-foreground group-hover:text-foreground truncate">
                          {getCategoryLabel(cat)}
                        </span>
                        <span className="text-[9px] text-muted-foreground ml-auto font-display shrink-0 opacity-70">
                          {readCategoryCount(details, cat)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
