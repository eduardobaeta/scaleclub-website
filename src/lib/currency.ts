const formatters = new Map<number, Intl.NumberFormat>();

/** Brazilian real, e.g. "R$ 4.500,00" with cents or "R$ 590" without. */
export function formatBrl(value: number, { cents = false }: { cents?: boolean } = {}): string {
  const digits = cents ? 2 : 0;
  const formatter =
    formatters.get(digits) ??
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  formatters.set(digits, formatter);
  return formatter.format(value);
}
