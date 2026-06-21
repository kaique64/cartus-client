import { SectionHeading } from "@/components/layout/SectionHeading";
import { formatBRL } from "@/lib/format";
import type { ProcessedDataPayload } from "@/features/insight/types";

interface IncomeDistributionProps {
  data: ProcessedDataPayload;
}

interface RowProps {
  label: string;
  pct: number;
  isMax: boolean;
}

function IncomeBarRow({ label, pct, isMax }: RowProps) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground w-12">{label}</span>
      <div className="flex-1 mx-2 h-1 bg-border relative">
        <div
          className={`absolute top-0 left-0 h-full transition-colors duration-500 ${
            isMax ? "bg-cyan" : "bg-muted-foreground/30"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-display w-8 text-right text-foreground">{pct}%</span>
    </div>
  );
}

export function IncomeDistribution({ data }: IncomeDistributionProps) {
  const dist = data.income_class_distribution;
  const maxPct = Math.max(dist.ab_pct, dist.c_pct, dist.de_pct);

  return (
    <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.4s" }}>
      <SectionHeading className="mb-4">PERFIL ECONÔMICO</SectionHeading>
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">PIB Total</span>
          <span className="text-xs font-display text-foreground">{formatBRL(data.pib)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">PIB per capita</span>
          <span className="text-xs font-display text-foreground">{formatBRL(data.pib_per_capita)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted-foreground">Renda Média Domiciliar</span>
          <span className="text-xs font-display text-foreground">{formatBRL(data.household_income)}</span>
        </div>
      </div>
      <div className="space-y-2">
        <IncomeBarRow label="A/B" pct={dist.ab_pct} isMax={dist.ab_pct === maxPct} />
        <IncomeBarRow label="C" pct={dist.c_pct} isMax={dist.c_pct === maxPct} />
        <IncomeBarRow label="D/E" pct={dist.de_pct} isMax={dist.de_pct === maxPct} />
      </div>
    </div>
  );
}
