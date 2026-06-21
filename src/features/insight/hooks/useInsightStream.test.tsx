import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/features/insight/api", () => {
  return {
    requestInsight: vi.fn(),
    connectInsightStream: vi.fn(),
    fetchMunicipalityMesh: vi.fn(),
  };
});

import {
  requestInsight,
  connectInsightStream,
  fetchMunicipalityMesh,
} from "@/features/insight/api";
import { useInsightStream } from "@/features/insight/hooks/useInsightStream";
import type { SseEventBase, ProcessedDataPayload, GeneratedInsightPayload, PoisImportedPayload, PoisImportFailedPayload } from "@/features/insight/types";

type StreamCallbacks = Parameters<typeof connectInsightStream>[1];

function makeProcessedData(municipalityId = 1): SseEventBase<ProcessedDataPayload> {
  return {
    type: "PROCESSED_DATA",
    job_id: "job-1",
    municipality_id: municipalityId,
    municipality_name: "Cidade X",
    payload: { municipality_id: municipalityId } as ProcessedDataPayload,
  };
}

function makeInsight(): SseEventBase<GeneratedInsightPayload> {
  return {
    type: "GENERATED_INSIGHT",
    job_id: "job-1",
    municipality_id: 1,
    municipality_name: "Cidade X",
    payload: {} as GeneratedInsightPayload,
  };
}

function makePoisImported(count = 10): SseEventBase<PoisImportedPayload> {
  return {
    type: "POIS_IMPORTED",
    job_id: "job-1",
    municipality_id: 1,
    municipality_name: "Cidade X",
    payload: { count },
  };
}

function makePoisFailed(reason = "worker timeout"): SseEventBase<PoisImportFailedPayload> {
  return {
    type: "POIS_IMPORT_FAILED",
    job_id: "job-1",
    municipality_id: 1,
    municipality_name: "Cidade X",
    payload: { reason },
  };
}

