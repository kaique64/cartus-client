import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { MunicipalityAutocomplete } from "./MunicipalityAutocomplete";
import { useMunicipalitySearch } from "@/features/search/hooks/useMunicipalitySearch";
import type { IBGEMunicipio, SearchResult } from "@/features/search/types";
import { ANALYSIS_PROFILES, type ProfileId } from "@/types/profile";

interface SearchScreenProps {
  onSearch: (result: SearchResult) => void;
}

export function SearchScreen({ onSearch }: SearchScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, suggestions, loading, select } = useMunicipalitySearch();
  const [profileId, setProfileId] = useState<ProfileId | "">("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedProfile = ANALYSIS_PROFILES.find((p) => p.id === profileId) ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
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
        <div ref={dropdownRef} className="relative mt-6">
          <button
            type="button"
            aria-label="Selecionar perfil de análise"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((v) => !v)}
            className={`w-full flex items-center gap-3 py-3 border-b transition-colors duration-300 ${
              dropdownOpen ? "border-cyan" : "border-border"
            }`}
          >
            {selectedProfile ? (
              <selectedProfile.Icon className="w-4 h-4 text-cyan shrink-0" />
            ) : (
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={`flex-1 text-left text-sm font-body ${
                selectedProfile ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {selectedProfile ? selectedProfile.label : "Nenhum perfil selecionado"}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {selectedProfile && (
                <span
                  role="button"
                  aria-label="Remover perfil"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileId("");
                    setDropdownOpen(false);
                  }}
                  className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-border z-20 animate-slide-up">
              <button
                type="button"
                onClick={() => { setProfileId(""); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border/50 hover:bg-background/40 transition-colors group"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-muted-foreground">Nenhum perfil</p>
                  <p className="text-[10px] text-muted-foreground/60 font-body mt-0.5">Análise genérica de mercado</p>
                </div>
                {!selectedProfile && (
                  <span className="text-[9px] text-cyan font-display tracking-wider shrink-0">ATIVO</span>
                )}
              </button>
              {ANALYSIS_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setProfileId(p.id); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-background/40 transition-colors last:border-0 border-b border-border/50"
                >
                  <p.Icon className="w-4 h-4 text-cyan shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-foreground">{p.label}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">{p.description}</p>
                  </div>
                  {selectedProfile?.id === p.id && (
                    <span className="text-[9px] text-cyan font-display tracking-wider shrink-0">ATIVO</span>
                  )}
                </button>
              ))}
            </div>
          )}
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
