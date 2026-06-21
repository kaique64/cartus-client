import { useState } from "react";
import { Search } from "lucide-react";
import { Spinner } from "@/components/feedback/Spinner";
import type { IBGEMunicipio } from "@/features/search/types";

interface MunicipalityAutocompleteProps {
  query: string;
  onQueryChange: (q: string) => void;
  suggestions: IBGEMunicipio[];
  loading: boolean;
  onSelect: (mun: IBGEMunicipio) => void;
  onSubmit: () => void;
}

export function MunicipalityAutocomplete({
  query,
  onQueryChange,
  suggestions,
  loading,
  onSelect,
  onSubmit,
}: MunicipalityAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative w-full max-w-lg animate-slide-up z-10"
      style={{ animationDelay: "0.2s" }}
    >
      <div
        className={`flex items-center border-b transition-colors duration-300 ${
          focused ? "border-cyan" : "border-border"
        }`}
      >
        <Search className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Digite o nome de um município"
          aria-label="Buscar município"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls="municipality-suggestions"
          className="w-full bg-transparent py-4 text-foreground font-body text-base placeholder:text-muted-foreground outline-none"
        />
        {loading && <Spinner size="sm" className="flex-shrink-0" />}
      </div>
      {suggestions.length > 0 && (
        <ul
          id="municipality-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-secondary z-50"
        >
          {suggestions.map((m) => (
            <li key={m.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => onSelect(m)}
                className="w-full text-left px-4 py-3 text-sm font-body text-muted-foreground hover:text-cyan hover:bg-background transition-colors border-b border-border last:border-b-0"
              >
                {m.nome} — <span className="text-cyan/60">{m.microrregiao.mesorregiao.UF.sigla}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
