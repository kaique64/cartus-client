import type { ComponentType } from "react";
import { Home } from "lucide-react";

export interface AnalysisProfile {
  id: string;
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
