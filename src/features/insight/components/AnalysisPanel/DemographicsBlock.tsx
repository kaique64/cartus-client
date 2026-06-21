import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { formatNumber } from "@/lib/format";
import type { ProcessedDataPayload } from "@/features/insight/types";

interface DemographicsBlockProps {
  data: ProcessedDataPayload;
}

const BAR_MAX_HEIGHT = 56;

export function DemographicsBlock({ data }: DemographicsBlockProps) {
  const maxPop = Math.max(...data.age_groups.map((g) => g.population));
  const totalPop = data.age_groups.reduce((sum, g) => sum + g.population, 0);

  return (
    <div className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <SectionHeading className="mb-4">DEMOGRAFIA ({data.population_year})</SectionHeading>
      <div className="flex justify-between text-xs mb-6">
        <div>
          <span className="text-muted-foreground">População</span>
          <span className="text-foreground font-display ml-2 block mt-1">
            {formatNumber(data.population)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground">Densidade</span>
          <span className="text-foreground font-display ml-2 block mt-1">
            {formatNumber(data.population_density)} hab/km²
          </span>
        </div>
      </div>
      <TooltipProvider delayDuration={0}>
        <div className="flex gap-1 items-end h-16">
          {data.age_groups.map((group) => {
            const ratio = maxPop > 0 ? group.population / maxPop : 0;
            const pct = totalPop > 0 ? ((group.population / totalPop) * 100).toFixed(1) : "0";
            const isDominant = group.age_range === data.dominant_age_segment;
            return (
              <Tooltip key={group.age_range}>
                <TooltipTrigger asChild>
                  <div className="flex-1 flex flex-col items-center cursor-crosshair">
                    <div
                      className={`w-full transition-all duration-700 ${
                        isDominant ? "bg-cyan/50" : "bg-muted-foreground/30"
                      }`}
                      style={{ height: `${Math.max(ratio * BAR_MAX_HEIGHT, 2)}px` }}
                    />
                    <span className="text-[9px] text-muted-foreground mt-1 font-display truncate w-full text-center">
                      {group.age_range}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-background/95 backdrop-blur border-border px-2.5 py-1.5 shadow-lg"
                >
                  <p className="text-[10px] font-display text-foreground tracking-wider">
                    {group.age_range} anos
                  </p>
                  <p className="text-[10px] text-cyan font-display">
                    {formatNumber(group.population)} hab
                  </p>
                  <p className="text-[9px] text-muted-foreground font-display">
                    {pct}% da população
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
