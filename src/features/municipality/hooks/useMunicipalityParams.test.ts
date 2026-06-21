import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMunicipalityParams } from "@/features/municipality/hooks/useMunicipalityParams";

function makeSearchParams(values: Record<string, string>): URLSearchParams {
  return new URLSearchParams(values);
}

describe("useMunicipalityParams", () => {
  it("returns error when name is missing", () => {
    const { result } = renderHook(() => useMunicipalityParams(makeSearchParams({})));
    expect(result.current.ok).toBe(false);
    if (!result.current.ok) {
      expect((result.current as { error: { kind: string } }).error.kind).toBe("missing-name");
    }
  });

  it("returns error when lat/lon/ibge are missing", () => {
    const { result } = renderHook(() => useMunicipalityParams(makeSearchParams({ name: "X" })));
    expect(result.current.ok).toBe(false);
    if (!result.current.ok) {
      expect((result.current as { error: { kind: string } }).error.kind).toBe("missing-coord");
    }
  });

  it("returns ok for valid params", () => {
    const sp = makeSearchParams({ name: "Cidade X", lat: "1.5", lon: "2.5", ibge: "123" });
    const { result } = renderHook(() => useMunicipalityParams(sp));
    expect(result.current.ok).toBe(true);
    if (result.current.ok) {
      expect(result.current.value.name).toBe("Cidade X");
      expect(result.current.value.center).toEqual([2.5, 1.5]);
      expect(result.current.value.ibgeCode).toBe(123);
    }
  });

  it("returns error for non-numeric lat", () => {
    const sp = makeSearchParams({ name: "X", lat: "abc", lon: "1", ibge: "1" });
    const { result } = renderHook(() => useMunicipalityParams(sp));
    expect(result.current.ok).toBe(false);
    if (!result.current.ok) {
      expect((result.current as { error: { kind: string } }).error.kind).toBe("invalid-number");
    }
  });

  it("returns error for lat out of range (lat=91)", () => {
    const sp = makeSearchParams({ name: "X", lat: "91", lon: "0", ibge: "1" });
    const { result } = renderHook(() => useMunicipalityParams(sp));
    expect(result.current.ok).toBe(false);
    if (!result.current.ok) {
      expect((result.current as { error: { kind: string; field: string } }).error).toEqual({
        kind: "invalid-number",
        field: "lat",
      });
    }
  });

  it("returns error for negative ibge", () => {
    const sp = makeSearchParams({ name: "X", lat: "0", lon: "0", ibge: "-1" });
    const { result } = renderHook(() => useMunicipalityParams(sp));
    expect(result.current.ok).toBe(false);
    if (!result.current.ok) {
      expect((result.current as { error: { kind: string; field: string } }).error).toEqual({
        kind: "invalid-number",
        field: "ibge",
      });
    }
  });

  it("parses bbox when present", () => {
    const sp = makeSearchParams({ name: "X", lat: "0", lon: "0", ibge: "1", bbox: "1,2,3,4" });
    const { result } = renderHook(() => useMunicipalityParams(sp));
    expect(result.current.ok).toBe(true);
    if (result.current.ok) {
      expect(result.current.value.bbox).toEqual([1, 2, 3, 4]);
    }
  });

  it("returns error for malformed bbox (3 parts)", () => {
    const sp = makeSearchParams({ name: "X", lat: "0", lon: "0", ibge: "1", bbox: "1,2,3" });
    const { result } = renderHook(() => useMunicipalityParams(sp));
    expect(result.current.ok).toBe(false);
    if (!result.current.ok) {
      expect((result.current as { error: { kind: string } }).error.kind).toBe("invalid-bbox");
    }
  });
});
