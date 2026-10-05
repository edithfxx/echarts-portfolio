<h1 align="center">ECharts Portfolio</h1>

<p align="center">Vue 3 + TypeScript + ECharts 圖表連動範例</p>

<p align="center"><a href="https://edithfxx.github.io/echarts-portfolio/">🔗 線上 Demo</a></p>

---

## 📝 專案簡介

以 Vue 3 + ECharts 實作的 side project，示範折線 / 長條圖的資料轉換、圖表與圖表、圖表與表格之間的連動。

所有圖表都**直接使用 ECharts API**，沒有透過 vue-echarts 等封裝套件。資料全部為隨機產生的假資料。

---

## ✨ 功能

### 基本圖表

- **表格資料 → 圖表**：給定 columns、rows 與要顯示的欄位，自動轉成 legend / xAxis / series；`"45%"` 這類百分比字串會轉成數值，tooltip 再補回 %
- **直接設定 series**：同樣的堆疊折線 / 堆疊長條，x 軸天數與系列數量分開設定
- 「重新產生資料」以 `setOption` 更新，圖表不重建、保留過場動畫

### 連動圖表

- **年度圖 × 總表**：點年度圖、總表 legend、按鈕或下拉選單（三種觸發方式），總表只顯示該年度與前後一年，其他年度反灰，並自動捲動到對應的年度圖
- **大量資料 × 表格**：240 筆資料，圖表一次顯示 40 筆。點表格任一列，上圖用 `markLine` 標出該筆並以 `dataZoom` 捲到所在區段，下圖只顯示該筆

---

## 💡 技術重點

| 項目 | 做法 | 位置 |
| --- | --- | --- |
| 圖表生命週期 | `createChart` 封裝 `init`、`ResizeObserver` 與 `dispose`：容器尺寸改變時自動 `resize()`，元件卸載時釋放 instance 與 observer | `src/utils/chart.ts` |
| 更新資料 | 以 `setOption` 更新資料，不重建圖表，保留過場動畫 | `src/pages/BasicCharts.vue` |
| dataZoom 定位 | 以資料索引 `startValue` / `endValue` 指定區段，避免百分比換算誤差讓目標點落在可視範圍外 | `getZoomRange`（`src/utils/range.ts`，含測試） |
| 切換年度 | `setOption(option, { replaceMerge: ['series'] })` 整組替換系列；預設合併依名稱對應，前後名單重疊時順序與顏色會錯位 | `src/pages/ComplexChart.vue` |
| legend 互動 | 監聽 `legendselectchanged`，把點擊 legend 從「隱藏系列」改成「選取年度」 | `src/pages/ComplexChart.vue` |
| 堆疊圖 | 系列設定 `stack: 'total'`；圓角只加在最上層，避免每一層都有圓角 | `src/pages/BasicCharts.vue` |
| tooltip 安全 | formatter 輸出 HTML 前先跳脫系列名稱，避免 XSS | `escapeHtml`（`src/utils/format.ts`） |
| 可測試性 | 資料轉換與計算邏輯抽成純函式，以 Vitest 撰寫單元測試 | `src/utils/*.test.ts` |
| CI/CD | push 到 `main` 時以 GitHub Actions 自動執行測試、打包並部署到 GitHub Pages | `.github/workflows/deploy.yml` |

---

## ‼️ 注意事項

1. **圖表的建立與釋放**  
   圖表在 `onMounted` 建立（此時 DOM 才存在），並在 `onBeforeUnmount` 呼叫 `createChart` 回傳的 `dispose`。新增圖表時請沿用同樣寫法，否則 ECharts instance 與 ResizeObserver 不會釋放。

2. **ECharts instance 不放進 `ref()`**  
   instance 存放在一般變數或 `Map` 中，避免被 Vue 轉成深層響應式物件。

3. **打包大小**  
   為求寫法單純，使用 `import * as echarts from 'echarts'` 載入完整套件，打包後 JS 約 1.2 MB（gzip 約 400 KB）。正式專案可改為從 `echarts/core` 按需註冊用到的圖表與元件。

