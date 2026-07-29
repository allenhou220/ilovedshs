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

// 新增文章
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

// 更新文章（圖片沒有重新選擇時，保留原本的 image_url）
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

// 刪除文章
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

// ===== 帳號管理（僅限總管理員 role='admin'） =====

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("權限不足，僅限總管理員操作");
  }
  return session;
}

// 新增帳號（老師/學生），密碼會用 bcrypt 加密後存入資料庫
export async function createUserAction(formData: FormData) {
  await requireAdmin();

  const bcrypt = (await import("bcryptjs")).default;

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "editor");

  if (!email || !password) return;

  const hashedPassword = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO users (email, password, role)
    VALUES (${email}, ${hashedPassword}, ${role})
  `;

  revalidatePath("/admin/users");
}

// 刪除帳號
export async function deleteUserAction(id: number) {
  const session = await requireAdmin();

  // 防止總管理員不小心刪掉自己導致無法登入
  if (session.user?.email) {
    const { rows } = await sql`SELECT email FROM users WHERE id = ${id}`;
    if (rows[0]?.email === session.user.email) {
      throw new Error("不能刪除自己的帳號");
    }
  }

  await sql`DELETE FROM users WHERE id = ${id}`;

  revalidatePath("/admin/users");
}

// 使用者自己修改密碼（需先驗證舊密碼正確）
export async function changePasswordAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("未登入");

  const bcrypt = (await import("bcryptjs")).default;

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (!currentPassword || !newPassword) return { error: "請填寫完整" };
  if (newPassword.length < 6) return { error: "新密碼至少要 6 個字元" };

  const { rows } = await sql`SELECT * FROM users WHERE email = ${session.user.email}`;
  const user = rows[0];
  if (!user) return { error: "找不到帳號" };

  const stored = String(user.password || "");
  const isHashed = stored.startsWith("$2a$") || stored.startsWith("$2b$");
  const matches = isHashed ? await bcrypt.compare(currentPassword, stored) : currentPassword === stored;

  if (!matches) return { error: "目前密碼不正確" };

  const newHashed = await bcrypt.hash(newPassword, 10);
  await sql`UPDATE users SET password = ${newHashed} WHERE id = ${user.id}`;

  return { success: true };
}