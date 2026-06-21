import { useEffect, useRef, type RefObject, type MutableRefObject } from "react";
import L from "leaflet";

interface UseLeafletMapOptions {
  center: [number, number];
  zoom?: number;
  bounds?: [[number, number], [number, number]];
  containerRef: RefObject<HTMLDivElement>;
}

export interface UseLeafletMapResult {
  mapRef: MutableRefObject<L.Map | null>;
  rendererRef: MutableRefObject<L.Canvas | null>;
  markersLayerRef: MutableRefObject<L.LayerGroup | null>;
}

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_SUBDOMAINS = "abcd";

export function useLeafletMap({
  center,
  zoom = 5,
  bounds,
  containerRef,
}: UseLeafletMapOptions): UseLeafletMapResult {
  const mapRef = useRef<L.Map | null>(null);
  const rendererRef = useRef<L.Canvas | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Init: create the map exactly once when the container is mounted.
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = L.canvas({ padding: 0.5 });
    rendererRef.current = renderer;

    const map = L.map(containerRef.current, {
      center: [center[1], center[0]],
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(TILE_URL, {
      subdomains: TILE_SUBDOMAINS,
      maxZoom: 19,
      className: "map-tiles-lighter",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      rendererRef.current = null;
      markersLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  // Update: pan to new bounds when they change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [bounds]);

  return { mapRef, rendererRef, markersLayerRef };
}
