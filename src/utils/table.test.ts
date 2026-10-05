import { describe, expect, it } from 'vitest';
import { tableToSeries, toChartPoint } from './table';

describe('toChartPoint', () => {
  it('百分比字串轉成數值並標記單位', () => {
    expect(toChartPoint('45%')).toEqual({ value: 45, unit: '%' });
  });

  it('一般數值與數字字串', () => {
    expect(toChartPoint(12)).toEqual({ value: 12 });
    expect(toChartPoint('12')).toEqual({ value: 12 });
  });

  it('空值轉成 null（ECharts 視為缺值）', () => {
    expect(toChartPoint(undefined)).toEqual({ value: null });
    expect(toChartPoint('')).toEqual({ value: null });
  });
});

describe('tableToSeries', () => {
  const columns = [
    { title: '日期', field: 'date' },
    { title: '金額', field: 'money' },
    { title: 'A', field: 'A' },
  ];
  const rows = [
    { date: '08/01', money: 10, A: '5%' },
    { date: '08/02', money: 20, A: '6%' },
  ];

  it('只輸出 fields 指定的欄位，順序依 columns', () => {
    const result = tableToSeries(columns, rows, { fields: ['A', 'money'], xField: 'date', type: 'line' });
    expect(result.legend).toEqual(['金額', 'A']);
    expect(result.xAxis).toEqual(['08/01', '08/02']);
    expect(result.series.map((s) => s.data)).toEqual([
      [{ value: 10 }, { value: 20 }],
      [
        { value: 5, unit: '%' },
        { value: 6, unit: '%' },
      ],
    ]);
  });

  it('帶入 type 與 stack', () => {
    const result = tableToSeries(columns, rows, { fields: ['money'], xField: 'date', type: 'bar', stack: 'total' });
    expect(result.series[0]).toMatchObject({ name: '金額', type: 'bar', stack: 'total' });
  });
});
