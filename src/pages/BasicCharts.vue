<template>
  <section class="page">
    <div class="toolbar" style="margin-top: 16px">
      <button @click="regenerate">重新產生資料</button>
      <span class="hint" style="margin: 0">以 setOption 更新資料，圖表不重建、保留過場動畫</span>
    </div>

    <h2>表格資料 → 圖表</h2>
    <p class="hint">同一份表格資料，依指定欄位自動轉成 series；百分比欄位會在 tooltip 補上 %。</p>
    <div class="grid">
      <div class="card">
        <h3>堆疊折線圖（Stacked Line）</h3>
        <div ref="tableLine" class="chart"></div>
      </div>
      <div class="card">
        <h3>堆疊長條圖（Stacked Bar）</h3>
        <div ref="tableBar" class="chart"></div>
      </div>
    </div>
    <div class="card" style="margin-top: 16px">
      <h3>原始表格</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="c in COLUMNS" :key="c.field">{{ c.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.date">
            <td v-for="c in COLUMNS" :key="c.field">{{ row[c.field] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>直接設定 series</h2>
    <p class="hint">x 軸 {{ DATE_COUNT }} 天、{{ SERIES_NAMES.length }} 條系列，兩者分開設定。</p>
    <div class="grid">
      <div class="card">
        <h3>堆疊折線圖（Stacked Line）</h3>
        <div ref="nativeLine" class="chart"></div>
      </div>
      <div class="card">
        <h3>堆疊長條圖（Stacked Bar）</h3>
        <div ref="nativeBar" class="chart"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
  import type * as echarts from 'echarts';
  import { axisChartOption, createChart } from '../utils/chart';
  import { createDailyRows, createDates, randomList } from '../utils/mock';
  import { tableToSeries, type TableColumn } from '../utils/table';

  type ChartName = 'tableLine' | 'tableBar' | 'nativeLine' | 'nativeBar';
  type ChartType = 'line' | 'bar';

  const COLUMNS: TableColumn[] = [
    { title: '日期', field: 'date' },
    { title: '金額', field: 'money' },
    { title: '合計', field: 'total' },
    { title: 'A', field: 'A' },
    { title: 'B', field: 'B' },
  ];
  const FIELDS = ['money', 'total', 'A', 'B'];
  const ROW_COUNT = 5;

  const SERIES_NAMES = ['A', 'B', 'C', 'D'];
  const DATE_COUNT = 7;
  const dates = createDates(DATE_COUNT);

  const rows = ref(createDailyRows(ROW_COUNT));

  const els = {
    tableLine: useTemplateRef<HTMLDivElement>('tableLine'),
    tableBar: useTemplateRef<HTMLDivElement>('tableBar'),
    nativeLine: useTemplateRef<HTMLDivElement>('nativeLine'),
    nativeBar: useTemplateRef<HTMLDivElement>('nativeBar'),
  };
  const charts = new Map<ChartName, echarts.ECharts>();
  const disposers: Array<() => void> = [];

  /** 堆疊長條只有最上層需要圓角，每層都加會變成一節一節的 */
  function roundTop<T extends object>(series: T[]): T[] {
    return series.map((s, i) =>
      i === series.length - 1 ? { ...s, itemStyle: { borderRadius: [3, 3, 0, 0] } } : s,
    );
  }

  function tableOption(type: ChartType): echarts.EChartsOption {
    const { legend, xAxis, series } = tableToSeries(COLUMNS, rows.value, {
      fields: FIELDS,
      xField: 'date',
      type,
      stack: 'total',
    });
    return axisChartOption({ legend, xAxis, series: type === 'bar' ? roundTop(series) : series });
  }

  function nativeOption(type: ChartType): echarts.EChartsOption {
    const series = SERIES_NAMES.map((name) => ({
      name,
      type,
      stack: 'total',
      emphasis: { focus: 'series' as const },
      data: randomList(DATE_COUNT),
    }));
    return axisChartOption({
      legend: SERIES_NAMES,
      xAxis: dates,
      series: type === 'bar' ? roundTop(series) : series,
    });
  }

  function buildOptions(): Record<ChartName, echarts.EChartsOption> {
    return {
      tableLine: tableOption('line'),
      tableBar: tableOption('bar'),
      nativeLine: nativeOption('line'),
      nativeBar: nativeOption('bar'),
    };
  }

  function regenerate() {
    rows.value = createDailyRows(ROW_COUNT);
    const options = buildOptions();
    charts.forEach((chart, name) => chart.setOption(options[name]));
  }

  onMounted(() => {
    const options = buildOptions();
    for (const name of Object.keys(els) as ChartName[]) {
      const el = els[name].value;
      if (!el) throw new Error(`找不到圖表容器：${name}`);
      const { chart, dispose } = createChart(el, options[name]);
      charts.set(name, chart);
      disposers.push(dispose);
    }
  });

  onBeforeUnmount(() => disposers.forEach((dispose) => dispose()));
</script>
