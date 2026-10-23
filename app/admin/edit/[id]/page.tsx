import { sql } from "@vercel/postgres";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminForm from "../../AdminForm";
import { updateWorkAction } from "@/lib/actions";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { rows } = await sql`SELECT * FROM works WHERE id = ${Number(id)}`;
  const work = rows[0];
  if (!work) notFound();

  const boundAction = updateWorkAction.bind(null, work.id);

  return (
    <div style={{ padding: "40px", background: "hsl(var(--background))", color: "hsl(var(--foreground))", minHeight: "100vh", fontFamily: "sans-serif" }}>
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