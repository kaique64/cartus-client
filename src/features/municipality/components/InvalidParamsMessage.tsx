import { useNavigate } from "react-router-dom";
import type { MunicipalityParamsError } from "@/features/municipality/hooks/useMunicipalityParams";

function describeError(error: MunicipalityParamsError): string {
  switch (error.kind) {
    case "missing-name":
      return "Faltando o nome do município na URL.";
    case "missing-coord":
      return "Faltando coordenadas ou código IBGE na URL.";
    case "invalid-number":
      return `Valor inválido para "${error.field}" na URL.`;
    case "invalid-bbox":
      return "Bounding box inválida na URL.";
  }
}

export function InvalidParamsMessage({ error }: { error: MunicipalityParamsError }) {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background p-6">
      <div
        role="alert"
        className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg flex flex-col gap-4"
      >
        <h1 className="text-lg font-display tracking-wide text-foreground">
          Parâmetros inválidos
        </h1>
        <p className="text-sm text-muted-foreground font-body">{describeError(error)}</p>
        <button
          onClick={() => navigate("/")}
          className="self-start px-4 py-2 bg-cyan text-background rounded text-sm font-display tracking-wider hover:opacity-90 transition-opacity"
        >
          Voltar para a busca
        </button>
      </div>
    </div>
  );
}
