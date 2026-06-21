const DEFAULT_BFF_URL = "http://localhost:3000/api/v1";

export const BFF_BASE_URL: string =
  (import.meta.env.VITE_BFF_URL as string | undefined) ?? DEFAULT_BFF_URL;
