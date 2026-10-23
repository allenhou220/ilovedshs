import { sql } from "@vercel/postgres";
import { ensureSchema } from "./db";
import { categoryRank, isPublicAuthor, issueNumber, makeExcerpt, readingStats } from "./text";

// ===== 唯讀查詢 =====
// 這些函式只在伺服器端讀資料，刻意不放在 "use server" 的 actions.ts 裡，
// 避免它們被當成可從外部直接呼叫的 Server Action。

export async function getSiteSettings() {
  try {
    const { rows } = await sql`SELECT * FROM site_settings WHERE id = 1`;
    return rows[0] || null;
  } catch (error) {
    console.error("無法取得網站設定:", error);
    return null;
  }
}

export async function getSubmissionStatus(): Promise<boolean> {
  try {
    await ensureSchema();
    const { rows } = await sql`SELECT is_submission_open FROM site_settings WHERE id = 1`;
    return rows[0]?.is_submission_open ?? true;
  } catch (error) {
    console.error("讀取投稿狀態失敗:", error);
    return true;
  }
}

// ----- 文章卡片用的精簡資料 -----

export type WorkSummary = {
  id: number;
  title: string;
  author: string;
  category: string;
  issue: string;
  source_type: string;
  image_url: string;
  featured?: boolean;
  excerpt: string;
  readLabel: string;
};

/** 把資料庫的文章列轉成卡片需要的資料（不含整份 HTML） */
export function toSummary(row: any, excerptLength = 160): WorkSummary {
  const stats = readingStats(row.content || "", row.category);
  return {
    id: row.id,
    title: row.title,
    author: row.author || "匿名",
    category: row.category || "散文",
    issue: row.issue || "",
    source_type: row.source_type || "文薈成員創作",
    image_url: row.image_url || "",
    featured: !!row.featured,
    excerpt: makeExcerpt(row.content || "", excerptLength),
    readLabel: stats.label,
  };
}

// ----- 期刊 -----

export type IssueInfo = {
  name: string;
  count: number;
  theme: string;
  editor_note: string;
  editors: string;
  cover_image_url: string;
  authorCount: number;
};

/** 所有期刊（依期數新到舊），資料來自文章的「期數」欄位，加上後台填寫的期刊資訊 */
export async function getIssues(): Promise<IssueInfo[]> {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT w.issue AS name,
             COUNT(*)::int AS count,
             COUNT(DISTINCT NULLIF(NULLIF(w.author, ''), '匿名'))::int AS author_count,
             COALESCE(MAX(i.theme), '') AS theme,
             COALESCE(MAX(i.editor_note), '') AS editor_note,
             COALESCE(MAX(i.editors), '') AS editors,
             COALESCE(MAX(i.cover_image_url), '') AS cover_image_url,
             MAX(w.image_url) FILTER (WHERE w.featured) AS featured_image,
             MAX(w.image_url) AS any_image
      FROM works w
      LEFT JOIN issues i ON i.name = w.issue
      WHERE COALESCE(w.issue, '') <> ''
      GROUP BY w.issue
    `;
    return rows
      .map((r: any) => ({
        name: r.name,
        count: r.count,
        authorCount: r.author_count,
        theme: r.theme,
        editor_note: r.editor_note,
        editors: r.editors,
        cover_image_url: r.cover_image_url || r.featured_image || r.any_image || "",
      }))
      .sort((a: IssueInfo, b: IssueInfo) => issueNumber(b.name) - issueNumber(a.name) || b.name.localeCompare(a.name));
  } catch (error) {
    console.error("讀取期刊列表失敗:", error);
    return [];
  }
}

/** 單一期刊的資訊與作品（依文體分組） */
export async function getIssue(name: string) {
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, title, author, category, issue, source_type, image_url, featured, content
    FROM works WHERE issue = ${name}
    ORDER BY sort_order ASC NULLS LAST, id DESC
  `;
  if (rows.length === 0) return null;

  const { rows: meta } = await sql`SELECT * FROM issues WHERE name = ${name}`;
  const works: WorkSummary[] = rows.map((r: any) => toSummary(r));
  const groups = new Map<string, WorkSummary[]>();
  for (const w of works) {
    if (!groups.has(w.category)) groups.set(w.category, []);
    groups.get(w.category)!.push(w);
  }
  const grouped = Array.from(groups.entries())
    .sort((a, b) => categoryRank(a[0]) - categoryRank(b[0]))
    .map(([category, items]) => ({ category, items }));

  const authors = new Set(works.map((w) => w.author).filter(isPublicAuthor));
  return {
    name,
    theme: meta[0]?.theme || "",
    editor_note: meta[0]?.editor_note || "",
    editors: meta[0]?.editors || "",
    cover_image_url: meta[0]?.cover_image_url || works.find((w) => w.featured)?.image_url || works.find((w) => w.image_url)?.image_url || "",
    works,
    grouped,
    authorCount: authors.size,
  };
}

