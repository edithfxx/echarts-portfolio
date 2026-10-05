export interface ZoomRange {
  startValue: number;
  endValue: number;
}

/**
 * 取得某筆資料所在區段的 dataZoom 範圍（每段 pageSize 筆）。
 * 用資料索引（startValue/endValue）而非百分比，避免換算誤差讓目標點落到可視範圍外。
 */
export function getZoomRange(index: number, pageSize: number, total: number): ZoomRange {
  if (pageSize <= 0) throw new RangeError(`pageSize 必須大於 0，收到 ${pageSize}`);
  if (index < 0 || index >= total) {
    throw new RangeError(`index ${index} 超出資料範圍 0 ~ ${total - 1}`);
  }
  const startValue = Math.floor(index / pageSize) * pageSize;
  const endValue = Math.min(startValue + pageSize, total) - 1;
  return { startValue, endValue };
}

/**
 * 以 index 為中心取 size 筆相鄰項目，遇到頭尾則往內收。
 * 例：年度 [2022..2017] 選 2020 → [2021, 2020, 2019]；選 2022 → [2022, 2021, 2020]
 */
export function getNeighbors<T>(list: T[], index: number, size = 3): T[] {
  if (index < 0 || index >= list.length) {
    throw new RangeError(`index ${index} 超出資料範圍 0 ~ ${list.length - 1}`);
  }
  if (list.length <= size) return [...list];
  const start = Math.min(Math.max(index - Math.floor(size / 2), 0), list.length - size);
  return list.slice(start, start + size);
}
