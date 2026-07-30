import { sql } from "@vercel/postgres";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminList } from "@/components/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const isAdmin = (session.user as any)?.role === "admin";

  const { rows: works } = await sql`SELECT id, title, author, category, image_url, featured, sort_order FROM works ORDER BY sort_order ASC`;

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "bold" }}>後台管理</h1>
            <p style={{ color: "#888", fontSize: "14px" }}>管理所有已發布的文章</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/admin/account"
              style={{
                width: "128px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              我的帳號
            </Link>
            
            {isAdmin && (
              <Link
                href="/admin/users"
                style={{
                  width: "128px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "14px",
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                帳號管理
              </Link>
            )}
            
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
            
            <form action="/api/auth/signout" method="POST" style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  width: "128px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                登出系統
              </button>
            </form>
          </div>
        </div>

        <AdminList works={works as any} />
      </div>
    </div>
  );
}