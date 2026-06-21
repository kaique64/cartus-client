import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("fetchPois", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    delete (import.meta.env as Record<string, unknown>).VITE_BFF_URL;
  });

  it("uses VITE_BFF_URL from env", async () => {
    vi.stubEnv("VITE_BFF_URL", "https://bff.test/api/v1");
    vi.resetModules();
    const { fetchPois } = await import("@/features/poi/api");
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ municipality_id: 1, total: 0, pois: [], categories_summary: {} }),
    } as Response);

    const controller = new AbortController();
    await fetchPois(123, undefined, controller.signal);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://bff.test/api/v1/municipalities/123/pois",
      expect.objectContaining({ signal: controller.signal })
    );
  });

  it("appends categories query string when provided", async () => {
    vi.stubEnv("VITE_BFF_URL", "https://bff.test/api/v1");
    vi.resetModules();
    const { fetchPois } = await import("@/features/poi/api");
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ municipality_id: 1, total: 0, pois: [], categories_summary: {} }),
    } as Response);

    await fetchPois(1, ["hospital", "pharmacy"]);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://bff.test/api/v1/municipalities/1/pois?categories=hospital%2Cpharmacy"
    );
  });

  it("throws on non-ok response", async () => {
    vi.stubEnv("VITE_BFF_URL", "https://bff.test/api/v1");
    vi.resetModules();
    const { fetchPois } = await import("@/features/poi/api");
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    await expect(fetchPois(1)).rejects.toThrow(/500/);
  });
});
