import { useEffect, type MutableRefObject } from "react";
import L from "leaflet";
import type { PoiItem } from "@/features/poi/types";
import { getCategoryLabel, getSourceTagColor } from "@/features/poi/types";

export function usePoiMarkers(
  mapRef: MutableRefObject<L.Map | null>,
  rendererRef: MutableRefObject<L.Canvas | null>,
  markersLayerRef: MutableRefObject<L.LayerGroup | null>,
  pois: PoiItem[],
  hiddenCategories: Set<string>
): void {
  useEffect(() => {
    if (!mapRef.current || !rendererRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    for (const poi of pois) {
      if (hiddenCategories.has(poi.category)) continue;
      const color = getSourceTagColor(poi.source_tag);
      const marker = L.circleMarker([poi.lat, poi.lon], {
        renderer: rendererRef.current,
        radius: 4,
        fillColor: color,
        fillOpacity: 0.9,
        color: "rgba(0,0,0,0.5)",
        weight: 1,
        opacity: 1,
      });
      marker.bindTooltip(`${getCategoryLabel(poi.category)}<br/><b>${poi.name}</b>`, {
        className: "poi-tooltip",
        direction: "top",
        offset: [0, -4],
      });
      layer.addLayer(marker);
    }
  }, [mapRef, rendererRef, markersLayerRef, pois, hiddenCategories]);
}
