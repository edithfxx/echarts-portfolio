import * as echarts from 'echarts';
import { axisTooltipFormatter, formatCompact } from './format';

/** 沿用 ECharts 5 的預設色盤 */
export const DEFAULT_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];
export const MUTED_COLOR = '#E4E4E4';

/**
 * 在 el 上建立圖表，容器尺寸改變時自動 resize。
 * 回傳的 dispose 要在元件卸載時呼叫，否則 ECharts instance 與 observer 不會釋放。
 */
export function createChart(el: HTMLElement, option: echarts.EChartsOption) {
  const chart = echarts.init(el);
  chart.setOption(option);
  const observer = new ResizeObserver(() => chart.resize());
  observer.observe(el);
  return {
    chart,
    dispose: () => {
      observer.disconnect();
      chart.dispose();
    },
  };
}

export interface AxisChartOptions {
  legend: string[];
  xAxis: string[];
  series: echarts.EChartsOption['series'];
  color?: string[];
  /** x 軸文字角度 */
  rotate?: number;
  /** tooltip 小數位數 */
  digits?: number;
  dataZoom?: echarts.EChartsOption['dataZoom'];
}

/** 折線 / 長條圖共用的 option：axis tooltip、legend、y 軸 K/M 簡寫 */
export function axisChartOption(o: AxisChartOptions): echarts.EChartsOption {
  const hasZoom = Array.isArray(o.dataZoom) && o.dataZoom.length > 0;
  return {
    color: o.color ?? DEFAULT_COLORS,
    tooltip: { trigger: 'axis', formatter: axisTooltipFormatter(o.digits ?? 0) },
    legend: { top: 0, data: o.legend },
    grid: { top: 40, left: 16, right: 16, bottom: hasZoom ? 56 : 16 },
    xAxis: {
      type: 'category',
      data: o.xAxis,
      axisLabel: { interval: 0, rotate: o.rotate ?? 0 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => formatCompact(value) },
    },
    dataZoom: o.dataZoom ?? [],
    series: o.series,
  };
}
