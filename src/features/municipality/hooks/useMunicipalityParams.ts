import type { Result } from "@/types/result";
import type { MunicipalityParams } from "@/features/municipality/types";
import {
  MunicipalityParamsSchema,
  mapZodErrorToParamsError,
} from "@/features/municipality/schemas/municipalityParams";

export type MunicipalityParamsError =
  | { kind: "missing-name" }
  | { kind: "missing-coord" }
  | { kind: "invalid-number"; field: "lat" | "lon" | "ibge" }
  | { kind: "invalid-bbox" };

export function useMunicipalityParams(
  searchParams: URLSearchParams
): Result<MunicipalityParams, MunicipalityParamsError> {
  const nameRaw = searchParams.get("name");
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const ibgeRaw = searchParams.get("ibge");

  if (nameRaw === null) return { ok: false, error: { kind: "missing-name" } };
  if (latRaw === null || lonRaw === null || ibgeRaw === null) {
    return { ok: false, error: { kind: "missing-coord" } };
  }

  const parsed = MunicipalityParamsSchema.safeParse({
    name: nameRaw,
    lat: latRaw,
    lon: lonRaw,
    ibge: ibgeRaw,
    bbox: searchParams.get("bbox") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: mapZodErrorToParamsError(parsed.error) };
  }

  const { name, lat, lon, ibge: ibgeCode, bbox } = parsed.data;
  return { ok: true, value: { name, ibgeCode, center: [lon, lat], bbox } };
}
