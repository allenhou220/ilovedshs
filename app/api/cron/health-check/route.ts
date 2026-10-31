import { NextResponse } from "next/server";
import { recordHealthCheck, runHealthChecks, sendHealthAlert } from "@/lib/health";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 每日網站健康檢查（由 vercel.json 的排程每天自動呼叫）
// 安全：只有帶著正確 CRON_SECRET 的請求才會執行（Vercel 排程會自動帶上），避免被別人拿來狂寄信
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const report = await runHealthChecks(siteUrl);

  let previous: { ok: boolean } | null = null;
  try {
    previous = await recordHealthCheck(report);
  } catch (error) {
    console.error("健康檢查結果寫入失敗:", error);
  }

  // 出問題就通知；從「有問題」變回「正常」也通知一次
  let notified = false;
  try {
    if (!report.ok) notified = await sendHealthAlert(report, "down", siteUrl);
    else if (previous && !previous.ok) notified = await sendHealthAlert(report, "recovered", siteUrl);
  } catch (error) {
    console.error("健康檢查通知寄送失敗:", error);
  }

  return NextResponse.json({ ...report, notified }, { status: report.ok ? 200 : 503 });
}
