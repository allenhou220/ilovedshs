import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 公開的簡易健康檢查：只回答「網站和資料庫是否正常」，不透露細節。
// 可以給外部監控服務（例如 UptimeRobot）每幾分鐘呼叫一次。
export async function GET() {
  try {
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
