import { AlertCircle, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/feedback/Spinner";
import { Separator } from "@/components/layout/Separator";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { SearchResult } from "@/features/search/types";
import type {
  InsightStreamStatus,
  ProcessedDataPayload,
  GeneratedInsightPayload,
} from "@/features/insight/types";
import { ScoreCard } from "./ScoreCard";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { DemographicsBlock } from "./DemographicsBlock";
import { IncomeDistribution } from "./IncomeDistribution";
import { CnaeSectors } from "./CnaeSectors";
import { GapsAndOpportunities } from "./GapsAndOpportunities";

interface AnalysisPanelProps {
  result: SearchResult;
  status: InsightStreamStatus;
  processedData: ProcessedDataPayload | null;
  insight: GeneratedInsightPayload | null;
  error: string | null;
  onRetry: () => void;
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 font-body h-full flex flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}

export function AnalysisPanel({
  result,
  status,
  processedData,
  insight,
  error,
  onRetry,
}: AnalysisPanelProps) {
  if (status === "error") {
    return (
      <CenteredMessage>
        <AlertCircle className="w-8 h-8 text-destructive mb-4" />
        <p className="text-sm text-foreground mb-2">Erro ao carregar dados</p>
        <p className="text-xs text-muted-foreground mb-6 max-w-[250px]">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs text-cyan hover:text-cyan/80 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          TENTAR NOVAMENTE
        </button>
      </CenteredMessage>
    );
  }

  if (status === "idle" || status === "requesting") {
    return (
      <CenteredMessage>
        <Spinner size="md" className="mb-4" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Iniciando varredura em {result.name}...
        </p>
      </CenteredMessage>
    );
  }

  if (status === "streaming" && !processedData) {
    return (
      <CenteredMessage>
        <Spinner size="md" className="mb-4" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Coletando dados demográficos e econômicos...
        </p>
      </CenteredMessage>
    );
  }

  return (
    <div className="p-6 font-body">
      <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <SectionHeading className="mb-4">ANÁLISE DE CARÊNCIA</SectionHeading>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {processedData?.municipality_name} — {processedData?.uf}
        </p>
        <ScoreCard insight={insight} />
      </div>

      <Separator />

      {insight && <ExecutiveSummary insight={insight} />}

      {processedData && (
        <>
          <DemographicsBlock data={processedData} />
          <Separator />
          <IncomeDistribution data={processedData} />
          <Separator />
          <CnaeSectors data={processedData} />
        </>
      )}

      {status === "partial" && !insight && (
        <div className="py-8 flex flex-col items-center justify-center text-center border-t border-border mt-6">
          <Spinner size="md" className="mb-4" />
          <p className="text-xs text-muted-foreground animate-pulse">
            IA analisando dados para extrair oportunidades...
          </p>
        </div>
      )}

      {insight && <GapsAndOpportunities insight={insight} />}

      <div className="border-t border-border mt-8 pt-4 pb-4 flex justify-between items-end">
        <p className="text-[9px] text-muted-foreground font-display tracking-[0.15em] uppercase">
          {status === "complete" ? "CARTUS — ANÁLISE CONCLUÍDA" : "CARTUS — MAPEANDO..."}
        </p>
        {status === "complete" && insight && (
          <p className="text-[9px] text-muted-foreground font-display text-right">
            {new Date(insight.data_analise).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
