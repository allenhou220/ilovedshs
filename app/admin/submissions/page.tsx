import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";

import SubmissionsList from "@/components/submissions-list";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 💡 直接在這裏寫刪除邏輯 (Server Action)
  async function deleteSubmission(id: number | string) {
    'use server'
    await sql`DELETE FROM submissions WHERE id = ${id}`;
    revalidatePath('/admin/submissions'); // 刪除後自動重刷頁面與數字計數
  }

  const { rows } = await sql`
    SELECT * FROM submissions 
    WHERE status = 'pending' 
    ORDER BY created_at DESC
  `;

  return (
    <div className="min-h-screen bg-[#09090b] p-8 text-white md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-white transition-colors font-medium">
            <ArrowLeft size={16} /> 返回管理大廳
          </Link>
        </div>

        <header className="mb-8 flex items-end justify-between border-b border-[#27272a] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold">待審核稿件</h1>
            <p className="mt-2 text-sm text-[#a1a1aa]">
              這裡列出了所有學生透過前台表單投遞，且尚未發布的作品。
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-[#8c4033]">{rows.length}</span>
            <span className="ml-2 text-sm text-[#71717a]">篇待審核</span>
          </div>
        </header>

        {/* 💡 把 onDelete 傳進去 */}
        <SubmissionsList submissions={rows as any[]} onDelete={deleteSubmission} />
      </div>
    </div>
  );
}