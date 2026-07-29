import { sql } from "@vercel/postgres";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminForm from "../../AdminForm";
import { updateWorkAction } from "@/lib/actions";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const { rows } = await sql`SELECT * FROM works WHERE id = ${id}`;
  const work = rows[0];
  if (!work) notFound();

  const boundAction = updateWorkAction.bind(null, work.id);

  return (
    <div style={{ padding: "40px", background: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "24px", fontWeight: "bold" }}>編輯文章</h1>
        <AdminForm
          handlePublish={boundAction}
          submitLabel="儲存變更"
          defaultValues={{
            title: work.title,
            author: work.author,
            category: work.category,
            content: work.content,
            image_url: work.image_url,
          }}
        />
      </div>
    </div>
  );
}