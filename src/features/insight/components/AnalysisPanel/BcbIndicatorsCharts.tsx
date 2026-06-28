import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Expand, X } from "lucide-react";
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
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { BcbIndicatorSeries } from "@/features/insight/types";

interface BcbIndicatorsChartsProps {
  indicators: BcbIndicatorSeries[] | null | undefined;
}

const SPARK_HEIGHT = 40;
const CHART_HEIGHT = 120;
const MAX_BARS = 60;

interface Point {
  date: string;
  value: number;
}

function zipSeries(series: BcbIndicatorSeries): Point[] {
  return series.labels.map((date, i) => ({ date, value: series.data[i] ?? 0 }));
}

function downsample(points: Point[], maxBars: number): Point[] {
  if (points.length <= maxBars) return points;
  const step = points.length / maxBars;
  const result: Point[] = [];
  for (let i = 0; i < maxBars; i++) {
    result.push(points[Math.round(i * step)]);
  }
  const last = points[points.length - 1];
  if (result[result.length - 1] !== last) result.push(last);
  return result;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function formatValue(value: number, unit: string): string {
  if (unit === "%") {
    const decimals = Math.abs(value) < 0.1 ? 4 : 2;
    return `${value.toFixed(decimals).replace(".", ",")}%`;
  }
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(value);
}

function formatTrend(trend: number, unit: string): string {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${formatValue(trend, unit)}`;
}

interface BarChartProps {
  series: BcbIndicatorSeries;
  height: number;
  maxBars?: number;
  showLabels?: boolean;
}

function BarChart({ series, height, maxBars = MAX_BARS, showLabels = false }: BarChartProps) {
  const allPoints = zipSeries(series);
  const points = downsample(allPoints, maxBars);

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const latest = allPoints[allPoints.length - 1];
  const first = allPoints[0];
  const trend = latest && first ? latest.value - first.value : 0;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-px items-end" style={{ height: `${height}px` }}>
        {points.map((point, i) => {
          const isNeg = point.value < 0;
          const ratio = (point.value - min) / range;
          const barH = Math.max(ratio * height, 2);
          const isLast = i === points.length - 1;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className={`flex-1 cursor-crosshair transition-colors ${
                    isNeg
                      ? isLast
                        ? "bg-red-400/70 hover:bg-red-400"
                        : "bg-red-400/30 hover:bg-red-400/60"
                      : isLast
                      ? "bg-cyan/70 hover:bg-cyan"
                      : "bg-cyan/25 hover:bg-cyan/50"
                  }`}
                  style={{ height: `${barH}px` }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-background/95 backdrop-blur border-border px-2.5 py-1.5 shadow-lg"
              >
                <p className="text-[10px] font-display text-foreground tracking-wider">
                  {formatDate(point.date)}
                </p>
                <p className="text-[10px] text-cyan font-display">
                  {formatValue(point.value, series.unit)}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {showLabels && allPoints.length >= 2 && (
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-muted-foreground font-display">
            {formatDate(allPoints[0].date)}
          </span>
          <span className="text-[8px] text-muted-foreground font-display">
            {formatDate(allPoints[allPoints.length - 1].date)}
          </span>
        </div>
      )}

      {latest && (
        <div className="flex justify-between items-baseline mt-2">
          <span className="text-xs font-display text-foreground">
            {formatValue(latest.value, series.unit)}
          </span>
          <span
            className={`text-[9px] font-display px-1 py-0.5 ${
              trend > 0
                ? "bg-emerald-500/15 text-emerald-400"
                : trend < 0
                ? "bg-red-500/15 text-red-400"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {formatTrend(trend, series.unit)}
          </span>
        </div>
      )}
    </TooltipProvider>
  );
}

function ExpandedDialog({
  indicators,
  onClose,
}: {
  indicators: BcbIndicatorSeries[];
  onClose: () => void;
}) {
  useEscapeKey(onClose);

  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background border border-border shadow-2xl p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-muted-foreground tracking-[0.2em] font-display">
            INDICADORES BCB — HISTÓRICO DETALHADO
          </p>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {indicators.map((series) => (
            <div key={series.key} className="bg-secondary/20 border border-border/30 p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-tight">
                  {series.label}
                </span>
                <span className="text-[9px] text-muted-foreground font-display ml-2 shrink-0">
                  {series.unit}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground font-display block mb-3">
                {series.frequency === "daily" ? "diário" : "mensal"} · {series.labels.length} pontos
              </span>
              <BarChart series={series} height={CHART_HEIGHT} maxBars={80} showLabels />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function BcbIndicatorsCharts({ indicators }: BcbIndicatorsChartsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasData = indicators != null && indicators.length > 0;

  return (
    <>
      <Collapsible
        className="mb-8 opacity-0 animate-slide-up"
        style={{ animationDelay: "0.55s" }}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full group cursor-pointer">
          <SectionHeading>INDICADORES BCB</SectionHeading>
          <div className="flex items-center gap-2">
            {hasData && (
              <>
                <span className="text-[9px] text-muted-foreground font-display">
                  {indicators.length} séries
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialogOpen(true);
                  }}
                  className="text-muted-foreground hover:text-cyan transition-colors"
                  aria-label="Expandir gráficos BCB"
                >
                  <Expand className="w-3 h-3" />
                </button>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 collapsible-animate overflow-hidden">
          {!hasData ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Informações do Banco Central não disponíveis para este município.
            </p>
          ) : (
            <div className="space-y-4">
              {indicators.map((series) => (
                <div key={series.key} className="bg-secondary/20 p-3 border border-border/30">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block truncate">
                        {series.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-display">
                        {series.unit} · {series.frequency === "daily" ? "diário" : "mensal"}
                      </span>
                    </div>
                  </div>
                  <BarChart series={series} height={SPARK_HEIGHT} showLabels />
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {dialogOpen && hasData && (
        <ExpandedDialog indicators={indicators} onClose={() => setDialogOpen(false)} />
      )}
    </>
  );
}
