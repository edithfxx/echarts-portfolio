import type { TableRow } from './table';

/** min ~ max 之間的整數（含頭尾） */
export const randomNumber = (min = 1, max = 100): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomList = (count: number): number[] => Array.from({ length: count }, () => randomNumber());

const pad = (n: number) => String(n).padStart(2, '0');

/** 從 start 起連續 count 天，格式 MM/DD */
export function createDates(count: number, start = new Date(2020, 7, 1)): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  });
}

/** BasicCharts 的表格資料：日期 + 金額 / 合計 / A / B */
export function createDailyRows(count: number): TableRow[] {
  return createDates(count).map((date) => ({
    date,
    money: randomNumber(),
    total: randomNumber(),
    A: randomNumber(),
    B: randomNumber(),
  }));
}

export interface MonthRow extends TableRow {
  month: string;
  percentage: string;
}

/** ComplexChart 的大量資料：當月、1月後、2月後…，數值為百分比字串 */
export function createMonthRows(count: number): MonthRow[] {
  return Array.from({ length: count }, (_, i) => ({
    month: i === 0 ? '當月' : `${i}月後`,
    percentage: `${randomNumber()}%`,
  }));
}
