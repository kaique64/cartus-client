import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapView } from "@/features/poi/components/MapView";
import { AnalysisPanel } from "@/features/insight/components/AnalysisPanel";
import { useInsightStream } from "@/features/insight/hooks/useInsightStream";
import { usePois } from "@/features/poi/hooks/usePois";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMunicipalityParams } from "@/features/municipality/hooks/useMunicipalityParams";
import { InvalidParamsMessage } from "@/features/municipality/components/InvalidParamsMessage";
import type { MunicipalityParams } from "@/features/municipality/types";

const MapPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const paramsResult = useMunicipalityParams(searchParams);

  const result: MunicipalityParams | null = paramsResult.ok ? paramsResult.value : null;

  const cityName = useMemo(() => {
    if (!result) return null;
    const sep = result.name.indexOf(" — ");
    return sep !== -1 ? result.name.substring(0, sep) : result.name;
  }, [result]);

  const profileId = searchParams.get("profile") ?? undefined;

  const { status, processedData, insight, geoJson, error, retry, poisImported, poiFailed } =
    useInsightStream(cityName, profileId);

  const ibgeCode = result?.ibgeCode ?? null;
  const { pois, loading: fetchLoadingPois, categoriesSummary } = usePois(ibgeCode, !!poisImported);

  const poisLoading =
    !!processedData && ((!poisImported && !poiFailed) || fetchLoadingPois);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (!paramsResult.ok) {
    return <InvalidParamsMessage error={paramsResult.error} />;
  }

  if (!result) return null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className="h-full w-full"
      >
        <ResizablePanel defaultSize={75} minSize={40}>
          <div className="relative h-full w-full">
            <MapView
              result={result}
              onBack={handleBack}
              geoJson={geoJson}
              pois={pois}
              poisLoading={poisLoading}
              categoriesSummary={categoriesSummary}
              poiFailed={poiFailed}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
          <div className="h-full overflow-y-auto">
            <AnalysisPanel
              result={result}
              status={status}
              processedData={processedData}
              insight={insight}
              error={error}
              onRetry={retry}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MapPage;
