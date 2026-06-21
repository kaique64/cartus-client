import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { connectInsightStream } from "@/features/insight/api";
import type {
  SseEventBase,
  ProcessedDataPayload,
  GeneratedInsightPayload,
  PoisImportedPayload,
  PoisImportFailedPayload,
} from "@/features/insight/types";

type Listener = (event: MessageEvent) => void;
type ErrorListener = (event: Event) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  readyState: number = 0;
  closed = false;

  private listeners = new Map<string, Listener[]>();
  private errorListeners: ErrorListener[] = [];

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    const arr = this.listeners.get(type) ?? [];
    arr.push(listener);
    this.listeners.set(type, arr);
  }

  removeEventListener = vi.fn();

  set onerror(handler: ErrorListener | null) {
    if (handler) {
      this.errorListeners.push(handler);
    } else {
      this.errorListeners = [];
    }
  }

  get onerror(): ErrorListener | null {
    return this.errorListeners[this.errorListeners.length - 1] ?? null;
  }

  close() {
    this.closed = true;
    this.readyState = 2;
  }

  emit(type: string, data: unknown) {
    const message = { data: JSON.stringify(data) } as MessageEvent;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(message);
    }
  }

  emitError() {
    const err = new Event("error");
    for (const handler of this.errorListeners) {
      handler(err);
    }
  }

  hasListener(type: string): boolean {
    return (this.listeners.get(type)?.length ?? 0) > 0;
  }
}

describe("connectInsightStream", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers listeners for all 4 expected SSE event types", () => {
    const onProcessedData = vi.fn();
    const onGeneratedInsight = vi.fn();
    const onPoisImported = vi.fn();
    const onPoisImportFailed = vi.fn();
    const onError = vi.fn();

    connectInsightStream("job-1", {
      onProcessedData,
      onGeneratedInsight,
      onPoisImported,
      onPoisImportFailed,
      onError,
    });

    const source = MockEventSource.instances[0];
    expect(source).toBeDefined();
    expect(source.hasListener("processed_data")).toBe(true);
    expect(source.hasListener("generated_insight")).toBe(true);
    expect(source.hasListener("pois_imported")).toBe(true);
    expect(source.hasListener("pois_import_failed")).toBe(true);
  });

  it("routes each SSE event to the correct callback with parsed payload", () => {
    const onProcessedData = vi.fn();
    const onGeneratedInsight = vi.fn();
    const onPoisImported = vi.fn();
    const onPoisImportFailed = vi.fn();
    const onError = vi.fn();

    connectInsightStream("job-2", {
      onProcessedData,
      onGeneratedInsight,
      onPoisImported,
      onPoisImportFailed,
      onError,
    });

    const source = MockEventSource.instances[0];

    const processedData: SseEventBase<ProcessedDataPayload> = {
      type: "PROCESSED_DATA",
      job_id: "job-2",
      municipality_id: 123,
      municipality_name: "Cidade X",
      payload: { municipality_id: 123 } as ProcessedDataPayload,
    };
    source.emit("processed_data", processedData);
    expect(onProcessedData).toHaveBeenCalledWith(processedData);

    const insight: SseEventBase<GeneratedInsightPayload> = {
      type: "GENERATED_INSIGHT",
      job_id: "job-2",
      municipality_id: 123,
      municipality_name: "Cidade X",
      payload: {} as GeneratedInsightPayload,
    };
    source.emit("generated_insight", insight);
    expect(onGeneratedInsight).toHaveBeenCalledWith(insight);

    const pois: SseEventBase<PoisImportedPayload> = {
      type: "POIS_IMPORTED",
      job_id: "job-2",
      municipality_id: 123,
      municipality_name: "Cidade X",
      payload: { count: 42 },
    };
    source.emit("pois_imported", pois);
    expect(onPoisImported).toHaveBeenCalledWith(pois);

    const failed: SseEventBase<PoisImportFailedPayload> = {
      type: "POIS_IMPORT_FAILED",
      job_id: "job-2",
      municipality_id: 123,
      municipality_name: "Cidade X",
      payload: { reason: "boom" },
    };
    source.emit("pois_import_failed", failed);
    expect(onPoisImportFailed).toHaveBeenCalledWith(failed);
  });

  it("does NOT close the connection after generated_insight (POIs may arrive later)", () => {
    const onProcessedData = vi.fn();
    const onGeneratedInsight = vi.fn();
    const onPoisImported = vi.fn();
    const onPoisImportFailed = vi.fn();
    const onError = vi.fn();

    connectInsightStream("job-3", {
      onProcessedData,
      onGeneratedInsight,
      onPoisImported,
      onPoisImportFailed,
      onError,
    });

    const source = MockEventSource.instances[0];

    source.emit("generated_insight", {
      type: "GENERATED_INSIGHT",
      job_id: "job-3",
      municipality_id: 1,
      municipality_name: "X",
      payload: {} as GeneratedInsightPayload,
    });

    expect(onGeneratedInsight).toHaveBeenCalledTimes(1);
    expect(source.closed).toBe(false);
  });

  it("closes the connection on SSE error", () => {
    const onProcessedData = vi.fn();
    const onGeneratedInsight = vi.fn();
    const onPoisImported = vi.fn();
    const onPoisImportFailed = vi.fn();
    const onError = vi.fn();

    connectInsightStream("job-4", {
      onProcessedData,
      onGeneratedInsight,
      onPoisImported,
      onPoisImportFailed,
      onError,
    });

    const source = MockEventSource.instances[0];
    source.emitError();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(source.closed).toBe(true);
  });

  it("returns a cleanup function that closes the connection", () => {
    const onProcessedData = vi.fn();
    const onGeneratedInsight = vi.fn();
    const onPoisImported = vi.fn();
    const onPoisImportFailed = vi.fn();
    const onError = vi.fn();

    const cleanup = connectInsightStream("job-5", {
      onProcessedData,
      onGeneratedInsight,
      onPoisImported,
      onPoisImportFailed,
      onError,
    });

    const source = MockEventSource.instances[0];
    expect(source.closed).toBe(false);
    cleanup();
    expect(source.closed).toBe(true);
  });
});
