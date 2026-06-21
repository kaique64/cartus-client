import { useEffect, useRef, useState } from "react";
import { MunicipalityAutocomplete } from "./MunicipalityAutocomplete";
import { useMunicipalitySearch } from "@/features/search/hooks/useMunicipalitySearch";
import type { IBGEMunicipio, SearchResult } from "@/features/search/types";
import { ANALYSIS_PROFILES } from "@/types/profile";

interface SearchScreenProps {
  onSearch: (result: SearchResult) => void;
}

export function SearchScreen({ onSearch }: SearchScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, suggestions, loading, select } = useMunicipalitySearch();
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = (mun: IBGEMunicipio) => {
    setQuery(`${mun.nome} — ${mun.microrregiao.mesorregiao.UF.sigla}`);
    onSearch({ ...select(mun), profileId: profileId || undefined });
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-background overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, hsl(var(--cyan) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--cyan) / 0.04) 1px, transparent 1px),
            linear-gradient(0deg, hsl(var(--cyan) / 0.08) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--cyan) / 0.08) 1px, transparent 1px)`,
          backgroundSize: "40px 40px, 40px 40px, 200px 200px, 200px 200px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background)) 75%)",
        }}
      />
      <div className="mb-16 animate-fade-in flex flex-col items-center">
        <h1 className="text-6xl md:text-7xl font-bold tracking-[0.15em] font-display cartus-title">
          CARTUS
        </h1>
        <p className="text-muted-foreground text-[10px] tracking-[0.5em] mt-4 font-body uppercase">
          Mapeando o Vazio
        </p>
      </div>
      <div className="w-full max-w-lg relative z-10">
        <MunicipalityAutocomplete
          query={query}
          onQueryChange={setQuery}
          suggestions={suggestions}
          loading={loading}
          onSelect={handleSelect}
          onSubmit={() => suggestions[0] && handleSelect(suggestions[0])}
        />
        <div className="flex items-center border-b border-border mt-6">
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            aria-label="Perfil de análise"
            className="w-full bg-transparent py-3 text-sm font-body text-muted-foreground outline-none appearance-none cursor-pointer"
          >
            <option value="">Nenhum perfil selecionado</option>
            {ANALYSIS_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p
        className="mt-12 text-muted-foreground text-xs font-body tracking-wide opacity-0 animate-fade-in relative z-0"
        style={{ animationDelay: "0.8s" }}
      >
        Descubra carências de infraestrutura e comércio
      </p>
    </div>
  );
}
