import { describe, expect, it } from 'vitest';
import { axisTooltipFormatter, escapeHtml, formatAmount, formatCompact } from './format';

describe('formatCompact', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1K'],
    [1500, '1.5K'],
    [-2000, '-2K'],
    [1e6, '1M'],
    [2.5e9, '2.5B'],
    [1e12, '1T'],
  ])('%d → %s', (input, expected) => {
    expect(formatCompact(input)).toBe(expected);
  });
});

describe('formatAmount', () => {
  it('加上千分位與指定小數位數', () => {
    expect(formatAmount(1234567)).toBe('1,234,567');
    expect(formatAmount(1234.5, 2)).toBe('1,234.50');
  });
});

describe('escapeHtml', () => {
  it('跳脫 HTML 特殊字元', () => {
    expect(escapeHtml('<img src=x onerror="a">')).toBe('&lt;img src=x onerror=&quot;a&quot;&gt;');
  });
});

describe('axisTooltipFormatter', () => {
  const format = axisTooltipFormatter(0);

  it('百分比資料點補上 %，一般數值加千分位', () => {
    const html = format([
      { axisValueLabel: '08/01', marker: '', seriesName: '比例', value: 45, data: { value: 45, unit: '%' } },
      { axisValueLabel: '08/01', marker: '', seriesName: '金額', value: 1200, data: { value: 1200 } },
    ]);
    expect(html).toContain('<b style="margin-left:10px">45%</b>');
    expect(html).toContain('<b style="margin-left:10px">1,200</b>');
  });

  it('系列名稱會被跳脫', () => {
    const html = format([{ axisValueLabel: 'x', seriesName: '<script>', value: 1, data: 1 }]);
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('單一物件（item trigger）也能處理', () => {
    expect(format({ axisValueLabel: 'x', seriesName: 'A', value: 3, data: 3 })).toContain('A');
  });
});
