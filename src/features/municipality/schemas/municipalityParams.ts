import { z } from "zod";
import type { MunicipalityParamsError } from "@/features/municipality/hooks/useMunicipalityParams";

const LatSchema = z.coerce
  .number()
  .finite()
  .min(-90, "lat out of range")
  .max(90, "lat out of range");

const LonSchema = z.coerce
  .number()
  .finite()
  .min(-180, "lon out of range")
  .max(180, "lon out of range");

const IbgeSchema = z.coerce
  .number()
  .int()
  .positive();

const BboxSchema = z
  .string()
  .transform((s, ctx) => {
    const parts = s.split(",").map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox must be 4 numbers" });
      return z.NEVER;
    }
    return parts as [number, number, number, number];
  });

export const MunicipalityParamsSchema = z.object({
  name: z.string().min(1),
  lat: LatSchema,
  lon: LonSchema,
  ibge: IbgeSchema,
  bbox: BboxSchema.optional(),
});

export type MunicipalityParamsInput = z.infer<typeof MunicipalityParamsSchema>;

export function mapZodErrorToParamsError(zodError: z.ZodError): MunicipalityParamsError {
  const first = zodError.issues[0];
  if (!first) return { kind: "missing-name" };
  const path = first.path[0];
  if (path === "name") return { kind: "missing-name" };
  if (path === "lat" || path === "lon" || path === "ibge") {
    return { kind: "invalid-number", field: path };
  }
  if (path === "bbox") return { kind: "invalid-bbox" };
  return { kind: "missing-coord" };
}
