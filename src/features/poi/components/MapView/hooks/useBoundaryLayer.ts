import { useEffect, useRef, type MutableRefObject } from "react";
import L from "leaflet";

const BOUNDARY_STYLE: L.PathOptions = {
  color: "hsl(185, 100%, 50%)",
  weight: 1.5,
  fillColor: "hsl(185, 100%, 50%)",
  fillOpacity: 0,
  opacity: 0,
  interactive: false,
};

function animateBoundary(geoLayer: L.GeoJSON, map: L.Map): void {
  map.fitBounds(geoLayer.getBounds(), { padding: [40, 40], maxZoom: 14 });

  let start: number | null = null;
  const duration = 1200;

  function step(timestamp: number): void {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    geoLayer.setStyle({ fillOpacity: eased * 0.08, opacity: eased * 0.7 });
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function useBoundaryLayer(
  mapRef: MutableRefObject<L.Map | null>,
  geoJson: GeoJSON.FeatureCollection | null | undefined,
  onLoaded?: () => void
): void {
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!geoJson || !mapRef.current) return;

    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }

    const layer = L.geoJSON(geoJson, { style: BOUNDARY_STYLE }).addTo(mapRef.current);
    layerRef.current = layer;
    animateBoundary(layer, mapRef.current);
    onLoaded?.();
  }, [geoJson, mapRef, onLoaded]);
}
