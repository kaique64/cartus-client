import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

function dispatchKey(key: string) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("useEscapeKey", () => {
  it("calls onEscape when Escape is pressed", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    dispatchKey("Escape");

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("does not call onEscape for other keys", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    dispatchKey("Enter");
    dispatchKey("a");
    dispatchKey("ArrowDown");

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(onEscape));

    unmount();
    dispatchKey("Escape");

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("calls the latest callback when it changes", () => {
    const onEscape1 = vi.fn();
    const onEscape2 = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => useEscapeKey(cb),
      { initialProps: { cb: onEscape1 } }
    );

    rerender({ cb: onEscape2 });
    dispatchKey("Escape");

    expect(onEscape1).not.toHaveBeenCalled();
    expect(onEscape2).toHaveBeenCalledTimes(1);
  });
});