4. **相關文件**
   - [Vue 3 生命週期](https://cn.vuejs.org/api/composition-api-lifecycle.html)
   - [ECharts dispose](https://echarts.apache.org/zh/api.html#echartsInstance.dispose)

---

## 📦 環境版本

| 工具    | 版本建議                         |
| ------- | -------------------------------- |
| Node.js | `v22.12.0` 以上（Vitest 5 需求） |
| npm     | `v10.x`                          |

---

## 🛠 安裝依賴

```bash
npm install
```

---

## 🚩 本地開發

```bash
npm run dev
```

---

## 🧪 單元測試

```bash
npm test      # 執行一次全部測試
npx vitest    # watch 模式，存檔後自動重跑
```

測試範圍為 `src/utils/` 的純函式：`format`、`range`、`table`、`mock`，共 40 個案例。

---

## 🚀 打包

```bash
npm run build       # 型別檢查（vue-tsc）+ 打包
npm run typecheck   # 只做型別檢查
```

---

## 👀 預覽打包檔案

```bash
npm run preview
```

---

## 🌐 部署（GitHub Pages）

push 到 `main` 後，GitHub Actions 會依序執行：

```
npm ci → npm test → npm run build → 部署 dist/ 到 GitHub Pages
```

- 設定檔為 `.github/workflows/deploy.yml`；測試沒通過就不會部署
- `vite.config.ts` 的 `base` 設為 `/echarts-portfolio/`，對應 GitHub Pages 的子路徑，因此本地開發網址為 `http://localhost:5173/echarts-portfolio/`
- 也可以在 repo 的 Actions 頁面按「Run workflow」手動部署

---

## 🧱 專案結構

```
📦 根目錄
├── .github/workflows/          # GitHub Actions
│   └── deploy.yml              # 測試、打包並部署到 GitHub Pages
├── src/                        # 原始碼目錄
│   ├── pages/                  # 頁面
│   │   ├── BasicCharts.vue     # 基本圖表
│   │   └── ComplexChart.vue    # 連動圖表
│   ├── utils/                  # 工具函式（純 TypeScript）
│   │   ├── chart.ts            # createChart（init + resize + dispose）、折線 / 長條共用 option
│   │   ├── format.ts           # K/M/B/T 簡寫、千分位、tooltip formatter
│   │   ├── range.ts            # dataZoom 區段、前後年度計算
│   │   ├── table.ts            # 表格資料 → series
│   │   ├── mock.ts             # 假資料
│   │   └── *.test.ts           # 單元測試（format、range、table、mock）
│   ├── App.vue                 # 根元件（頁面切換，v-if 切換時會觸發 dispose）
│   ├── main.ts                 # 應用程式入口
│   └── style.css               # 全域樣式
├── index.html                  # HTML 入口檔案
├── package.json                # 專案依賴與腳本
├── package-lock.json           # npm 依賴鎖定檔
├── README.md                   # 專案說明文件
├── tsconfig.json               # TypeScript 設定
└── vite.config.ts              # Vite 建置工具設定
```

---

## 💬 Git Commit 規範

| 類型       | 說明                     |
| ---------- | ------------------------ |
| `feat`     | 增加新功能               |
| `fix`      | 修復問題 / Bug           |
| `style`    | 程式碼風格修正           |
| `perf`     | 效能優化                 |
| `refactor` | 程式重構（非修復或新增） |
| `revert`   | 撤銷先前的提交           |
| `test`     | 測試相關                 |
| `docs`     | 文件 / 註解              |
| `chore`    | 工具 / 套件 / 設定維護   |
| `ci`       | 持續整合 / 部署設定      |

---

## 📚 參考文件

本專案用到的 ECharts API：

- [setOption（notMerge、replaceMerge）](https://echarts.apache.org/zh/api.html#echartsInstance.setOption)
- [resize](https://echarts.apache.org/zh/api.html#echartsInstance.resize) / [dispose](https://echarts.apache.org/zh/api.html#echartsInstance.dispose)
- [dispatchAction](https://echarts.apache.org/zh/api.html#echartsInstance.dispatchAction)：[dataZoom](https://echarts.apache.org/zh/api.html#action.dataZoom.dataZoom)、[legendSelect](https://echarts.apache.org/zh/api.html#action.legend.legendSelect)
- [legendselectchanged 事件](https://echarts.apache.org/zh/api.html#events.legendselectchanged)
- [dataZoom startValue / endValue](https://echarts.apache.org/zh/option.html#dataZoom-slider.startValue)
- [markLine](https://echarts.apache.org/zh/option.html#series-line.markLine)
- [stack](https://echarts.apache.org/zh/option.html#series-bar.stack)

Vue：

- [組合式 API 生命週期](https://cn.vuejs.org/api/composition-api-lifecycle.html)

部署：

- [Vite：部署靜態站點 → GitHub Pages](https://cn.vite.dev/guide/static-deploy.html#github-pages)

---

## 🎨 相關套件

- [Vue 3](https://cn.vuejs.org/)
- [ECharts](https://echarts.apache.org/zh/index.html)
- [Vite](https://cn.vite.dev/)
- [Vitest](https://cn.vitest.dev/)
- [TypeScript](https://www.typescriptlang.org/)
