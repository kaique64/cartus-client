import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePoiFiltering } from "@/features/poi/hooks/usePoiFiltering";

describe("usePoiFiltering", () => {
  it("starts with sortMode=count and empty hidden/expanded sets", () => {
    const { result } = renderHook(() => usePoiFiltering());
    expect(result.current.sortMode).toBe("count");
    expect(result.current.hiddenCategories.size).toBe(0);
    expect(result.current.expandedGroups.size).toBe(0);
  });

  it("toggles a category in/out of hidden set", () => {
    const { result } = renderHook(() => usePoiFiltering());
    act(() => result.current.toggleCategory("hospital"));
    expect(result.current.hiddenCategories.has("hospital")).toBe(true);
    act(() => result.current.toggleCategory("hospital"));
    expect(result.current.hiddenCategories.has("hospital")).toBe(false);
  });

  it("toggles a group in/out of expanded set", () => {
    const { result } = renderHook(() => usePoiFiltering());
    act(() => result.current.toggleGroup("amenity"));
    expect(result.current.expandedGroups.has("amenity")).toBe(true);
  });

  it("toggles source tag visibility (hide all if any visible, else show all)", () => {
    const { result } = renderHook(() => usePoiFiltering());
    act(() => result.current.toggleSourceTag(["hospital", "clinic"]));
    expect(result.current.hiddenCategories.has("hospital")).toBe(true);
    expect(result.current.hiddenCategories.has("clinic")).toBe(true);
    act(() => result.current.toggleSourceTag(["hospital", "clinic"]));
    expect(result.current.hiddenCategories.has("hospital")).toBe(false);
    expect(result.current.hiddenCategories.has("clinic")).toBe(false);
  });

  it("switches sortMode between count and alpha", () => {
    const { result } = renderHook(() => usePoiFiltering());
    act(() => result.current.setSortMode("alpha"));
    expect(result.current.sortMode).toBe("alpha");
  });
});
