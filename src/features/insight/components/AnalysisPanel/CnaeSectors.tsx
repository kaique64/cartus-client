import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { formatNumber } from "@/lib/format";
import type { ProcessedDataPayload } from "@/features/insight/types";

interface CnaeSectorsProps {
  data: ProcessedDataPayload;
}

const SPARK_HEIGHT = 24;

export function CnaeSectors({ data }: CnaeSectorsProps) {
  if (Object.keys(data.companies_by_cnae).length === 0) return null;

  return (
    <Collapsible
      className="mb-8 opacity-0 animate-slide-up"
      style={{ animationDelay: "0.45s" }}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full group cursor-pointer">
        <SectionHeading>SETORES ECONÔMICOS (CNAE)</SectionHeading>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground font-display">
            {Object.keys(data.companies_by_cnae).length} setores
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 collapsible-animate overflow-hidden">
        <div className="space-y-3">
          {Object.entries(data.companies_by_cnae).map(([code, sector]) => {
            const latest = sector.history[sector.history.length - 1];
            const maxCount = Math.max(...sector.history.map((h) => h.count));

            return (
              <div key={code} className="bg-secondary/20 p-3 border border-border/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block truncate">
                      {sector.description}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-display">
                      CNAE {code}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-display text-foreground block">
                      {formatNumber(latest.count)}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      empresas ({latest.year})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {sector.growth.total_pct !== null && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 font-display ${
                        sector.growth.total_pct >= 0
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {sector.growth.total_pct >= 0 ? "+" : ""}
                      {sector.growth.total_pct.toFixed(1)}% total
                    </span>
                  )}
                  {sector.growth.last_5_years_pct !== null && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 font-display ${
                        sector.growth.last_5_years_pct >= 0
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {sector.growth.last_5_years_pct >= 0 ? "+" : ""}
                      {sector.growth.last_5_years_pct.toFixed(1)}% 5a
                    </span>
                  )}
                </div>
                <TooltipProvider delayDuration={0}>
                  <div className="flex gap-px items-end" style={{ height: `${SPARK_HEIGHT}px` }}>
                    {sector.history.map((h) => {
                      const ratio = maxCount > 0 ? h.count / maxCount : 0;
                      return (
                        <Tooltip key={h.year}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex-1 bg-cyan/30 hover:bg-cyan/60 transition-colors cursor-crosshair"
                              style={{ height: `${Math.max(ratio * SPARK_HEIGHT, 1)}px` }}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-background/95 backdrop-blur border-border px-2.5 py-1.5 shadow-lg"
                          >
                            <p className="text-[10px] font-display text-foreground tracking-wider">
                              {h.year}
                            </p>
                            <p className="text-[10px] text-cyan font-display">
                              {formatNumber(h.count)} empresas
                            </p>
                            {h.per_1000_hab != null && (
                              <p className="text-[9px] text-muted-foreground font-display">
                                {h.per_1000_hab.toFixed(2)} / 1.000 hab
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-muted-foreground font-display">
                    {sector.history[0]?.year}
                  </span>
                  <span className="text-[8px] text-muted-foreground font-display">
                    {latest.year}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
