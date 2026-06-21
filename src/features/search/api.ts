import type { IBGEMunicipio } from "@/features/search/types";

const IBGE_MUNICIPIOS_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";

export async function fetchMunicipios(signal?: AbortSignal): Promise<IBGEMunicipio[]> {
  const res = await fetch(IBGE_MUNICIPIOS_URL, { signal });
  if (!res.ok) {
    throw new Error(`Falha ao buscar municípios (${res.status})`);
  }
  return res.json();
}
