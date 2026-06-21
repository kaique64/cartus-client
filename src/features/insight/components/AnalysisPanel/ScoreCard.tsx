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
  return (
    <div className="mb-6">
      <span className="text-5xl font-display font-bold text-foreground">
        {insight.score_oportunidade.valor}
      </span>
      <span className="text-xs text-muted-foreground ml-2 font-display">/100</span>
      <ScoreBar value={insight.score_oportunidade.valor} />
      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
        {insight.score_oportunidade.justificativa}
      </p>
    </div>
  );
}
