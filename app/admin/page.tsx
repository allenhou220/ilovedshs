import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob"; // Vercel Blob
import AdminForm from "./AdminForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. 檢查登入狀態
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  // 2. Server Action：處理發布
  async function handlePublish(formData: FormData) {
    "use server";

    const titleInput = formData.get("title");
    const authorInput = formData.get("author");
    const categoryInput = formData.get("category");
    const contentInput = formData.get("content");
    const imageFile = formData.get("image") as File | null;

    if (!titleInput || !contentInput) {
      return;
    }

    const title = titleInput.toString();
    const author = authorInput ? authorInput.toString() : "匿名";
    const category = categoryInput ? categoryInput.toString() : "散文";
    const content = contentInput.toString();

    let imageUrl = "";

    // ⭐⭐⭐⭐⭐ 修正後的圖片上傳（含 token + store）
    if (imageFile && imageFile.size > 0) {
      const uniqueFilename = `${Date.now()}-${imageFile.name}`;

      const blob = await put(`works/${uniqueFilename}`, imageFile, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN, // 必填
      });

      imageUrl = blob.url;
    }

    // 3. 寫入資料庫
    await sql`
      INSERT INTO works (title, author, category, content, image_url)
      VALUES (${title}, ${author}, ${category}, ${content}, ${imageUrl})
    `;

    redirect("/works");
  }

  // 4. 畫面主體
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
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 標題與登出 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              後台發布系統
            </h1>
            <p style={{ color: "#888", fontSize: "14px" }}>
              在此輸入文章內容以發布至前台
            </p>
          </div>

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

        {/* 表單 */}
        <AdminForm handlePublish={handlePublish} />
      </div>
    </div>
  );
}
