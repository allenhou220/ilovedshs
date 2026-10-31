// 作品搜尋：前台作品典藏頁使用（伺服器與瀏覽器都能用）
// - 全形半形、大小寫視為相同（例如「ＡＢＣ」＝「abc」）
// - 可以輸入多個關鍵字，用空白隔開，全部都要符合
// - 依符合的位置排序：標題 > 作者 > 文體、期數 > 內文
// - 內文符合時，取出關鍵字前後的一小段文字當作摘要

/** 統一字元寫法：全形轉半形、轉小寫、多個空白變一個 */
export function normalizeText(value: string = ""): string {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

/** 把搜尋框的內容拆成關鍵字（去掉重複，最多 8 個） */
export function parseQuery(query: string): string[] {
  const terms = normalizeText(query).split(" ").filter(Boolean);
  return Array.from(new Set(terms)).slice(0, 8);
}

export type SearchableWork = {
  title?: string | null;
  author?: string | null;
  category?: string | null;
  issue?: string | null;
  /** 內文純文字（已經 normalizeText 過） */
  searchText?: string | null;
};

/** 計算符合程度；有任何關鍵字找不到就回傳 0（不顯示） */
export function scoreWork(work: SearchableWork, terms: string[]): number {
  if (terms.length === 0) return 1;
  const title = normalizeText(work.title || "");
  const author = normalizeText(work.author || "");
  const meta = normalizeText(`${work.category || ""} ${work.issue || ""}`);
  const body = work.searchText || "";
  let score = 0;
  for (const t of terms) {
    let s = 0;
    if (title.includes(t)) s += title === t ? 120 : 100;
    if (author.includes(t)) s += 60;
    if (meta.includes(t)) s += 30;
    if (body.includes(t)) s += 10 + Math.min(countOf(body, t), 10);
    if (s === 0) return 0;
    score += s;
  }
  return score;
}

function countOf(text: string, term: string) {
  let n = 0;
  for (let i = text.indexOf(term); i !== -1 && n < 50; i = text.indexOf(term, i + term.length)) n++;
  return n;
}

export type SnippetPart = { text: string; hit: boolean };

/**
 * 取出內文中第一個關鍵字附近的文字（前後約 radius 個字），並標出關鍵字位置。
 * 內文沒有任何關鍵字時回傳 null。
 */
export function makeSnippet(text: string, terms: string[], radius = 36): SnippetPart[] | null {
  if (!text || terms.length === 0) return null;
  let first = -1;
  for (const t of terms) {
    const i = text.indexOf(t);
    if (i !== -1 && (first === -1 || i < first)) first = i;
  }
  if (first === -1) return null;

  const start = Math.max(0, first - radius);
  const end = Math.min(text.length, first + radius * 2);
  const slice = text.slice(start, end);

  // 在片段裡標出所有關鍵字（長的先比對，避免被短的切斷）
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const parts: SnippetPart[] = [];
  let i = 0;
  let plain = "";
  while (i < slice.length) {
    const hit = sorted.find((t) => slice.startsWith(t, i));
    if (hit) {
      if (plain) parts.push({ text: plain, hit: false });
      plain = "";
      parts.push({ text: hit, hit: true });
      i += hit.length;
    } else {
      plain += slice[i];
      i++;
    }
  }
  if (plain) parts.push({ text: plain, hit: false });
  if (start > 0) parts.unshift({ text: "⋯", hit: false });
  if (end < text.length) parts.push({ text: "⋯", hit: false });
  return parts;
}
