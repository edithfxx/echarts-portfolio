<template>
  <section class="page">
    <!-- 1. 年度圖表 × 總表連動 -->
    <h2>年度圖表 × 總表連動</h2>
    <p class="hint">
      點年度圖、總表 legend、按鈕或下拉選單：總表顯示該年度與前後一年，其他年度反灰，並捲動到對應的年度圖。
    </p>

    <div class="year-scroll">
      <div
        v-for="year in YEARS"
        :key="year"
        class="card year-card"
        :class="{ selected: selectedYear === year }"
        @click="selectYear(year)"
      >
        <h3>{{ year }} 年度</h3>
        <div :ref="(el) => setYearEl(year, el)" class="chart year-chart"></div>
      </div>
    </div>

    <div class="toolbar">
      <span class="hint" style="margin: 0">觸發方式：</span>
      <button
        v-for="m in MODES"
        :key="m.key"
        :class="{ active: mode === m.key }"
        @click="mode = m.key"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="card">
      <h3>總表（{{ selectedYear ? `${selectedYear} 與前後年度` : '最近三年' }}）</h3>
      <div class="toolbar">
        <template v-if="mode === 'button'">
          <button
            v-for="year in YEARS"
            :key="year"
            :class="{ active: selectedYear === year }"
            @click="selectYear(year)"
          >
            {{ year }}
          </button>
        </template>
        <span v-else-if="mode === 'legend'" class="hint" style="margin: 0">點擊圖表上方的年度 legend</span>
        <label v-else>
          年度：
          <select
            :value="selectedYear ?? ''"
            @change="selectYear(($event.target as HTMLSelectElement).value || null)"
          >
            <option value="">全部</option>
            <option v-for="year in YEARS" :key="year" :value="year">{{ year }}</option>
          </select>
        </label>
        <button @click="selectYear(null)">重設</button>
      </div>
      <div ref="summary" class="chart"></div>
    </div>

    <!-- 2. 大量資料 × 表格連動 -->
    <h2>大量資料 × 表格連動</h2>
    <p class="hint">
      共 {{ MONTH_TOTAL }} 筆，圖表每次顯示 {{ ZOOM_SIZE }} 筆。點表格任一列：上圖標出該筆並自動捲到所在區段，下圖只顯示該筆。
    </p>

    <div class="month-layout">
      <div class="card">
        <div class="toolbar">
          <button :disabled="page === 1" @click="page--">‹</button>
          <select v-model.number="page">
            <option v-for="p in PAGE_COUNT" :key="p" :value="p">第 {{ p }} 頁</option>
          </select>
          <button :disabled="page === PAGE_COUNT" @click="page++">›</button>
          <button @click="reload">重設</button>
        </div>
        <table class="data-table month-table">
          <thead>
            <tr>
              <th v-for="c in MONTH_COLUMNS" :key="c.field">{{ c.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pagedRows"
              :key="item.index"
              :class="{ selected: selectedIndex === item.index }"
              @click="selectRow(item.index)"
            >
              <td v-for="c in MONTH_COLUMNS" :key="c.field">{{ item.row[c.field] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="month-charts">
        <div class="card">
          <h3>標記選取的資料點</h3>
          <div ref="highlight" class="chart"></div>
        </div>
        <div class="card">
          <h3>只顯示選取的資料</h3>
          <div ref="detail" class="chart"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, type ComponentPublicInstance } from 'vue';
  import type * as echarts from 'echarts';
  import { axisChartOption, createChart, DEFAULT_COLORS, MUTED_COLOR } from '../utils/chart';
  import { createMonthRows, randomList, type MonthRow } from '../utils/mock';
  import { getNeighbors, getZoomRange } from '../utils/range';
  import { tableToSeries, type TableColumn } from '../utils/table';

  /* ========== 1. 年度圖表 × 總表連動 ========== */

  const YEARS = ['2022', '2021', '2020', '2019', '2018', '2017'];
  const CATEGORIES = ['3C', '服飾', '美妝', '食品', '其他'];
  const SUMMARY_MONTHS = ['01月', '02月', '03月', '04月', '05月', '06月'];
  const YEAR_COLORS = Object.fromEntries(YEARS.map((year, i) => [year, DEFAULT_COLORS[i]]));

  const MODES = [
    { key: 'button', label: '年度按鈕' },
    { key: 'legend', label: '點 legend' },
    { key: 'select', label: '下拉選單' },
  ] as const;

  // 資料只產生一次，切換年度時數字不會跟著變
  const categoryData = Object.fromEntries(YEARS.map((year) => [year, randomList(CATEGORIES.length)]));
  const monthlyData = Object.fromEntries(YEARS.map((year) => [year, randomList(SUMMARY_MONTHS.length)]));

  const mode = ref<(typeof MODES)[number]['key']>('button');
  const selectedYear = ref<string | null>(null);

  const yearEls = new Map<string, HTMLDivElement>();
  const yearCharts = new Map<string, echarts.ECharts>();
  const summaryEl = useTemplateRef<HTMLDivElement>('summary');
  let summaryChart: echarts.ECharts | undefined;

  function setYearEl(year: string, el: Element | ComponentPublicInstance | null) {
    if (el instanceof HTMLDivElement) yearEls.set(year, el);
  }

  function yearOption(year: string, muted: boolean): echarts.EChartsOption {
    const option = axisChartOption({
      legend: CATEGORIES,
      xAxis: [year],
      color: muted ? CATEGORIES.map(() => MUTED_COLOR) : DEFAULT_COLORS,
      series: CATEGORIES.map((name, i) => ({
        name,
        type: 'bar',
        emphasis: { focus: 'series' },
        data: [{ value: categoryData[year][i], unit: '%' }],
      })),
    });
    // 年度圖的 legend 只當圖例用，避免點擊時把系列藏起來
    return { ...option, legend: { top: 0, data: CATEGORIES, selectedMode: false } };
  }

  function summaryOption(selected: string | null): echarts.EChartsOption {
    const years = selected ? getNeighbors(YEARS, YEARS.indexOf(selected)) : YEARS.slice(0, 3);
    return axisChartOption({
      legend: years,
      xAxis: SUMMARY_MONTHS,
      color: years.map((year) => (!selected || year === selected ? YEAR_COLORS[year] : MUTED_COLOR)),
      series: years.map((year) => ({
        name: year,
        type: 'bar',
        emphasis: { focus: 'series' },
        data: monthlyData[year].map((value) => ({ value, unit: '%' })),
      })),
    });
  }

  function selectYear(year: string | null) {
    selectedYear.value = year;
    yearCharts.forEach((chart, y) => chart.setOption(yearOption(y, year !== null && y !== year)));
    // 預設 merge 會依名稱對應系列：前後年度名單重疊時（例如 2020）順序會亂掉，顏色跟著錯位，所以整組替換
    summaryChart?.setOption(summaryOption(year), { replaceMerge: ['series'] });
    yearEls.get(year ?? YEARS[0])?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ========== 2. 大量資料 × 表格連動 ========== */

  const MONTH_TOTAL = 240;
  const ZOOM_SIZE = 40; // 圖表一次顯示幾筆
  const PAGE_SIZE = 10; // 表格一頁幾筆
  const PAGE_COUNT = Math.ceil(MONTH_TOTAL / PAGE_SIZE);
  const MONTH_COLUMNS: TableColumn[] = [
    { title: '月份', field: 'month' },
    { title: '百分比', field: 'percentage' },
  ];
  const INITIAL_ZOOM = getZoomRange(0, ZOOM_SIZE, MONTH_TOTAL);

  const monthRows = createMonthRows(MONTH_TOTAL);
  const page = ref(1);
  const selectedIndex = ref<number | null>(null);
  const pagedRows = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE;
    return monthRows.slice(start, start + PAGE_SIZE).map((row, i) => ({ row, index: start + i }));
  });

  const highlightEl = useTemplateRef<HTMLDivElement>('highlight');
  const detailEl = useTemplateRef<HTMLDivElement>('detail');
  let highlightChart: echarts.ECharts | undefined;
  let detailChart: echarts.ECharts | undefined;

  function monthOption(rows: MonthRow[], withZoom: boolean): echarts.EChartsOption {
    const { legend, xAxis, series } = tableToSeries(MONTH_COLUMNS, rows, {
      fields: ['percentage'],
      xField: 'month',
      type: 'line',
    });
    return axisChartOption({
      legend,
      xAxis,
      series,
      rotate: 45,
      dataZoom: withZoom ? [{ type: 'slider', height: 20, bottom: 8, ...INITIAL_ZOOM }] : [],
    });
  }

  function selectRow(index: number) {
    selectedIndex.value = index;
    const row = monthRows[index];
    highlightChart?.setOption({
      series: [
        {
          markLine: {
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle: { width: 2 },
            data: [{ xAxis: row.month }],
          },
        },
      ],
    });
    highlightChart?.dispatchAction({ type: 'dataZoom', ...getZoomRange(index, ZOOM_SIZE, MONTH_TOTAL) });
    // notMerge：連同 dataZoom 一起換掉
    detailChart?.setOption(monthOption([row], false), true);
  }

  function reload() {
    selectedIndex.value = null;
    page.value = 1;
    highlightChart?.setOption({ series: [{ markLine: { data: [] } }] });
    highlightChart?.dispatchAction({ type: 'dataZoom', ...INITIAL_ZOOM });
    detailChart?.setOption(monthOption(monthRows, true), true);
  }

  /* ========== 生命週期 ========== */

  const disposers: Array<() => void> = [];

  function mountChart(el: HTMLElement | null | undefined, option: echarts.EChartsOption, name: string) {
    if (!el) throw new Error(`找不到圖表容器：${name}`);
    const { chart, dispose } = createChart(el, option);
    disposers.push(dispose);
    return chart;
  }

  onMounted(() => {
    for (const year of YEARS) {
      yearCharts.set(year, mountChart(yearEls.get(year), yearOption(year, false), `year ${year}`));
    }

    summaryChart = mountChart(summaryEl.value, summaryOption(null), 'summary');
    // legend 預設點擊會隱藏系列；這裡改成「選取年度」，所以先把它選回來
    summaryChart.on('legendselectchanged', (params) => {
      const { name } = params as { name: string };
      summaryChart?.dispatchAction({ type: 'legendSelect', name });
      selectYear(name);
    });

    highlightChart = mountChart(highlightEl.value, monthOption(monthRows, true), 'highlight');
    detailChart = mountChart(detailEl.value, monthOption(monthRows, true), 'detail');
  });

  onBeforeUnmount(() => disposers.forEach((dispose) => dispose()));
</script>

<style scoped>
  .year-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }

  .year-card {
    flex: 0 0 360px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .year-card.selected {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }

  .year-chart {
    height: 220px;
  }

  .month-layout {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }

  .month-charts {
    display: grid;
    gap: 16px;
  }

  .month-table tbody tr {
    cursor: pointer;
  }

  .month-table tbody tr:hover {
    background: var(--bg);
  }

  .month-table tbody tr.selected {
    background: var(--primary-soft);
    color: var(--primary);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .month-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .year-card {
      flex-basis: 280px;
    }
  }
</style>
