import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ChangePasswordForm } from "@/components/change-password-form";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div style={{ padding: "40px", background: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "bold" }}>我的帳號</h1>
            <p style={{ color: "#888", fontSize: "14px" }}>{session.user?.email}</p>
          </div>
          <Link href="/admin" style={{ color: "#888", fontSize: "14px", textDecoration: "none" }}>
            ← 返回後台
          </Link>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}