import { ArrowLeft } from "lucide-react";
import { OverlayButton } from "@/components/layout/OverlayButton";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <OverlayButton
      position="top-left"
      icon={<ArrowLeft className="w-3 h-3" />}
      onClick={onClick}
      ariaLabel="Voltar para a tela de busca"
    >
      NOVA BUSCA
    </OverlayButton>
  );
}
