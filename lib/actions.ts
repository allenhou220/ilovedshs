"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("未登入");
  }
}

export async function createWorkAction(formData: FormData) {
  await requireSession();

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim() || "匿名";
  const category = String(formData.get("category") || "散文");
  const content = String(formData.get("content") || "").trim();
  const imageFile = formData.get("image") as File | null;

  if (!title || !content) return;

  let imageUrl = "";
  if (imageFile && imageFile.size > 0) {
    const uniqueFilename = `${Date.now()}-${imageFile.name}`;
    const blob = await put(`works/${uniqueFilename}`, imageFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    imageUrl = blob.url;
  }

  await sql`
    INSERT INTO works (title, author, category, content, image_url)
    VALUES (${title}, ${author}, ${category}, ${content}, ${imageUrl})
  `;

  revalidatePath("/admin");
  revalidatePath("/works");
  revalidatePath("/");
  redirect("/admin");
}

export async function updateWorkAction(id: number, formData: FormData) {
  await requireSession();

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim() || "匿名";
  const category = String(formData.get("category") || "散文");
  const content = String(formData.get("content") || "").trim();
  const existingImageUrl = String(formData.get("existingImage") || "");
  const imageFile = formData.get("image") as File | null;

  if (!title || !content) return;

  let imageUrl = existingImageUrl;
  if (imageFile && imageFile.size > 0) {
    const uniqueFilename = `${Date.now()}-${imageFile.name}`;
    const blob = await put(`works/${uniqueFilename}`, imageFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    imageUrl = blob.url;
  }

  await sql`
    UPDATE works
    SET title = ${title}, author = ${author}, category = ${category}, content = ${content}, image_url = ${imageUrl}
    WHERE id = ${id}
  `;

  revalidatePath("/admin");
  revalidatePath("/works");
  revalidatePath("/");
  revalidatePath(`/works/${id}`);
  redirect("/admin");
}

export async function deleteWorkAction(id: number) {
  await requireSession();

  await sql`DELETE FROM works WHERE id = ${id}`;

  revalidatePath("/admin");
  revalidatePath("/works");
  revalidatePath("/");
}
// 切換精選狀態（設成精選時，會自動把其他文章的精選取消，確保首頁只有一篇精選）
export async function toggleFeaturedAction(id: number, nextFeatured: boolean) {
  await requireSession();

  if (nextFeatured) {
    await sql`UPDATE works SET featured = false WHERE featured = true`;
  }
  await sql`UPDATE works SET featured = ${nextFeatured} WHERE id = ${id}`;

  revalidatePath("/admin");
  revalidatePath("/works");
  revalidatePath("/");
}

// 上下移動文章排序（跟相鄰的那篇互換 sort_order）
export async function moveWorkAction(id: number, direction: "up" | "down") {
  await requireSession();

  const { rows } = await sql`SELECT id, sort_order FROM works ORDER BY sort_order ASC`;
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const target = rows[swapIndex];

  await sql`UPDATE works SET sort_order = ${target.sort_order} WHERE id = ${current.id}`;
  await sql`UPDATE works SET sort_order = ${current.sort_order} WHERE id = ${target.id}`;

  revalidatePath("/admin");
  revalidatePath("/works");
  revalidatePath("/");
}