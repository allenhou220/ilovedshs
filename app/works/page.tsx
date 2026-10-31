import { sql } from "@vercel/postgres";
import WorksClient from "./WorksClient";
import { stripHtml } from "@/lib/text";
import { toSummary } from "@/lib/queries";
import { normalizeText } from "@/lib/search";

// 確保每次重整都抓取最新文章，避免 Next.js 任何快取干擾
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WorkPage() {
  let works: any[] = [];

  try {
    const { rows } = await sql`
      SELECT id, title, author, category, issue, source_type, image_url, content
      FROM works
      ORDER BY sort_order ASC NULLS LAST, id DESC
    `;

    // 在伺服器端先把 HTML 轉成純文字：
    // 瀏覽器只會收到「摘要」和「搜尋用文字」，不再收到整份 HTML（漫畫的圖片資料可能高達數 MB）
    works = rows.map((row) => ({
      ...toSummary(row, 200),
      searchText: normalizeText(stripHtml(row.content || '')),
    }));
  } catch (error) {
    console.error("讀取資料庫失敗:", error);
  }

  // 將資料以 props 的方式傳給含有互動功能的 Client 元件
  return <WorksClient dbWorks={works} />;
}
