import { sql } from "@vercel/postgres";

// ===== 資料庫欄位自動補齊 =====
//
// 每台伺服器啟動後只檢查「一次」，之後直接跳過，
// 避免每個請求都執行 ALTER TABLE（會短暫鎖住整張資料表）。
// 新功能需要的欄位與資料表也在這裡自動建立，不需要手動操作資料庫。

let schemaReady: Promise<void> | null = null;

async function runMigrations() {
  // 文章
  await sql`ALTER TABLE works ADD COLUMN IF NOT EXISTS issue TEXT DEFAULT ''`;
  await sql`ALTER TABLE works ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT '文薈成員創作'`;

  // 帳號
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_notifications BOOLEAN DEFAULT false`;

  // 網站設定
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_submission_open BOOLEAN DEFAULT true`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS submission_deadline TEXT DEFAULT ''`;

  // 投稿：審核時間、刊登後的文章（後台統計用）
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS work_id INTEGER`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;

  // 期刊資訊（主題、卷首語、封面）：期數名稱對應 works.issue
  await sql`
    CREATE TABLE IF NOT EXISTS issues (
      name TEXT PRIMARY KEY,
      theme TEXT DEFAULT '',
      editor_note TEXT DEFAULT '',
      editors TEXT DEFAULT '',
      cover_image_url TEXT DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // 登入失敗紀錄
  await sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 每日網站健康檢查的結果（只保留最近 60 筆）
  await sql`
    CREATE TABLE IF NOT EXISTS health_checks (
      id SERIAL PRIMARY KEY,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ok BOOLEAN NOT NULL,
      detail JSONB NOT NULL DEFAULT '[]'
    )
  `;
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = runMigrations().catch((error) => {
      console.error("資料庫欄位檢查失敗:", error);
      schemaReady = null; // 下次再試
    });
  }
  return schemaReady;
}

/** 測試用：重設「已檢查過」的狀態 */
export function resetSchemaCacheForTests() {
  schemaReady = null;
}
