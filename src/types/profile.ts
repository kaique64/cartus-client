import type { ComponentType } from "react";
import { Home } from "lucide-react";

export type ProfileId = "real_estate_agent";

export interface AnalysisProfile {
  id: ProfileId;
  label: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}

export const ANALYSIS_PROFILES: AnalysisProfile[] = [
  {
    id: "real_estate_agent",
    label: "Corretor de imóveis",
    description: "Mercado imobiliário, demanda e atratividade regional",
    Icon: Home,
  },
];
