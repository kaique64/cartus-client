import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 200));
    expect(result.current).toBe("a");
  });

  it("does not update synchronously when value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    expect(result.current).toBe("a");
  });

  it("updates after the delay elapses", () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 200),
        { initialProps: { value: "a" } }
      );
      rerender({ value: "b" });
      act(() => { vi.advanceTimersByTime(200); });
      expect(result.current).toBe("b");
    } finally {
      vi.useRealTimers();
    }
  });

  it("coalesces multiple rapid changes into the latest value", () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 200),
        { initialProps: { value: "a" } }
      );
      rerender({ value: "b" });
      act(() => { vi.advanceTimersByTime(100); });
      rerender({ value: "c" });
      act(() => { vi.advanceTimersByTime(100); });
      expect(result.current).toBe("a");
      act(() => { vi.advanceTimersByTime(100); });
      expect(result.current).toBe("c");
    } finally {
      vi.useRealTimers();
    }
  });
});
