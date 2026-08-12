import { sql } from "@vercel/postgres";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminList } from "@/components/admin-list";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  // 💡 在 SQL SELECT 加上 issue 與 source_type
  const { rows: works } = await sql`
    SELECT id, title, author, category, issue, source_type, image_url, featured, sort_order 
    FROM works 
    ORDER BY sort_order ASC
  `;

  return (
    <div
      style={{
        padding: "40px",
        background: "#121212",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* 返回大廳的連結 */}
        <div style={{ marginBottom: "20px" }}>
          <Link href="/admin" style={{ color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <ArrowLeft size={16} /> 返回管理大廳
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "bold" }}>文章管理</h1>
            <p style={{ color: "#888", fontSize: "14px" }}>管理所有已發布的文章</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link
              href="/admin/new"
              style={{
                width: "128px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: "bold",
                boxSizing: "border-box",
              }}
            >
              ＋ 新增文章
            </Link>
          </div>
        </div>

        <AdminList works={works as any} />
      </div>
    </div>
  );
}