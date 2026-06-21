import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  ProcessedDataPayload,
  GeneratedInsightPayload,
  PoisImportedPayload,
  InsightStreamStatus,
} from "@/features/insight/types";
import {
  requestInsight,
  connectInsightStream,
  fetchMunicipalityMesh,
} from "@/features/insight/api";

const SSE_TIMEOUT_MS = 90_000;
const MESH_STALE_TIME_MS = 60 * 60 * 1000;

export interface InsightStreamState {
  status: InsightStreamStatus;
  processedData: ProcessedDataPayload | null;
  insight: GeneratedInsightPayload | null;
  geoJson: GeoJSON.FeatureCollection | null;
  error: string | null;
  poisImported: PoisImportedPayload | null;
  poiFailed: { reason: string } | null;
}

const INITIAL_STATE: InsightStreamState = {
  status: "idle",
  processedData: null,
  insight: null,
  geoJson: null,
  error: null,
  poisImported: null,
  poiFailed: null,
};

const MESH_KEY = (id: number) => ["municipality-mesh", id] as const;

export function useInsightStream(cityName: string | null, profileId?: string) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<InsightStreamState>(INITIAL_STATE);

  const cleanupRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const receivedRef = useRef<Set<string>>(new Set());

  const doCleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  const maybeClose = useCallback(() => {
    const r = receivedRef.current;
    const hasPoi = r.has("pois_imported") || r.has("pois_import_failed");
    if (r.has("processed_data") && hasPoi && r.has("generated_insight")) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    }
  }, []);

  const retry = useCallback(() => {
    doCleanup();
    receivedRef.current = new Set();
    setState(INITIAL_STATE);
  }, [doCleanup]);

  useEffect(() => {
    if (!cityName) return;

    let cancelled = false;
    const target = cityName;
    const profile = profileId;

    receivedRef.current = new Set();
    setState(INITIAL_STATE);

    async function run() {
      setState((prev) => ({ ...prev, status: "requesting", error: null }));

      try {
        const { job_id } = await requestInsight(target, profile);

        if (cancelled) return;

        setState((prev) => ({ ...prev, status: "streaming" }));

        timeoutRef.current = setTimeout(() => {
          doCleanup();
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "O processamento demorou mais do que o esperado. Tente novamente.",
          }));
        }, SSE_TIMEOUT_MS);

        const closeStream = connectInsightStream(job_id, {
          onProcessedData: (event) => {
            if (cancelled) return;

            receivedRef.current.add("processed_data");
            setState((prev) => ({
              ...prev,
              status: "partial",
              processedData: event.payload,
            }));

            queryClient
              .fetchQuery({
                queryKey: MESH_KEY(event.municipality_id),
                queryFn: ({ signal }) => fetchMunicipalityMesh(event.municipality_id, signal),
                staleTime: MESH_STALE_TIME_MS,
              })
              .then((geoJson) => {
                if (cancelled) return;
                setState((prev) => ({ ...prev, geoJson }));
              })
              .catch((err) => {
                console.error("Erro ao buscar malha geográfica:", err);
              });

            maybeClose();
          },

          onPoisImported: (event) => {
            if (cancelled) return;
            receivedRef.current.add("pois_imported");
            setState((prev) => ({ ...prev, poisImported: event.payload }));
            maybeClose();
          },

          onPoisImportFailed: (event) => {
            if (cancelled) return;
            receivedRef.current.add("pois_import_failed");
            setState((prev) => ({
              ...prev,
              poiFailed: { reason: event.payload.reason },
            }));
            maybeClose();
          },

          onGeneratedInsight: (event) => {
            if (cancelled) return;
            receivedRef.current.add("generated_insight");
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setState((prev) => ({
              ...prev,
              status: "complete",
              insight: event.payload,
            }));
            maybeClose();
          },

          onError: () => {
            if (cancelled) return;
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Conexão com o servidor perdida. Verifique se o BFF está rodando.",
            }));
          },
        });

        cleanupRef.current = closeStream;
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          status: "error",
          error:
            err instanceof Error
              ? err.message
              : "Erro inesperado ao solicitar insight.",
        }));
      }
    }

    run();

    return () => {
      cancelled = true;
      doCleanup();
    };
  }, [cityName, profileId, doCleanup, maybeClose, queryClient]);

  useEffect(() => {
    return () => doCleanup();
  }, [doCleanup]);

  return {
    ...state,
    retry,
  };
}
