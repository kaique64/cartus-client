import { describe, it, expect, afterEach, vi } from "vitest";

describe("BFF_BASE_URL", () => {
  const originalEnv = import.meta.env.VITE_BFF_URL;

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalEnv !== undefined) {
      vi.stubEnv("VITE_BFF_URL", originalEnv);
    }
  });

  it("returns the env value when VITE_BFF_URL is set", async () => {
    vi.stubEnv("VITE_BFF_URL", "https://bff.example.com/api/v1");
    vi.resetModules();
    const { BFF_BASE_URL } = await import("@/lib/env");
    expect(BFF_BASE_URL).toBe("https://bff.example.com/api/v1");
  });

  it("falls back to localhost when VITE_BFF_URL is unset", async () => {
    vi.unstubAllEnvs();
    delete (import.meta.env as Record<string, unknown>).VITE_BFF_URL;
    vi.resetModules();
    const { BFF_BASE_URL } = await import("@/lib/env");
    expect(BFF_BASE_URL).toBe("http://localhost:3000/api/v1");
  });
});
