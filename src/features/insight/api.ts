import type {
  InsightRequestResponse,
  SseEventBase,
  ProcessedDataPayload,
  GeneratedInsightPayload,
  PoisImportedPayload,
  PoisImportFailedPayload,
} from "@/features/insight/types";
import { BFF_BASE_URL } from "@/lib/env";

export async function requestInsight(cityName: string, profileId?: string): Promise<InsightRequestResponse> {
  const res = await fetch(`${BFF_BASE_URL}/insights/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: cityName, ...(profileId ? { profile_id: profileId } : {}) }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao solicitar insight (${res.status}): ${body || res.statusText}`);
  }
  return res.json();
}

export interface StreamCallbacks {
  onProcessedData: (event: SseEventBase<ProcessedDataPayload>) => void;
  onGeneratedInsight: (event: SseEventBase<GeneratedInsightPayload>) => void;
  onPoisImported: (event: SseEventBase<PoisImportedPayload>) => void;
  onPoisImportFailed: (event: SseEventBase<PoisImportFailedPayload>) => void;
  onError: (error: Event) => void;
}

export function connectInsightStream(jobId: string, callbacks: StreamCallbacks): () => void {
  const url = `${BFF_BASE_URL}/insights/stream?job_id=${jobId}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener("processed_data", (event: MessageEvent) => {
    const data = JSON.parse(event.data) as SseEventBase<ProcessedDataPayload>;
    callbacks.onProcessedData(data);
  });
  eventSource.addEventListener("generated_insight", (event: MessageEvent) => {
    const data = JSON.parse(event.data) as SseEventBase<GeneratedInsightPayload>;
    callbacks.onGeneratedInsight(data);
  });
  eventSource.addEventListener("pois_imported", (event: MessageEvent) => {
    const data = JSON.parse(event.data) as SseEventBase<PoisImportedPayload>;
    callbacks.onPoisImported(data);
  });
  eventSource.addEventListener("pois_import_failed", (event: MessageEvent) => {
    const data = JSON.parse(event.data) as SseEventBase<PoisImportFailedPayload>;
    callbacks.onPoisImportFailed(data);
  });
  eventSource.onerror = (error) => {
    callbacks.onError(error);
    eventSource.close();
  };

  return () => eventSource.close();
}

export async function fetchMunicipalityMesh(
  municipalityId: number,
  signal?: AbortSignal
): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(`${BFF_BASE_URL}/municipalities/${municipalityId}/mesh`, { signal });
  if (!res.ok) {
    throw new Error(`Falha ao buscar malha geográfica (${res.status})`);
  }
  return res.json();
}
