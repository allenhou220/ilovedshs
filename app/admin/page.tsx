import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText, Inbox, LayoutTemplate, User, Users, LogOut } from "lucide-react";
import { getSubmissionStatus, toggleSubmissionStatusAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const isAdmin = (session.user as any)?.role === "admin";
  
  // 💡 抓取目前是否開放投稿的狀態
  const isSubmissionOpen = await getSubmissionStatus();

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* 頂部 Header：歡迎詞與帳號相關操作 */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/60 pb-8 mb-12 gap-6">
          <div>
            <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
              EDITORIAL DESK / 編輯工作檯
            </p>
            <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl md:text-5xl text-foreground">
              後台管理大廳
            </h1>
            <p className="mt-2 font-serif text-sm text-muted-foreground font-light tracking-wide">
              歡迎回來，請選擇您要執行的刊物管理項目。
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/admin/account" 
              className="inline-flex items-center gap-2 px-4 py-2 border border-border/80 rounded-md font-serif text-xs tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <User size={15} /> 我的帳號
            </Link>
            
            {isAdmin && (
              <>
                <Link 
                  href="/admin/users" 
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border/80 rounded-md font-serif text-xs tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Users size={15} /> 帳號管理
                </Link>

                {/* 💡 總管理員專屬：開放/停用投稿開關按鈕 */}
                <form action={async () => {
                  "use server";
                  await toggleSubmissionStatusAction(isSubmissionOpen);
                }} className="m-0">
                  <button 
                    type="submit" 
                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-md font-serif text-xs tracking-wider transition-colors ${
                      isSubmissionOpen 
                        ? 'border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive' 
                        : 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500'
                    }`}
                  >
                    {isSubmissionOpen ? "🔴 停用前台投稿" : "🟢 開放前台投稿"}
                  </button>
                </form>
              </>
            )}

            <form action="/api/auth/signout" method="POST" className="m-0">
              <button 
                type="submit" 
                className="inline-flex items-center gap-2 px-4 py-2 border border-destructive/50 bg-destructive/10 text-destructive rounded-md font-serif text-xs tracking-wider hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut size={15} /> 登出
              </button>
            </form>
          </div>
        </header>
        
        {/* 三個核心功能大按鈕 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. 文章上架與管理 */}
          <Link 
            href="/admin/works" 
            className="group relative flex flex-col justify-between p-8 rounded-lg border border-border/70 bg-card/40 hover:bg-card hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            <div>
              <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                <FileText size={28} />
              </div>
              <h2 className="font-serif text-2xl font-light tracking-wide text-foreground mb-3 group-hover:text-primary transition-colors">
                文章上架管理
              </h2>
              <p className="font-serif text-sm leading-[1.8] text-muted-foreground font-light">
                新增、編輯、刪除正式發布的文章，設定排序與首頁精選。
              </p>
            </div>
            <span className="mt-8 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-primary transition-colors">
              MANAGE WORKS &rarr;
            </span>
          </Link>

          {/* 2. 學生投稿審核 (💡 依據開關狀態動態呈現) */}
          {isSubmissionOpen ? (
            <Link 
              href="/admin/submissions" 
              className="group relative flex flex-col justify-between p-8 rounded-lg border border-border/70 bg-card/40 hover:bg-card hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <div>
                <div className="mb-6 inline-flex p-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform duration-500 group-hover:scale-110">
                  <Inbox size={28} />
                </div>
                <h2 className="font-serif text-2xl font-light tracking-wide text-foreground mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  學生投稿審核
                </h2>
                <p className="font-serif text-sm leading-[1.8] text-muted-foreground font-light">
                  檢視學生投遞的稿件，審核通過後可一鍵將優良作品發布。
                </p>
              </div>
              <span className="mt-8 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                REVIEW SUBMISSIONS &rarr;
              </span>
            </Link>
          ) : (
            <div className="relative flex flex-col justify-between p-8 rounded-lg border border-border/40 bg-muted/20 opacity-60 cursor-not-allowed">
              <div>
                <div className="mb-6 inline-flex p-4 rounded-full bg-muted text-muted-foreground">
                  <Inbox size={28} />
                </div>
                <h2 className="font-serif text-2xl font-light tracking-wide text-muted-foreground mb-3">
                  學生投稿審核
                </h2>
                <p className="font-serif text-sm leading-[1.8] text-muted-foreground/70 font-light mb-4">
                  檢視學生投遞的稿件，審核通過後可一鍵將優良作品發布。
                </p>
              </div>
              <div>
                <span className="inline-block border border-destructive/30 text-destructive font-serif text-xs px-3 py-1 rounded tracking-widest bg-destructive/5">
                  目前已停用投稿
                </span>
              </div>
            </div>
          )}

          {/* 3. 首頁外觀設定 */}
          <Link 
            href="/admin/homepage" 
            className="group relative flex flex-col justify-between p-8 rounded-lg border border-border/70 bg-card/40 hover:bg-card hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            <div>
              <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                <LayoutTemplate size={28} />
              </div>
              <h2 className="font-serif text-2xl font-light tracking-wide text-foreground mb-3 group-hover:text-primary transition-colors">
                首頁外觀設定
              </h2>
              <p className="font-serif text-sm leading-[1.8] text-muted-foreground font-light">
                修改首頁大標題、引言文字，以及更換首頁的主題封面圖片。
              </p>
            </div>
            <span className="mt-8 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-primary transition-colors">
              HOMEPAGE SETTINGS &rarr;
            </span>
          </Link>

        </div>
      </div>
    </main>
  );
}