import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, FileText, Inbox, LayoutTemplate, User, Users } from "lucide-react";
import { toggleSubmissionStatusAction } from "@/lib/actions";
import { getDashboardStats } from "@/lib/queries";
import { getLatestHealthCheck } from "@/lib/health";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

// 數據卡片：有 href 時整張卡片可以點進去
function StatCard({ label, value, hint, href }: { label: string; value: number | string; hint?: string; href?: string }) {
  const body = (
    <>
      <span className="font-serif text-xs tracking-[0.15em] text-muted-foreground">{label}</span>
      <span className="font-display text-4xl font-bold tabular-nums text-foreground">{value}</span>
      {hint && <span className="font-serif text-xs text-muted-foreground">{hint}</span>}
    </>
  );
  const cls = "flex flex-col gap-2 border border-border bg-card p-5 transition-colors";
  return href ? (
    <Link href={href} className={`${cls} hover:border-foreground`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// 後台功能選單的項目（名稱、說明與連結）
const MENU = [
  { href: "/admin/works", icon: FileText, title: "文章上架管理", desc: "新增、編輯、刪除文章，設定排序與首頁精選。" },
  { href: "/admin/submissions", icon: Inbox, title: "學生投稿審核", desc: "閱讀投稿、發布作品，或標記本期未收錄並留下回饋。" },
  { href: "/admin/issues", icon: BookOpen, title: "期刊管理", desc: "設定每一期的主題、卷首語、編輯名單與封面。" },
  { href: "/admin/homepage", icon: LayoutTemplate, title: "首頁外觀設定", desc: "修改首頁大標題、引言文字與封面圖片。" },
];

// 後台總覽：沒登入就導回首頁；「帳號管理」等僅限總管理員的項目只對 admin 顯示
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const isAdmin = (session.user as any)?.role === "admin";
  // 健康檢查結果讀不到（例如資料表還沒建立）也不影響後台
  const [stats, health] = await Promise.all([getDashboardStats(), getLatestHealthCheck().catch(() => null)]);
  // 各文體作品數的長條圖，以最多的那一項當作 100% 寬度
  const maxCat = Math.max(1, ...stats.categories.map((c) => c.count));

  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground sm:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* ===== 頂部 ===== */}
        <header className="mb-10 flex flex-col justify-between gap-6 border-b border-foreground pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Editorial Desk ／ 編輯工作檯</p>
            <h1 className="font-serif text-3xl font-light tracking-[0.12em] sm:text-4xl md:text-5xl">後台總覽</h1>
            <p className="mt-2 font-serif text-sm text-muted-foreground">歡迎回來，{session.user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/account" className="inline-flex min-h-10 items-center gap-2 border border-border px-4 font-serif text-xs tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
              <User size={15} /> 我的帳號
            </Link>
            {isAdmin && (
              <Link href="/admin/users" className="inline-flex min-h-10 items-center gap-2 border border-border px-4 font-serif text-xs tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                <Users size={15} /> 帳號管理
              </Link>
            )}
            <LogoutButton />
          </div>
        </header>

        {/* ===== 數據 ===== */}
        <section aria-label="數據總覽" className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="已發布作品" value={stats.totalWorks} hint={`其中學生投稿 ${stats.studentWorks} 篇`} href="/admin/works" />
          <StatCard label="待審稿件" value={stats.pending} hint={stats.pending > 0 ? "點此開始審稿" : "目前沒有待審稿件"} href="/admin/submissions" />
          <StatCard label="近 30 天投稿" value={stats.last30} />
          <StatCard label="投稿審核結果" value={`${stats.publishedSubmissions}／${stats.rejectedSubmissions}`} hint="已刊登／未收錄" />
        </section>

        {/* ===== 每日網站健康檢查 ===== */}
        {health && (
          <p
            role="status"
            className={`-mt-8 mb-12 flex flex-wrap items-center gap-x-2 border-l-2 pl-3 font-serif text-sm ${
              health.ok ? "border-foreground/30 text-muted-foreground" : "border-primary text-primary"
            }`}
          >
            <span>{health.ok ? "網站健康檢查：一切正常" : `網站健康檢查發現問題：${health.failed.join("、")}`}</span>
            <span className="text-xs text-muted-foreground">
              （{new Date(health.checkedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} 檢查）
            </span>
          </p>
        )}

        {/* ===== 投稿開關 ===== */}
        <section className="mb-12 flex flex-col gap-4 border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className={`size-2.5 rounded-full ${stats.isSubmissionOpen ? "bg-emerald-600" : "bg-destructive"}`} />
            <span className="font-serif text-base">前台投稿目前{stats.isSubmissionOpen ? "開放中" : "已停用"}</span>
          </div>
          {isAdmin ? (
            <form action={toggleSubmissionStatusAction}>
              <button
                type="submit"
                className={`min-h-10 border px-4 font-serif text-xs tracking-wider transition-colors ${
                  stats.isSubmissionOpen
                    ? "border-destructive/50 text-destructive hover:bg-destructive/10"
                    : "border-emerald-700/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-400"
                }`}
              >
                {stats.isSubmissionOpen ? "停用前台投稿" : "開放前台投稿"}
              </button>
            </form>
          ) : (
            <span className="font-serif text-xs text-muted-foreground">只有總管理員可以切換</span>
          )}
        </section>

        <div className="mb-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* ===== 最新待審稿件 ===== */}
          <section className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-serif text-lg tracking-[0.1em]">最新待審稿件</h2>
              <Link href="/admin/submissions" className="font-serif text-xs tracking-[0.1em] text-primary">全部稿件 →</Link>
            </div>
            {stats.recent.length === 0 ? (
              <p className="px-5 py-10 text-center font-serif text-sm text-muted-foreground">目前沒有待審稿件。</p>
            ) : (
              <ul>
                {stats.recent.map((s: any) => (
                  <li key={s.id} className="border-b border-border last:border-b-0">
                    <Link href={`/admin/submissions/${s.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 transition-colors hover:bg-secondary/60">
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="truncate font-serif text-base">{s.title || "無標題"}</span>
                        <span className="font-serif text-xs text-muted-foreground">
                          {s.category || "散文"}・{s.class} {s.author_name}
                        </span>
                      </span>
                      <span className="font-sans text-xs text-muted-foreground">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString("zh-TW") : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ===== 各文體作品數 ===== */}
          <section className="border border-border bg-card p-5">
            <h2 className="mb-5 font-serif text-lg tracking-[0.1em]">各文體作品數</h2>
            {stats.categories.length === 0 ? (
              <p className="py-6 text-center font-serif text-sm text-muted-foreground">尚無作品。</p>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {stats.categories.map((c) => (
                  <li key={c.category} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3">
                    <span className="font-serif text-sm">{c.category}</span>
                    <span className="h-2.5 bg-secondary" aria-hidden="true">
                      <span className="block h-full bg-primary" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                    </span>
                    <span className="text-right font-sans text-sm tabular-nums">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ===== 功能選單 ===== */}
        <section aria-label="管理功能" className="grid gap-4 sm:grid-cols-2">
          {MENU.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} className="group flex gap-5 border border-border bg-card p-6 transition-colors hover:border-foreground">
              <span className="flex size-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
                <Icon size={22} />
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="font-serif text-xl tracking-[0.08em] transition-colors group-hover:text-primary">{title}</span>
                <span className="font-serif text-sm leading-[1.8] text-muted-foreground">{desc}</span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
