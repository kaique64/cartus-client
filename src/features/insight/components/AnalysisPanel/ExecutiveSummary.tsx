import type { GeneratedInsightPayload } from "@/features/insight/types";

interface ExecutiveSummaryProps {
  insight: GeneratedInsightPayload;
}

function resolveProfile(insight: GeneratedInsightPayload): { label: string; classificacao: string; racional: string } | null {
  if ("score_atratividade" in insight) {
    return { label: "Perfil do Mercado Imobiliário", ...insight.perfil_mercado_imobiliario };
  }
  if (!insight.perfil_socioeconomico) return null;
  return { label: "Perfil Socioeconômico", ...insight.perfil_socioeconomico };
}

export function ExecutiveSummary({ insight }: ExecutiveSummaryProps) {
  const profile = resolveProfile(insight);
  return (
    <div className="mb-8 space-y-6 opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div>
        <p className="text-xs text-muted-foreground tracking-[0.2em] mb-4 font-display">
          RESUMO EXECUTIVO
        </p>
        <p className="text-xs text-foreground leading-relaxed">{insight.resumo_executivo}</p>
      </div>
      {profile && (
        <div className="bg-secondary/20 border border-border p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">
              {profile.label}
            </span>
            <span className="text-[10px] bg-cyan/15 text-cyan px-1.5 py-0.5 font-bold uppercase">
              {profile.classificacao}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{profile.racional}</p>
        </div>
      )}
    </div>
  );
}
