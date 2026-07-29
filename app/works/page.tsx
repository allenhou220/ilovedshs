import { sql } from "@vercel/postgres";
import WorksClient from "./WorksClient";

// 確保每次重整都抓取最新文章
export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  let works = [];
  
  try {
    // 從資料庫撈出所有文章
    const { rows } = await sql`SELECT * FROM works ORDER BY sort_order ASC`;
    works = rows;
  } catch (error) {
    console.error("讀取資料庫失敗:", error);
  }

  // 將資料庫撈出來的文章，以 props 的方式傳給含有互動功能的 Client 元件
  return <WorksClient dbWorks={works} />;
}