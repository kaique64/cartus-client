import type { GeneratedInsightPayload } from "@/features/insight/types";

interface ExecutiveSummaryProps {
  insight: GeneratedInsightPayload;
}

export function ExecutiveSummary({ insight }: ExecutiveSummaryProps) {
  return (
    <div className="mb-8 space-y-6 opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div>
        <p className="text-xs text-muted-foreground tracking-[0.2em] mb-4 font-display">
          RESUMO EXECUTIVO
        </p>
        <p className="text-xs text-foreground leading-relaxed">{insight.resumo_executivo}</p>
      </div>
      <div className="bg-secondary/20 border border-border p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">
            Perfil Socioeconômico
          </span>
          <span className="text-[10px] bg-cyan/15 text-cyan px-1.5 py-0.5 font-bold uppercase">
            {insight.perfil_socioeconomico.classificacao}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {insight.perfil_socioeconomico.racional}
        </p>
      </div>
    </div>
  );
}
