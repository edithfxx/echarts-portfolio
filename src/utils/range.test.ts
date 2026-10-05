import { describe, expect, it } from 'vitest';
import { getNeighbors, getZoomRange } from './range';

describe('getZoomRange', () => {
  const PAGE = 40;
  const TOTAL = 240;

  it.each([0, 39, 40, 79, 156, 239])('index %d 落在回傳的範圍內', (index) => {
    const { startValue, endValue } = getZoomRange(index, PAGE, TOTAL);
    expect(index).toBeGreaterThanOrEqual(startValue);
    expect(index).toBeLessThanOrEqual(endValue);
    expect(endValue - startValue + 1).toBe(PAGE);
  });

  it('index 156 應在第 4 段 120 ~ 159', () => {
    expect(getZoomRange(156, PAGE, TOTAL)).toEqual({ startValue: 120, endValue: 159 });
  });

  it('最後一段不足 pageSize 時不超出資料總數', () => {
    expect(getZoomRange(245, PAGE, 250)).toEqual({ startValue: 240, endValue: 249 });
  });

  it('參數不合法時拋出 RangeError', () => {
    expect(() => getZoomRange(-1, PAGE, TOTAL)).toThrow(RangeError);
    expect(() => getZoomRange(240, PAGE, TOTAL)).toThrow(RangeError);
    expect(() => getZoomRange(0, 0, TOTAL)).toThrow(RangeError);
  });
});

describe('getNeighbors', () => {
  const years = ['2022', '2021', '2020', '2019', '2018', '2017'];

  it('中間項目取前後各一', () => {
    expect(getNeighbors(years, 2)).toEqual(['2021', '2020', '2019']);
  });

  it('第一項往後取', () => {
    expect(getNeighbors(years, 0)).toEqual(['2022', '2021', '2020']);
  });

  it('最後一項往前取', () => {
    expect(getNeighbors(years, 5)).toEqual(['2019', '2018', '2017']);
  });

  it('清單不足 size 筆時全部回傳', () => {
    expect(getNeighbors(['a', 'b'], 1)).toEqual(['a', 'b']);
  });

  it('index 超出範圍拋出 RangeError', () => {
    expect(() => getNeighbors(years, 6)).toThrow(RangeError);
  });
});
