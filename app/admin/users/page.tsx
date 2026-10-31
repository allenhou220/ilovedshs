import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateUserForm } from "@/components/create-user-form";
import UserRow from "./UserRow";
import { ArrowLeft, UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

// 帳號管理頁：僅限總管理員；其他人會被導回後台首頁（middleware 也有一層保護）
export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin");
  }

  await ensureSchema();

  const { rows: users } = await sql`SELECT id, email, role, receive_notifications FROM users ORDER BY id ASC`;
  const currentUserEmail = session.user?.email;

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* 返回後台 */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> 返回後台
          </Link>
        </div>

        {/* 頁面標題區塊 */}
        <header className="border-b border-border/60 pb-8 mb-10">
          <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl text-foreground">
            帳號管理
          </h1>
        </header>

        {/* 新增帳號表單 */}
        <section className="rounded-xl border border-border/70 bg-card/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm mb-10">
          <div className="mb-6 flex items-center gap-2 pb-4 border-b border-border/40 text-foreground font-serif text-base font-light">
            <UserPlus size={17} className="text-primary" />
            <span>新增帳號</span>
          </div>

          <CreateUserForm />
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