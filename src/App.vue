<template>
  <header class="app-header">
    <h1>ECharts 範例</h1>
    <nav class="toolbar">
      <button
        v-for="p in PAGES"
        :key="p.key"
        :class="{ active: current === p.key }"
        @click="current = p.key"
      >
        {{ p.label }}
      </button>
    </nav>
  </header>
  <main>
    <!-- v-if 切換會卸載頁面，順便驗證圖表 dispose -->
    <BasicCharts v-if="current === 'basic'" />
    <ComplexChart v-else />
  </main>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicCharts from './pages/BasicCharts.vue';
  import ComplexChart from './pages/ComplexChart.vue';

  const PAGES = [
    { key: 'basic', label: '基本圖表' },
    { key: 'complex', label: '連動圖表' },
  ] as const;

  const current = ref<(typeof PAGES)[number]['key']>('basic');
</script>

<style scoped>
  .app-header {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px 16px 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .app-header h1 {
    font-size: 22px;
  }

  .app-header .toolbar {
    margin: 0;
  }
</style>
