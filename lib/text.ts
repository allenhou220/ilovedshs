// 文字處理小工具（前台、後台共用，伺服器與瀏覽器都能用）

/** 移除 HTML 標籤，取得純文字 */
export function stripHtml(html: string = ""): string {
  return String(html || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** 取得文章摘要（純文字，最多 maxLength 個字） */
export function makeExcerpt(html: string = "", maxLength = 160): string {
  // 段落、換行之間留一個空白，新詩的每一行才不會黏在一起
  const text = stripHtml(String(html || "").replace(/<\/(p|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, "$& "));
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

/** 文章網址：以標題作為網址（與 sitemap、舊連結一致） */
export function workHref(work: { title?: string | null; id?: number | string | null }): string {
  return `/works/${encodeURIComponent(String(work.title || work.id || ""))}`;
}

/** 期刊網址 */
export function issueHref(name: string): string {
  return `/issues/${encodeURIComponent(name)}`;
}

/** 作者網址 */
export function authorHref(name: string): string {
  return `/authors/${encodeURIComponent(name)}`;
}

/** 這個作者名稱是否可以公開成作者頁（匿名作品不建立作者頁） */
export function isPublicAuthor(name?: string | null): boolean {
  const n = String(name || "").trim();
  return n !== "" && n !== "匿名";
}

const CHARS_PER_MINUTE = 400; // 中文平均閱讀速度（字／分鐘）

/** 計算字數與預估閱讀時間；漫畫則計算頁數 */
export function readingStats(html: string = "", category?: string) {
  const content = String(html || "");
  if (category === "漫畫") {
    const pages = (content.match(/<img\b/gi) || []).length;
    return { chars: 0, minutes: 0, pages, label: pages ? `${pages} 頁` : "漫畫" };
  }
  const text = stripHtml(content).replace(/\s/g, "");
  // 中日韓文字一字算一字；英文單字一個算一字
  const cjk = (text.match(/[㐀-鿿豈-﫿]/g) || []).length;
  const words = (stripHtml(content).replace(/[㐀-鿿豈-﫿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  const chars = cjk + words;
  const minutes = Math.max(1, Math.round(chars / CHARS_PER_MINUTE));
  return { chars, minutes, pages: 0, label: `約 ${minutes} 分鐘` };
}

/** 期數名稱中的數字（排序用），例如「第 12 期・春季號」→ 12 */
export function issueNumber(name: string): number {
  const m = String(name || "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}

/** 文體固定的顯示順序 */
export const CATEGORY_ORDER = ["散文", "新詩", "小說", "採訪", "漫畫"];
export const CATEGORY_EN: Record<string, string> = {
  散文: "PROSE",
  新詩: "POETRY",
  小說: "FICTION",
  採訪: "INTERVIEW",
  漫畫: "COMIC",
};

export function categoryRank(cat?: string | null): number {
  const i = CATEGORY_ORDER.indexOf(String(cat || ""));
  return i === -1 ? CATEGORY_ORDER.length : i;
}
