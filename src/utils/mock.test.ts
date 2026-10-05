import { describe, expect, it } from 'vitest';
import { createDailyRows, createDates, createMonthRows, randomList, randomNumber } from './mock';

describe('randomNumber', () => {
  it('落在 min ~ max 之間', () => {
    for (let i = 0; i < 200; i++) {
      const n = randomNumber(1, 3);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it('randomList 長度正確', () => {
    expect(randomList(7)).toHaveLength(7);
  });
});

describe('createDates', () => {
  it('連續日期，格式 MM/DD', () => {
    expect(createDates(3)).toEqual(['08/01', '08/02', '08/03']);
  });

  it('跨月正確進位', () => {
    expect(createDates(2, new Date(2020, 7, 31))).toEqual(['08/31', '09/01']);
  });
});

describe('createDailyRows', () => {
  it('筆數與日期一致', () => {
    const rows = createDailyRows(5);
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => r.date)).toEqual(createDates(5));
  });
});

describe('createMonthRows', () => {
  const rows = createMonthRows(240);

  it('筆數正確', () => {
    expect(rows).toHaveLength(240);
  });

  it('第一筆為當月，之後為 N月後（不跳號）', () => {
    expect(rows[0].month).toBe('當月');
    expect(rows[1].month).toBe('1月後');
    expect(rows[156].month).toBe('156月後');
  });

  it('數值為百分比字串', () => {
    expect(rows.every((r) => /^\d+%$/.test(r.percentage))).toBe(true);
  });
});
