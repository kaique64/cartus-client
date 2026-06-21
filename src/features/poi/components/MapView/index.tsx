import { useRef, useState, useMemo } from "react";
import type { SearchResult } from "@/features/search/types";
import type { CategoriesSummary, PoiItem } from "@/features/poi/types";
import { useLeafletMap } from "./hooks/useLeafletMap";
import { useBoundaryLayer } from "./hooks/useBoundaryLayer";
import { usePoiMarkers } from "./hooks/usePoiMarkers";
import { usePoiFiltering } from "@/features/poi/hooks/usePoiFiltering";
import { BackButton } from "./BackButton";
import { PoiLayerControl } from "./PoiLayerControl";
import { PoiFailureAlert } from "./PoiFailureAlert";

interface MapViewProps {
  result: SearchResult;
  onBack: () => void;
  geoJson?: GeoJSON.FeatureCollection | null;
  pois?: PoiItem[];
  poisLoading?: boolean;
  categoriesSummary?: CategoriesSummary;
  poiFailed?: { reason: string } | null;
}

export function MapView({
  result,
  onBack,
  geoJson,
  pois = [],
  poisLoading = false,
  categoriesSummary = {},
  poiFailed = null,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingGeo, setLoadingGeo] = useState(true);

  const bounds = useMemo<
    [[number, number], [number, number]] | undefined
  >(
    () =>
      result.bbox
        ? [
            [result.bbox[1], result.bbox[0]],
            [result.bbox[3], result.bbox[2]],
          ]
        : undefined,
    [result.bbox]
  );

  const { mapRef, rendererRef, markersLayerRef } = useLeafletMap({
    center: result.center,
    zoom: 5,
    bounds,
    containerRef,
  });

  useBoundaryLayer(mapRef, geoJson, () => setLoadingGeo(false));

  const filtering = usePoiFiltering();
  usePoiMarkers(mapRef, rendererRef, markersLayerRef, pois, filtering.hiddenCategories);

  const totalPois = pois.length;
  const showPoiButton = !poiFailed && (poisLoading || totalPois > 0);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />

      {loadingGeo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
        </div>
      )}

      {poiFailed && <PoiFailureAlert reason={poiFailed.reason} />}

      <BackButton onClick={onBack} />

      {showPoiButton && (
        <PoiLayerControl
          poisLoading={poisLoading}
          totalPois={totalPois}
          categoriesSummary={categoriesSummary}
          hiddenCategories={filtering.hiddenCategories}
          expandedGroups={filtering.expandedGroups}
          sortMode={filtering.sortMode}
          onToggleCategory={filtering.toggleCategory}
          onToggleGroup={filtering.toggleGroup}
          onToggleSourceTag={filtering.toggleSourceTag}
        />
      )}

      <div
        className="absolute bottom-6 left-6 z-[1000] opacity-0 animate-fade-in"
        style={{ animationDelay: "0.5s" }}
      >
        <p className="text-xs text-muted-foreground font-body">{result.name}</p>
      </div>
    </div>
  );
}
