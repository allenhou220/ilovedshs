import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminForm from "../AdminForm";
import { createWorkAction } from "@/lib/actions";

export default async function NewWorkPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div style={{ padding: "40px", background: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "24px", fontWeight: "bold" }}>新增文章</h1>
        <AdminForm handlePublish={createWorkAction} submitLabel="確認發布" />
      </div>
    </div>
  );
}