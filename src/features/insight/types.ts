// ─── BFF Response: POST /insights/request ────────────────────────────
export interface InsightRequestResponse {
  job_id: string;
  status: "ACCEPTED";
  message: string;
}

// ─── SSE Envelope ────────────────────────────────────────────────────
export interface SseEventBase<
  T =
    | ProcessedDataPayload
    | GeneratedInsightPayload
    | PoisImportedPayload
    | PoisImportFailedPayload,
> {
  type: "PROCESSED_DATA" | "GENERATED_INSIGHT" | "POIS_IMPORTED" | "POIS_IMPORT_FAILED";
  job_id: string;
  municipality_id: number;
  municipality_name: string;
  payload: T;
}

// ─── Payload: processed_data ─────────────────────────────────────────
export interface ProcessedDataPayload {
  municipality_id: number;
  municipality_name: string;
  uf: string;
  population: number;
  population_year: number;
  pib: number;
  pib_per_capita: number;
  population_density: number;
  household_income: number;

  income_class_distribution: {
    ab_pct: number;
    c_pct: number;
    de_pct: number;
  };

  age_groups: Array<{
    age_range: string;
    population: number;
    year: number;
  }>;
  dominant_age_segment: string;

  companies_by_cnae: Record<
    string,
    {
      description: string;
      growth: {
        total_pct: number | null;
        last_5_years_pct: number | null;
      };
      history: Array<{
        year: number;
        count: number;
        per_1000_hab: number | null;
      }>;
    }
  >;
}

// ─── Payload: generated_insight ──────────────────────────────────────
export interface GeneratedInsightPayload {
  data_analise: string;
  resumo_executivo: string;

  perfil_socioeconomico: {
    classificacao: string;
    racional: string;
  };

  gaps_identificados: Array<{
    setor: string;
    cnae_referencia: string | null;
    severidade: "alta" | "media" | "baixa";
    descricao: string;
    dado_que_suporta: string;
  }>;

  oportunidades: Array<{
    tipo_negocio: string;
    cnae_sugerido: string;
    perfil_investidor: string;
    capital_estimado: "alto" | "medio" | "baixo";
    viabilidade: "alta" | "media" | "baixa";
    racional: string;
  }>;

  riscos: Array<{
    fator: string;
    impacto: "alto" | "medio" | "baixo";
    descricao: string;
  }>;

  score_oportunidade: {
    valor: number;
    justificativa: string;
  };

  dimensoes_cruzadas: string[];
}

// ─── Payload: pois_imported ──────────────────────────────────────────
export interface PoisImportedPayload {
  count: number;
}

// ─── Payload: pois_import_failed ─────────────────────────────────────
export interface PoisImportFailedPayload {
  reason: string;
}

// ─── Hook state ──────────────────────────────────────────────────────
export type InsightStreamStatus =
  | "idle"
  | "requesting"
  | "streaming"
  | "partial"
  | "complete"
  | "error";
