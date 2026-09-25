import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createUserAction } from "@/lib/actions";
import UserRow from "./UserRow";
import { ArrowLeft, UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin");
  }

  // 確保通知欄位存在
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_notifications BOOLEAN DEFAULT false;`;
  
  const { rows: users } = await sql`SELECT id, email, role, receive_notifications FROM users ORDER BY id ASC`;
  const currentUserEmail = session.user?.email;

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* 返回管理大廳 */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> 返回管理大廳
          </Link>
        </div>

        {/* 頁面標題區塊 */}
        <header className="border-b border-border/60 pb-8 mb-10">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            USER MANAGEMENT / 帳號管理
          </p>
          <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl text-foreground">
            團隊帳號與權限管理
          </h1>
          <p className="mt-2 font-serif text-sm text-muted-foreground font-light tracking-wide">
            新增或移除編輯成員帳號，調整管理權限與系統通知設定。
          </p>
        </header>

        {/* 新增帳號表單 */}
        <section className="rounded-xl border border-border/70 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm mb-10">
          <div className="mb-6 flex items-center gap-2 pb-4 border-b border-border/40 text-foreground font-serif text-base font-light">
            <UserPlus size={17} className="text-primary" />
            <span>新增團隊成員帳號</span>
          </div>

          <form 
            action={async (formData) => {
              "use server";
              await createUserAction(formData);
            }} 
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-5">
              <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
                Email 帳號
              </label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="name@example.com"
                className="w-full rounded-md border border-border/80 bg-background/60 px-3.5 py-2.5 font-serif text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
                預設密碼
              </label>
              <input 
                type="text" 
                name="password" 
                required 
                placeholder="手動輸入"
                className="w-full rounded-md border border-border/80 bg-background/60 px-3.5 py-2.5 font-serif text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
                身分權限
              </label>
              <select 
                name="role" 
                className="w-full rounded-md border border-border/80 bg-background/60 px-3.5 py-2.5 font-serif text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="editor" className="bg-background text-foreground">編輯 (老師/學生)</option>
                <option value="admin" className="bg-background text-foreground">總管理員</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-primary py-2.5 px-4 font-serif text-xs tracking-wider text-primary-foreground font-medium transition-colors hover:bg-primary/90 shadow-sm"
              >
                新增帳號
              </button>
            </div>
          </form>
        </section>

        {/* 使用者列表 */}
        <section className="rounded-xl border border-border/70 bg-card/40 overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-6 py-3.5 border-b border-border/40 flex items-center justify-between text-xs font-serif text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users size={14} className="text-primary" /> 現有成員帳號列表 ({users.length})
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {users.map((user) => (
              <UserRow 
                key={user.id} 
                user={user} 
                isCurrentUser={user.email === currentUserEmail} 
              />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}