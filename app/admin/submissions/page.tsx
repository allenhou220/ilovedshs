import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import SubmissionsList from "@/components/submissions-list";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isAdmin = (session.user as any)?.role === "admin";

  const { rows } = await sql`
    SELECT * FROM submissions 
    WHERE status = 'pending' 
    ORDER BY created_at DESC
  `;

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* 返回管理大廳 */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> 返回管理大廳
          </Link>
        </div>

        {/* 稿件列表與動態匯出控制 */}
        <SubmissionsList submissions={rows as any[]} isAdmin={isAdmin} />

      </div>
    </main>
  );
}