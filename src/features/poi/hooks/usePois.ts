import { useQuery } from "@tanstack/react-query";
import { fetchPois } from "@/features/poi/api";
import type { PoisResponse } from "@/features/poi/types";
import type { CategoriesSummary, PoiItem } from "@/features/poi/types";

interface UsePoisResult {
  pois: PoiItem[];
  categoriesSummary: CategoriesSummary;
  loading: boolean;
  error: string | null;
}

const EMPTY_SUMMARY: CategoriesSummary = {};
const STALE_TIME_MS = 5 * 60 * 1000;

export function usePois(
  municipalityId: number | null | undefined,
  enabled: boolean = true
): UsePoisResult {
  const { data, isLoading, error } = useQuery<PoisResponse>({
    queryKey: ["pois", municipalityId] as const,
    queryFn: ({ signal }) => fetchPois(municipalityId as number, undefined, signal),
    enabled: enabled && !!municipalityId,
    staleTime: STALE_TIME_MS,
  });

  return {
    pois: data?.pois ?? [],
    categoriesSummary: data?.categories_summary ?? EMPTY_SUMMARY,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
