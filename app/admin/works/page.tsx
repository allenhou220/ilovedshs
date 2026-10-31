import { sql } from "@vercel/postgres";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminList } from "@/components/admin-list";
import { ArrowLeft, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

// 文章管理頁：列出所有文章，可新增、編輯、排序、設定精選與刪除
export default async function AdminWorksPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  // 排序規則與前台「作品典藏」、上下移動功能完全一致
  const { rows: works } = await sql`
    SELECT id, title, author, category, issue, source_type, image_url, featured, sort_order 
    FROM works 
    ORDER BY sort_order ASC NULLS LAST, id DESC
  `;

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* 返回後台 */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> 返回後台
          </Link>
        </div>

        {/* 頁面標題與新增按鈕 */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/60 pb-8 mb-10 gap-6">
          <div>
            <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl text-foreground">
              文章管理
            </h1>
          </div>

          <div>
            <Link
              href="/admin/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-serif text-xs tracking-wider rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={15} /> 新增文章
            </Link>
          </div>
        </header>

        {/* 文章列表區塊 */}
        <section>
          <AdminList works={works as any} />
        </section>
      </div>
    </main>
  );
}