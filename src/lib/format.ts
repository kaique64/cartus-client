const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const NUM = new Intl.NumberFormat("pt-BR");

export function formatBRL(value: number): string {
  return BRL.format(value);
}

export function formatNumber(value: number): string {
  return NUM.format(value);
}

export function formatPct(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits).replace(".", ",")}%`;
}
