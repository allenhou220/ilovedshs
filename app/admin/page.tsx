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
    redirect("/login");
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
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              我的帳號
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                帳號管理
              </Link>
            )}
            <Link
              href="/admin/new"
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "4px",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              ＋ 新增文章
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px",
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