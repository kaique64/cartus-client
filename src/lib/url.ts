import type { SearchResult } from "@/features/search/types";

export function buildMapUrl(result: SearchResult): string {
  const params = new URLSearchParams({
    name: result.name,
    ibge: String(result.ibgeCode),
    lat: String(result.center[1]),
    lon: String(result.center[0]),
  });
  if (result.bbox) {
    params.set("bbox", result.bbox.join(","));
  }
  return `/mapa?${params.toString()}`;
}
