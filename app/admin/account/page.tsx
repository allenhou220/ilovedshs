import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { ChangePasswordForm } from "@/components/change-password-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* 返回管理大廳 */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> 返回管理大廳
          </Link>
        </div>

        {/* 頁面標題與帳號資訊 */}
        <header className="border-b border-border/60 pb-8 mb-10">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            ACCOUNT SETTINGS / 帳號設定
          </p>
          <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl text-foreground mb-4">
            個人帳號管理
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/80 bg-muted/40 font-mono text-xs text-muted-foreground">
            <Mail size={13} className="text-primary" />
            <span>{session.user?.email}</span>
          </div>
        </header>

        {/* 密碼變更區塊 */}
        <section className="rounded-xl border border-border/70 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm">
          <div className="mb-6 flex items-center gap-2 pb-4 border-b border-border/40 text-foreground font-serif text-base font-light">
            <KeyRound size={17} className="text-primary" />
            <span>修改登入密碼</span>
          </div>
          
          <ChangePasswordForm />
        </section>

      </div>
    </main>
  );
}