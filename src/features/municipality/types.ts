import type { SearchResult } from "@/features/search/types";

export type MunicipalityParams = Omit<SearchResult, "name"> & { name: string };
