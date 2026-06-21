import type { PoisResponse } from "@/features/poi/types";
import { BFF_BASE_URL } from "@/lib/env";

export async function fetchPois(
  municipalityId: number,
  categories?: string[],
  signal?: AbortSignal
): Promise<PoisResponse> {
  const params = new URLSearchParams();
  if (categories && categories.length > 0) {
    params.set("categories", categories.join(","));
  }
  const qs = params.toString();
  const url = `${BFF_BASE_URL}/municipalities/${municipalityId}/pois${qs ? `?${qs}` : ""}`;

  const res = signal ? await fetch(url, { signal }) : await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ao buscar POIs: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
