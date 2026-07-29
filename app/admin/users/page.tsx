import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteUserAction } from "@/lib/actions";
import { CreateUserForm } from "@/components/create-user-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any)?.role !== "admin") {
    redirect("/admin");
  }

  const { rows: users } = await sql`SELECT id, email, role FROM users ORDER BY id ASC`;

  return (
    <div style={{ padding: "40px", background: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "bold" }}>帳號管理</h1>
            <p style={{ color: "#888", fontSize: "14px" }}>新增或移除老師／學生的登入帳號</p>
          </div>
          <Link href="/admin" style={{ color: "#888", fontSize: "14px", textDecoration: "none" }}>
            ← 返回後台
          </Link>
        </div>

        <CreateUserForm />

        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #2a2a2a", borderRadius: "6px", overflow: "hidden" }}>
          {users.map((u: any) => (
            <div
              key={u.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2a2a2a" }}
            >
              <div>
                <p style={{ fontSize: "14px" }}>{u.email}</p>
                <p style={{ fontSize: "12px", color: u.role === "admin" ? "#fbbf24" : "#888" }}>
                  {u.role === "admin" ? "總管理員" : "編輯"}
                </p>
              </div>
              <form action={deleteUserAction.bind(null, u.id)}>
                <button
                  type="submit"
                  style={{ padding: "6px 12px", fontSize: "13px", border: "1px solid #7f1d1d", borderRadius: "4px", background: "transparent", color: "#f87171", cursor: "pointer" }}
                >
                  刪除
                </button>
              </form>
            </div>
          ))}
          {users.length === 0 && <p style={{ padding: "24px", textAlign: "center", color: "#666" }}>目前沒有帳號</p>}
        </div>
      </div>
    </div>
  );
}