describe("useInsightStream — POI async events", () => {
  let captured: StreamCallbacks | null = null;
  let closeMock: Mock = vi.fn();

  beforeEach(() => {
    captured = null;
    closeMock = vi.fn();
    vi.mocked(requestInsight).mockResolvedValue({ job_id: "job-1", status: "ACCEPTED", message: "" });
    vi.mocked(fetchMunicipalityMesh).mockResolvedValue({
      type: "FeatureCollection",
      features: [],
    } as GeoJSON.FeatureCollection);
    vi.mocked(connectInsightStream).mockImplementation((_jobId, callbacks) => {
      captured = callbacks;
      return closeMock;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function startStream(cityName: string) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const utils = renderHook(({ name }: { name: string | null }) => useInsightStream(name), {
      initialProps: { name: cityName },
      wrapper,
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    return { ...utils, queryClient };
  }

  async function flushMicrotasks() {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it("sets poisImported when POIS_IMPORTED arrives", async () => {
    const { result } = await startStream("Cidade X");

    expect(captured).not.toBeNull();
    act(() => {
      captured!.onPoisImported(makePoisImported(42));
    });

    expect(result.current.poisImported).toEqual({ count: 42 });
    expect(result.current.poiFailed).toBeNull();
  });

  it("sets poiFailed when POIS_IMPORT_FAILED arrives", async () => {
    const { result } = await startStream("Cidade X");

    act(() => {
      captured!.onPoisImportFailed(makePoisFailed("osm fetch failed"));
    });

    expect(result.current.poiFailed).toEqual({ reason: "osm fetch failed" });
    expect(result.current.poisImported).toBeNull();
  });

  it("does NOT close the SSE connection after only generated_insight (waits for POI)", async () => {
    const { result } = await startStream("Cidade X");

    act(() => {
      captured!.onProcessedData(makeProcessedData());
    });
    await flushMicrotasks();
    act(() => {
      captured!.onGeneratedInsight(makeInsight());
    });
    await flushMicrotasks();

    expect(result.current.status).toBe("complete");
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("closes the SSE connection after all 3 expected events arrive (processed + insight + POI)", async () => {
    const { result } = await startStream("Cidade X");

    act(() => {
      captured!.onProcessedData(makeProcessedData());
    });
    await flushMicrotasks();
    expect(closeMock).not.toHaveBeenCalled();

    act(() => {
      captured!.onPoisImported(makePoisImported(5));
    });
    expect(closeMock).not.toHaveBeenCalled();

    act(() => {
      captured!.onGeneratedInsight(makeInsight());
    });
    await flushMicrotasks();
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("complete");
    expect(result.current.poisImported).toEqual({ count: 5 });
  });

  it("closes the SSE connection when POI import failed event arrives (with insight)", async () => {
    const { result } = await startStream("Cidade X");

    act(() => {
      captured!.onProcessedData(makeProcessedData());
    });
    await flushMicrotasks();
    act(() => {
      captured!.onPoisImportFailed(makePoisFailed("nope"));
    });
    expect(closeMock).not.toHaveBeenCalled();

    act(() => {
      captured!.onGeneratedInsight(makeInsight());
    });
    await flushMicrotasks();
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(result.current.poiFailed).toEqual({ reason: "nope" });
  });

  it("does not call the POI HTTP trigger until poisImported arrives (only on processedData)", async () => {
    const { result } = await startStream("Cidade X");

    expect(result.current.poisImported).toBeNull();

    act(() => {
      captured!.onProcessedData(makeProcessedData());
    });
    await flushMicrotasks();
    expect(result.current.poisImported).toBeNull();

    act(() => {
      captured!.onPoisImported(makePoisImported(7));
    });
    expect(result.current.poisImported).toEqual({ count: 7 });
  });

  it("fires the safety timeout when no event arrives within 90s", async () => {
    vi.useFakeTimers();
    try {
      const { result } = await startStream("Cidade X");

      expect(result.current.status).not.toBe("error");
      expect(result.current.error).toBeNull();

      await act(async () => {
        vi.advanceTimersByTime(90_000);
      });

      expect(result.current.status).toBe("error");
      expect(result.current.error).toMatch(/demorou/);
      expect(closeMock).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("re-runs the stream when cityName changes (no stale hasStartedRef)", async () => {
    const { result, rerender } = await startStream("Cidade A");

    expect(captured).not.toBeNull();
    const firstCaptured = captured;

    act(() => {
      firstCaptured!.onProcessedData(makeProcessedData(1));
    });
    await flushMicrotasks();
    act(() => {
      firstCaptured!.onPoisImported(makePoisImported(10));
    });
    expect(result.current.poisImported).toEqual({ count: 10 });
    expect(result.current.processedData).not.toBeNull();

    const firstCloseCalls = closeMock.mock.calls.length;
    expect(firstCloseCalls).toBeGreaterThanOrEqual(0);

    vi.mocked(connectInsightStream).mockImplementation((_jobId, callbacks) => {
      captured = callbacks;
      return vi.fn();
    });
    vi.mocked(requestInsight).mockResolvedValue({ job_id: "job-2", status: "ACCEPTED", message: "" });

    rerender({ name: "Cidade B" });
    await flushMicrotasks();

    expect(captured).not.toBe(firstCaptured);
    expect(result.current.processedData).toBeNull();
    expect(result.current.poisImported).toBeNull();
    expect(result.current.status).toBe("streaming");

    act(() => {
      captured!.onProcessedData(makeProcessedData(2));
    });
    await flushMicrotasks();
    act(() => {
      captured!.onPoisImported(makePoisImported(20));
    });
    expect(result.current.poisImported).toEqual({ count: 20 });
  });

  it("resets receivedRef so partial events from previous city do not close SSE early", async () => {
    const { result, rerender } = await startStream("Cidade A");

    const firstCaptured = captured;
    act(() => {
      firstCaptured!.onProcessedData(makeProcessedData(1));
    });
    await flushMicrotasks();
    act(() => {
      firstCaptured!.onGeneratedInsight(makeInsight());
    });
    await flushMicrotasks();

    expect(result.current.status).toBe("complete");
    expect(closeMock).not.toHaveBeenCalled();

    vi.mocked(connectInsightStream).mockImplementation((_jobId, callbacks) => {
      captured = callbacks;
      return vi.fn();
    });
    vi.mocked(requestInsight).mockResolvedValue({ job_id: "job-2", status: "ACCEPTED", message: "" });

    rerender({ name: "Cidade B" });
    await flushMicrotasks();

    const callsBeforeSecondStreamEvents = closeMock.mock.calls.length;
    const secondCaptured = captured;
    expect(secondCaptured).not.toBe(firstCaptured);

    act(() => {
      secondCaptured!.onProcessedData(makeProcessedData(2));
    });
    await flushMicrotasks();
    act(() => {
      secondCaptured!.onGeneratedInsight(makeInsight());
    });
    await flushMicrotasks();

    expect(closeMock.mock.calls.length).toBe(callsBeforeSecondStreamEvents);
  });
});
