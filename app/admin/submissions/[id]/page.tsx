import { sql } from "@vercel/postgres";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminForm from "@/app/admin/AdminForm";
import { publishSubmissionAction } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewSubmissionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  // 💡 解析 async params，確保能正確拿到 URL 中的投稿 ID
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    notFound();
  }

  let submission = null;
  try {
    const { rows } = await sql`SELECT * FROM submissions WHERE id::text = ${id}`;
    submission = rows[0];
  } catch (error) {
    console.error("讀取投稿失敗:", error);
  }

  if (!submission) {
    notFound();
  }

  const handlePublish = publishSubmissionAction.bind(null, id);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/submissions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft size={16} /> 返回投稿列表
          </Link>
        </div>

        {/* 學生投稿資訊卡片 */}
        <div className="mb-8 bg-[#18181b] border border-[#27272a] rounded-lg p-6 space-y-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-amber-400">📝 學生投稿資訊</h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded font-mono">
              {submission.is_anonymous ? "🕵️ 要求匿名發表" : "👤 具名發表"}
            </span>
          </div>
          <p className="text-sm text-gray-300"><strong>班級座號：</strong> {submission.class} {submission.seat_number} 號</p>
          <p className="text-sm text-gray-300"><strong>真實姓名：</strong> {submission.author_name}</p>
          <p className="text-sm text-gray-300"><strong>聯絡信箱：</strong> {submission.email}</p>
        </div>

        <h2 className="text-xl font-bold mb-4">審核與潤稿</h2>

        <AdminForm
          handlePublish={handlePublish}
          defaultValues={{
            title: submission.title,
            author: submission.is_anonymous ? "匿名" : submission.author_name,
            category: submission.category,
            content: submission.content,
            image_url: submission.image_url,
            sourceType: "學生投稿",
            issue: "",
          }}
          isSubmission={true}
          submitLabel="審核通過並發布作品"
        />
      </div>
    </div>
  );
}