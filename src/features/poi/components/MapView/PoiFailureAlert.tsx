import { Alert } from "@/components/feedback/Alert";

interface PoiFailureAlertProps {
  reason: string;
}

export function PoiFailureAlert({ reason }: PoiFailureAlertProps) {
  return (
    <Alert variant="destructive" position="top-center">
      POIs não disponíveis: {reason}
    </Alert>
  );
}
