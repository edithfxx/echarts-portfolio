import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // GitHub Pages 部署在子路徑：https://<帳號>.github.io/echarts-portfolio/
  base: '/echarts-portfolio/',
  plugins: [vue()],
});