// ----- 作者 -----

/** 所有公開作者（不含匿名），依作品數排序 */
export async function getAuthors() {
  try {
    const { rows } = await sql`
      SELECT author AS name, COUNT(*)::int AS count
      FROM works
      WHERE COALESCE(author, '') NOT IN ('', '匿名')
      GROUP BY author
      ORDER BY count DESC, author ASC
    `;
    return rows as { name: string; count: number }[];
  } catch (error) {
    console.error("讀取作者列表失敗:", error);
    return [];
  }
}

/** 單一作者的作品 */
export async function getAuthor(name: string) {
  if (!isPublicAuthor(name)) return null;
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, title, author, category, issue, source_type, image_url, featured, content
    FROM works WHERE author = ${name}
    ORDER BY sort_order ASC NULLS LAST, id DESC
  `;
  if (rows.length === 0) return null;
  const works: WorkSummary[] = rows.map((r: any) => toSummary(r));
  const issues: string[] = Array.from(new Set<string>(works.map((w) => w.issue).filter(Boolean))).sort((a, b) => issueNumber(a) - issueNumber(b));
  const counts = new Map<string, number>();
  for (const w of works) counts.set(w.category, (counts.get(w.category) || 0) + 1);
  const categories = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  return { name, works, issues, categories };
}

// ----- 相關文章 -----

/** 推薦相關文章：同作者 → 同文體 → 同一期，最多 limit 篇，不重複 */
export async function getRelatedWorks(work: { id: number; author?: string; category?: string; issue?: string }, limit = 3) {
  try {
    const { rows } = await sql`
      SELECT id, title, author, category, issue, source_type, image_url, featured, LEFT(content, 2000) AS content
      FROM works WHERE id <> ${work.id}
      ORDER BY sort_order ASC NULLS LAST, id DESC
    `;
    const picked: (WorkSummary & { reason: string })[] = [];
    const take = (pred: (r: any) => boolean, reason: string) => {
      for (const r of rows) {
        if (picked.length >= limit) return;
        if (picked.some((p) => p.id === r.id)) continue;
        if (pred(r)) picked.push({ ...toSummary(r, 80), reason });
      }
    };
    if (isPublicAuthor(work.author)) take((r) => r.author === work.author, "同一位作者");
    if (work.category) take((r) => r.category === work.category, `同為${work.category}`);
    if (work.issue) take((r) => r.issue === work.issue, "同一期");
    take(() => true, "最新作品");
    return picked;
  } catch (error) {
    console.error("讀取相關文章失敗:", error);
    return [];
  }
}

// ----- 後台統計 -----

export async function getDashboardStats() {
  await ensureSchema();
  const [works, subs, cats, recent, open] = await Promise.all([
    sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE source_type = '學生投稿')::int AS student FROM works`,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')::int AS last30,
        COUNT(*) FILTER (WHERE status = 'published')::int AS published,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
      FROM submissions
    `,
    sql`SELECT COALESCE(category, '散文') AS category, COUNT(*)::int AS count FROM works GROUP BY 1`,
    sql`
      SELECT id, title, category, class, author_name, created_at
      FROM submissions WHERE status = 'pending'
      ORDER BY created_at DESC LIMIT 5
    `,
    getSubmissionStatus(),
  ]);
  const categories = (cats.rows as { category: string; count: number }[]).sort(
    (a, b) => categoryRank(a.category) - categoryRank(b.category)
  );
  return {
    totalWorks: works.rows[0].total as number,
    studentWorks: works.rows[0].student as number,
    pending: subs.rows[0].pending as number,
    last30: subs.rows[0].last30 as number,
    publishedSubmissions: subs.rows[0].published as number,
    rejectedSubmissions: subs.rows[0].rejected as number,
    categories,
    recent: recent.rows,
    isSubmissionOpen: open,
  };
}
