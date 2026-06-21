import { SectionHeading } from "@/components/layout/SectionHeading";
import type { GeneratedInsightPayload, GenericInsightPayload, RealEstateInsightPayload } from "@/features/insight/types";

interface GapsAndOpportunitiesProps {
  insight: GeneratedInsightPayload;
}

const SEVERITY_STYLES: Record<string, string> = {
  alta: "bg-cyan/20 text-cyan",
  media: "bg-yellow-500/20 text-yellow-500",
  baixa: "bg-muted text-muted-foreground",
};

const VIABILITY_STYLES: Record<string, string> = {
  alta: "bg-cyan/20 text-cyan",
  media: "bg-yellow-500/20 text-yellow-500",
  baixa: "bg-muted text-muted-foreground",
};

const IMPACT_STYLES: Record<string, string> = {
  alto: "bg-red-500/20 text-red-400",
  medio: "bg-yellow-500/20 text-yellow-500",
  baixo: "bg-secondary text-foreground/80",
};

function GenericOpportunities({ insight }: { insight: GenericInsightPayload }) {
  return (
    <>
      <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <SectionHeading className="mb-4">GAPS IDENTIFICADOS</SectionHeading>
        <div className="space-y-4">
          {insight.gaps_identificados.map((gap, i) => (
            <div key={i} className="bg-secondary/30 p-3 border border-border/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  {gap.setor}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 uppercase tracking-wider ${
                    SEVERITY_STYLES[gap.severidade] ?? SEVERITY_STYLES.baixa
                  }`}
                >
                  Gap {gap.severidade}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{gap.descricao}</p>
              <p className="text-[10px] text-foreground/70 font-display border-l-2 border-border pl-2">
                {gap.dado_que_suporta}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <SectionHeading className="mb-4">OPORTUNIDADES DE NEGÓCIO</SectionHeading>
        <div className="space-y-4">
          {insight.oportunidades.map((op, i) => (
            <div key={i} className="relative pl-3 border-l-2 border-cyan">
              <span className="text-[11px] font-bold text-foreground block mb-1">
                {op.tipo_negocio}
              </span>
              <p className="text-xs text-muted-foreground mb-2">{op.racional}</p>
              <div className="flex gap-2 text-[9px] uppercase tracking-wider font-display">
                <span className="bg-secondary px-1.5 py-0.5 text-foreground/80">
                  Capital: {op.capital_estimado}
                </span>
                <span className="bg-secondary px-1.5 py-0.5 text-foreground/80">
                  Risco: {op.perfil_investidor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RealEstateOpportunities({ insight }: { insight: RealEstateInsightPayload }) {
  return (
    <>
      <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <SectionHeading className="mb-4">OPORTUNIDADES IMOBILIÁRIAS</SectionHeading>
        <div className="space-y-4">
          {insight.oportunidades.map((op, i) => (
            <div key={i} className="relative pl-3 border-l-2 border-cyan">
              <span className="text-[11px] font-bold text-foreground block mb-1 uppercase tracking-wider">
                {op.segmento.replace(/_/g, " ")}
              </span>
              <p className="text-xs text-muted-foreground mb-2">{op.racional}</p>
              <p className="text-[10px] text-foreground/70 font-display border-l-2 border-border pl-2 mb-2">
                {op.dado_que_suporta}
              </p>
              <div className="flex gap-2 text-[9px] uppercase tracking-wider font-display">
                <span
                  className={`px-1.5 py-0.5 ${
                    VIABILITY_STYLES[op.viabilidade] ?? VIABILITY_STYLES.baixa
                  }`}
                >
                  Viab. {op.viabilidade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function GapsAndOpportunities({ insight }: GapsAndOpportunitiesProps) {
  return (
    <>
      <div className="border-t border-border my-6" />

      {"gaps_identificados" in insight ? (
        <GenericOpportunities insight={insight} />
      ) : (
        <RealEstateOpportunities insight={insight} />
      )}

      <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.7s" }}>
        <SectionHeading className="mb-4">FATORES DE RISCO</SectionHeading>
        <div className="space-y-4">
          {insight.riscos.map((risco, i) => (
            <div key={i} className="relative pl-3 border-l-2 border-red-500/50">
              <span className="text-[11px] font-bold text-foreground block mb-1">
                {risco.fator}
              </span>
              <p className="text-xs text-muted-foreground mb-2">{risco.descricao}</p>
              <div className="flex gap-2 text-[9px] uppercase tracking-wider font-display">
                <span
                  className={`px-1.5 py-0.5 ${
                    IMPACT_STYLES[risco.impacto] ?? IMPACT_STYLES.baixo
                  }`}
                >
                  Impacto {risco.impacto}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
