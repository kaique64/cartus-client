import { describe, it, expect } from "vitest";
import { formatBRL, formatNumber, formatPct } from "@/lib/format";

describe("formatBRL", () => {
  it("formats positive numbers as BRL currency", () => {
    expect(formatBRL(1234.56)).toBe("R$\u00a01.234,56");
  });
  it("formats zero", () => {
    expect(formatBRL(0)).toBe("R$\u00a00,00");
  });
});

describe("formatNumber", () => {
  it("formats integers with thousand separators", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });
  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPct", () => {
  it("formats a percentage with 1 decimal place", () => {
    expect(formatPct(12.5)).toBe("12,5%");
  });
  it("formats zero", () => {
    expect(formatPct(0)).toBe("0,0%");
  });
});
