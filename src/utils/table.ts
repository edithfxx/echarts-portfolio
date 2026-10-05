export interface TableColumn {
  title: string;
  field: string;
}

export type TableRow = Record<string, string | number>;

export interface ChartPoint {
  value: number | null;
  unit?: '%';
}

/** 表格儲存格 → 圖表資料點；"45%" 會轉成 { value: 45, unit: '%' } */
export function toChartPoint(raw: string | number | undefined): ChartPoint {
  if (raw === undefined || raw === '') return { value: null };
  if (typeof raw === 'string' && raw.endsWith('%')) {
    return { value: Number(raw.slice(0, -1)), unit: '%' };
  }
  return { value: Number(raw) };
}

export interface TableToSeriesOptions {
  /** 要畫進圖表的欄位，依 columns 的順序輸出 */
  fields: string[];
  /** 作為 x 軸的欄位 */
  xField: string;
  type: 'line' | 'bar';
  stack?: string;
}

/** 把表格資料（columns + rows）轉成 ECharts 的 legend / xAxis / series */
export function tableToSeries(columns: TableColumn[], rows: TableRow[], options: TableToSeriesOptions) {
  const shown = columns.filter((c) => options.fields.includes(c.field));
  return {
    legend: shown.map((c) => c.title),
    xAxis: rows.map((row) => String(row[options.xField])),
    series: shown.map((c) => ({
      name: c.title,
      type: options.type,
      stack: options.stack,
      emphasis: { focus: 'series' as const },
      data: rows.map((row) => toChartPoint(row[c.field])),
    })),
  };
}
