interface CurrencyInfo {
  symbol: string;
  decimals: number;
  position: 'prefix' | 'suffix';
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { symbol: '$', decimals: 2, position: 'prefix' },
  CNY: { symbol: '¥', decimals: 2, position: 'prefix' },
  SGD: { symbol: 'S$', decimals: 2, position: 'prefix' },
  INR: { symbol: '₹', decimals: 2, position: 'prefix' },
  GBP: { symbol: '£', decimals: 2, position: 'prefix' },
  EUR: { symbol: '€', decimals: 2, position: 'prefix' },
  CAD: { symbol: 'C$', decimals: 2, position: 'prefix' },
  AUD: { symbol: 'A$', decimals: 2, position: 'prefix' },
  SEK: { symbol: 'kr', decimals: 2, position: 'suffix' },
  KRW: { symbol: '₩', decimals: 0, position: 'prefix' },
  JPY: { symbol: '¥', decimals: 0, position: 'prefix' },
  AED: { symbol: 'د.إ', decimals: 2, position: 'prefix' },
  SAR: { symbol: '﷼', decimals: 2, position: 'prefix' },
  IDR: { symbol: 'Rp', decimals: 0, position: 'prefix' },
  BRL: { symbol: 'R$', decimals: 2, position: 'prefix' },
  MXN: { symbol: 'MX$', decimals: 2, position: 'prefix' },
  PHP: { symbol: '₱', decimals: 2, position: 'prefix' },
  VND: { symbol: '₫', decimals: 0, position: 'suffix' },
  PLN: { symbol: 'zł', decimals: 2, position: 'suffix' },
};

export function formatMoney(amount: number, currencyCode: string): string {
  const info = CURRENCIES[currencyCode];
  if (!info) return `${amount} ${currencyCode}`;

  const value = info.decimals > 0
    ? (amount / Math.pow(10, info.decimals)).toLocaleString('en-US', {
        minimumFractionDigits: info.decimals,
        maximumFractionDigits: info.decimals,
      })
    : amount.toLocaleString('en-US');

  return info.position === 'prefix'
    ? `${info.symbol}${value}`
    : `${value} ${info.symbol}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTable(
  rows: Record<string, string>[],
  columns: { key: string; header: string; width?: number }[],
): string {
  const widths = columns.map((col) => {
    const maxData = Math.max(...rows.map((r) => (r[col.key] ?? '').length), col.header.length);
    return col.width ?? Math.min(maxData, 40);
  });

  const header = columns.map((col, i) => col.header.padEnd(widths[i])).join('  ');
  const separator = widths.map((w) => '-'.repeat(w)).join('  ');
  const body = rows.map((row) =>
    columns.map((col, i) => (row[col.key] ?? '').slice(0, widths[i]).padEnd(widths[i])).join('  '),
  );

  return [header, separator, ...body].join('\n');
}
