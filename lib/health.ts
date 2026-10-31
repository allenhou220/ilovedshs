// 網站健康檢查：每天由 Vercel 排程自動執行（見 vercel.json 與 /api/cron/health-check）
// 檢查資料庫與幾個重要頁面能不能正常開啟；有問題就寄信通知，恢復正常時也會通知一次。
import { sql } from "@vercel/postgres";
import { Resend } from "resend";
import { ensureSchema } from "./db";
import { escapeHtml } from "./sanitize-html";
import { workHref } from "./text";

export type CheckResult = { name: string; ok: boolean; status?: number; ms: number; error?: string };
export type HealthReport = { ok: boolean; checkedAt: string; results: CheckResult[] };

// 要檢查的頁面（名稱、網址）
const PAGES: [string, string][] = [
  ["首頁", "/"],
  ["作品典藏", "/works"],
  ["投稿頁", "/submit"],
  ["期刊", "/issues"],
  ["作者", "/authors"],
];

const TIMEOUT_MS = 15_000;

async function timed<T>(fn: () => Promise<T>): Promise<{ value?: T; ms: number; error?: string }> {
  const t0 = Date.now();
  try {
    const value = await fn();
    return { value, ms: Date.now() - t0 };
  } catch (error) {
    return { ms: Date.now() - t0, error: error instanceof Error ? error.message : String(error) };
  }
}

/** 執行所有檢查。baseUrl 例如 https://ilovedshs.vercel.app */
export async function runHealthChecks(baseUrl: string, fetchImpl: typeof fetch = fetch): Promise<HealthReport> {
  const results: CheckResult[] = [];

  // 1. 資料庫：能查到作品，並順便取得最新一篇作品的網址
  let latestWork: string | null = null;
  const db = await timed(async () => {
    const { rows } = await sql`SELECT id, title FROM works ORDER BY id DESC LIMIT 1`;
    if (rows[0]) latestWork = workHref(rows[0]);
    return rows.length;
  });
  results.push({ name: "資料庫", ok: !db.error, ms: db.ms, error: db.error });

  // 2. 各頁面：要回傳 200，而且內容裡有站名（避免空白頁或錯誤頁被當成正常）
  const pages = [...PAGES];
  if (latestWork) pages.push(["最新作品頁", latestWork]);
  const checks = await Promise.all(
    pages.map(async ([name, path]) => {
      let status: number | undefined;
      const r = await timed(async () => {
        const res = await fetchImpl(new URL(path, baseUrl).toString(), {
          signal: AbortSignal.timeout(TIMEOUT_MS),
          headers: { "user-agent": "wenhui-health-check" },
          cache: "no-store",
        });
        status = res.status;
        const body = await res.text();
        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
        if (!body.includes("東山文薈")) throw new Error("頁面內容不完整");
      });
      return { name: `${name}（${path}）`, ok: !r.error, status, ms: r.ms, error: r.error } as CheckResult;
    })
  );
  results.push(...checks);

  return { ok: results.every((r) => r.ok), checkedAt: new Date().toISOString(), results };
}

/** 存下這次結果，回傳「上一次」的結果（用來判斷是不是剛恢復） */
export async function recordHealthCheck(report: HealthReport): Promise<{ ok: boolean } | null> {
  await ensureSchema();
  const { rows } = await sql`SELECT ok FROM health_checks ORDER BY checked_at DESC LIMIT 1`;
  await sql`INSERT INTO health_checks (ok, detail) VALUES (${report.ok}, ${JSON.stringify(report.results)})`;
  await sql`DELETE FROM health_checks WHERE id NOT IN (SELECT id FROM health_checks ORDER BY checked_at DESC LIMIT 60)`;
  return rows[0] ? { ok: rows[0].ok as boolean } : null;
}

/** 後台總覽用：最近一次檢查結果 */
export async function getLatestHealthCheck(): Promise<{ ok: boolean; checkedAt: string; failed: string[] } | null> {
  await ensureSchema();
  const { rows } = await sql`SELECT ok, checked_at, detail FROM health_checks ORDER BY checked_at DESC LIMIT 1`;
  const r = rows[0];
  if (!r) return null;
  const detail = (Array.isArray(r.detail) ? r.detail : []) as CheckResult[];
  return {
    ok: r.ok as boolean,
    checkedAt: new Date(r.checked_at).toISOString(),
    failed: detail.filter((d) => !d.ok).map((d) => d.name),
  };
}

/** 收件人：環境變數 HEALTH_ALERT_EMAIL（逗號分隔），沒設定就寄給開啟通知的後台成員 */
async function alertRecipients(): Promise<string[]> {
  const fromEnv = String(process.env.HEALTH_ALERT_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  const { rows } = await sql`SELECT email FROM users WHERE receive_notifications = true`;
  return rows.map((u) => String(u.email || "")).filter(Boolean);
}

/** 寄出檢查結果通知；kind = "down"（出問題）或 "recovered"（恢復正常） */
export async function sendHealthAlert(report: HealthReport, kind: "down" | "recovered", siteUrl: string) {
  if (!process.env.RESEND_API_KEY) return false;
  const to = await alertRecipients();
  if (to.length === 0) return false;

  const rows = report.results
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px 6px 0">${r.ok ? "✅" : "❌"} ${escapeHtml(r.name)}</td>` +
        `<td style="padding:6px 0;color:#666">${r.ok ? `${r.ms} ms` : escapeHtml(r.error || "失敗")}</td></tr>`
    )
    .join("");
  const when = new Date(report.checkedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to,
    subject: kind === "down" ? "【東山文薈】網站健康檢查發現問題" : "【東山文薈】網站已恢復正常",
    html: `
      <div style="font-family:sans-serif;padding:24px;color:#201C18">
        <h2 style="margin-top:0;color:${kind === "down" ? "#AF3327" : "#2f6b3a"}">
          ${kind === "down" ? "網站有部分功能無法正常開啟" : "網站已恢復正常"}
        </h2>
        <p style="color:#666">檢查時間：${escapeHtml(when)}</p>
        <table style="border-collapse:collapse;font-size:14px">${rows}</table>
        <p style="margin-top:20px"><a href="${escapeHtml(siteUrl)}" style="color:#AF3327">開啟網站</a></p>
      </div>`,
  });
  return true;
}
