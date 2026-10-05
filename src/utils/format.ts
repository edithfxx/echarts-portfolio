const COMPACT_UNITS = [
  { size: 1e12, suffix: 'T' },
  { size: 1e9, suffix: 'B' },
  { size: 1e6, suffix: 'M' },
  { size: 1e3, suffix: 'K' },
];

const trimZero = (num: number) => num.toFixed(1).replace(/\.0$/, '');

/** Y 軸用的簡寫：1500 → 1.5K、-2000000 → -2M */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const unit = COMPACT_UNITS.find((u) => abs >= u.size);
  const text = unit ? trimZero(abs / unit.size) + unit.suffix : String(abs);
  return value < 0 ? `-${text}` : text;
}

/** 千分位 + 固定小數位數 */
export function formatAmount(value: number, digits = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

interface TooltipItem {
  axisValueLabel?: string;
  marker?: string;
  seriesName?: string;
  value?: unknown;
  data?: unknown;
}

const isPercentPoint = (data: unknown) =>
  typeof data === 'object' && data !== null && (data as { unit?: string }).unit === '%';

/**
 * trigger: 'axis' 的 tooltip。
 * 資料點若帶 unit: '%'，數值後面補上 %。
 * 系列名稱會跳脫 HTML，避免資料內容被當成 HTML 執行。
 */
export function axisTooltipFormatter(digits = 0) {
  return (params: unknown): string => {
    const items = (Array.isArray(params) ? params : [params]) as TooltipItem[];
    if (items.length === 0) return '';

    const header = `<div>${escapeHtml(String(items[0].axisValueLabel ?? ''))}</div>`;
    const rows = items.map((item) => {
      const amount = formatAmount(Number(item.value), digits);
      const value = isPercentPoint(item.data) ? `${amount}%` : amount;
      return `<div>${item.marker ?? ''}${escapeHtml(item.seriesName ?? '')}<b style="margin-left:10px">${value}</b></div>`;
    });
    return header + rows.join('');
  };
}
