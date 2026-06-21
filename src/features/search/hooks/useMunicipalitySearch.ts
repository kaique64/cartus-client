import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IBGEMunicipio, SearchResult } from "@/features/search/types";
import { fetchMunicipios } from "@/features/search/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const MAX_RESULTS = 6;
const DEBOUNCE_MS = 200;
const IBGE_QUERY_KEY = ["ibge-municipios"] as const;

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export interface UseMunicipalitySearchResult {
  query: string;
  setQuery: (q: string) => void;
  suggestions: IBGEMunicipio[];
  loading: boolean;
  error: string | null;
  select: (mun: IBGEMunicipio) => SearchResult;
}

export function useMunicipalitySearch(): UseMunicipalitySearchResult {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);

  const {
    data: allMunicipios,
    isLoading,
    error,
  } = useQuery<IBGEMunicipio[]>({
    queryKey: IBGE_QUERY_KEY,
    queryFn: ({ signal }) => fetchMunicipios(signal),
    staleTime: Infinity,
  });

  const suggestions = useMemo(() => {
    if (!allMunicipios || debounced.length < 2) return [];
    const n = normalize(debounced);
    return allMunicipios
      .filter((m) => normalize(m.nome).includes(n))
      .slice(0, MAX_RESULTS);
  }, [allMunicipios, debounced]);

  const select = (mun: IBGEMunicipio): SearchResult => ({
    name: `${mun.nome} — ${mun.microrregiao.mesorregiao.UF.sigla}`,
    ibgeCode: mun.id,
    center: [-47.93, -15.78],
  });

  return {
    query,
    setQuery,
    suggestions,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    select,
  };
}
