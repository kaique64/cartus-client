import type { GeneratedInsightPayload } from "@/features/insight/types";

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="w-full h-px bg-border relative">
      <div
        className="absolute top-0 left-0 h-px bg-cyan transition-all duration-1000"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function resolveScore(insight: GeneratedInsightPayload): { valor: number; justificativa: string } {
  if ("score_oportunidade" in insight) return insight.score_oportunidade;
  return insight.score_atratividade;
}

interface ScoreCardProps {
  insight: GeneratedInsightPayload | null;
}

export function ScoreCard({ insight }: ScoreCardProps) {
  if (!insight) {
    return (
      <div className="mb-6 animate-pulse">
        <span className="text-5xl font-display font-bold text-muted">--</span>
        <span className="text-xs text-muted-foreground ml-2 font-display">/100</span>
        <div className="w-full h-px bg-muted mt-2" />
        <p className="text-[10px] text-muted-foreground mt-2">Calculando score com IA...</p>
      </div>
    );
  }
  const score = resolveScore(insight);
  return (
    <div className="mb-6">
      <span className="text-5xl font-display font-bold text-foreground">{score.valor}</span>
      <span className="text-xs text-muted-foreground ml-2 font-display">/100</span>
      <ScoreBar value={score.valor} />
      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
        {score.justificativa}
      </p>
    </div>
  );
}
