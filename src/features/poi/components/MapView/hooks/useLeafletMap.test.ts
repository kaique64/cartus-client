import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { renderHook } from "@testing-library/react";

beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mapInstances: unknown[] = [];
const fitBoundsCalls: Array<[number, number] | [[number, number], [number, number]]> = [];

vi.mock("leaflet", () => {
  function makeLayerGroup() {
    return {
      addTo: vi.fn(function (this: unknown) { return this; }),
      clearLayers: vi.fn(),
      addLayer: vi.fn(),
    };
  }
    function makeMap() {
    const instance = {
      fitBounds: vi.fn((b: [number, number] | [[number, number], [number, number]]) => { fitBoundsCalls.push(b); }),
      setView: vi.fn(),
      remove: vi.fn(),
      invalidateSize: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };
    mapInstances.push(instance);
    return instance;
  }
  return {
    default: {
      map: makeMap,
      canvas: () => ({}),
      tileLayer: () => ({ addTo: () => ({}) }),
      control: { zoom: () => ({ addTo: () => ({}) }) },
      layerGroup: makeLayerGroup,
    },
  };
});

import { useLeafletMap } from "@/features/poi/components/MapView/hooks/useLeafletMap";
import type { RefObject } from "react";

beforeEach(() => {
  mapInstances.length = 0;
  fitBoundsCalls.length = 0;
});

describe("useLeafletMap - stability", () => {
  it("does NOT recreate the map when bounds change (only pan)", () => {
    const container = document.createElement("div");
    const containerRef: RefObject<HTMLDivElement> = { current: container };

    const { result, rerender } = renderHook(
      ({ center, bounds }: { center: [number, number]; bounds?: [[number, number], [number, number]] }) =>
        useLeafletMap({ center, bounds, containerRef }),
      { initialProps: { center: [-47, -15] as [number, number], bounds: undefined as undefined | [[number, number], [number, number]] } }
    );

    const firstMap = result.current.mapRef.current;
    expect(mapInstances.length).toBe(1);

    rerender({
      center: [-46, -14] as [number, number],
      bounds: [[1, 2], [3, 4]] as [[number, number], [number, number]],
    });

    const secondMap = result.current.mapRef.current;
    expect(secondMap).toBe(firstMap);
    expect(mapInstances.length).toBe(1);
    expect(fitBoundsCalls).toEqual([[[1, 2], [3, 4]]]);
  });

  it("does NOT recreate the map when center array changes (new array, same values)", () => {
    const container = document.createElement("div");
    const containerRef: RefObject<HTMLDivElement> = { current: container };

    const { result, rerender } = renderHook(
      ({ center }: { center: [number, number] }) => useLeafletMap({ center, containerRef }),
      { initialProps: { center: [-47, -15] as [number, number] } }
    );

    expect(mapInstances.length).toBe(1);
    const firstMap = result.current.mapRef.current;

    rerender({ center: [-47, -15] as [number, number] });

    expect(result.current.mapRef.current).toBe(firstMap);
    expect(mapInstances.length).toBe(1);
  });
});
