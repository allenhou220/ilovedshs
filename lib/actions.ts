"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { createClient } from "redis";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_to_pass_build");

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("❌ 警告：未找到 REDIS_URL 環境變數，請檢查 .env.local");
}

const redisClient = createClient({ url: redisUrl });
redisClient.on("error", (err) => console.error("Redis 連線錯誤:", err));

let isConnected = false;
async function connectRedis() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("未登入");
  }
}

async function ensureColumnsExist() {
  try {
    await sql`ALTER TABLE works ADD COLUMN IF NOT EXISTS issue TEXT DEFAULT '';`;
    await sql`ALTER TABLE works ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT '文薈成員創作';`;
  } catch (error) {
    console.error("更新資料庫欄位失敗:", error);
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("權限不足，僅限總管理員操作");
  }
  return session;
}

// ===== 文章管理功能 =====

export async function createWorkAction(formData: FormData) {
  await requireSession();
  await ensureColumnsExist();

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim() || "匿名";
  const category = String(formData.get("category") || "散文");
  const sourceType = String(formData.get("sourceType") || "文薈成員創作").trim();
  
  const issue = sourceType === "學生投稿" ? "" : String(formData.get("issue") || "").trim();
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

  const { rows } = await sql`SELECT MIN(sort_order) as min_order FROM works`;
  const minOrder = (rows[0]?.min_order ?? 1) - 1;

  await sql`
    INSERT INTO works (title, author, category, issue, source_type, content, image_url, sort_order)
    VALUES (${title}, ${author}, ${category}, ${issue}, ${sourceType}, ${content}, ${imageUrl}, ${minOrder})
  `;

  revalidatePath("/admin");
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
  redirect("/admin/works");
}

export async function updateWorkAction(id: number, formData: FormData) {
  await requireSession();
  await ensureColumnsExist();

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim() || "匿名";
  const category = String(formData.get("category") || "散文");
  const sourceType = String(formData.get("sourceType") || "文薈成員創作").trim();
  
  const issue = sourceType === "學生投稿" ? "" : String(formData.get("issue") || "").trim();
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
    SET title = ${title}, author = ${author}, category = ${category}, issue = ${issue}, source_type = ${sourceType}, content = ${content}, image_url = ${imageUrl}
    WHERE id = ${id}
  `;

  revalidatePath("/admin");
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
  revalidatePath(`/works/${id}`);
  redirect("/admin/works");
}

export async function deleteWorkAction(id: number) {
  await requireSession();
  await sql`DELETE FROM works WHERE id = ${id}`;

  revalidatePath("/admin");
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
}

export async function toggleFeaturedAction(id: number, nextFeatured: boolean) {
  await requireSession();
  if (nextFeatured) {
    await sql`UPDATE works SET featured = false WHERE featured = true`;
  }
  await sql`UPDATE works SET featured = ${nextFeatured} WHERE id = ${id}`;

  revalidatePath("/admin");
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
}

export async function moveWorkAction(id: number, direction: "up" | "down") {
  await requireSession();
  const { rows } = await sql`
    SELECT id, sort_order 
    FROM works 
    ORDER BY COALESCE(sort_order, id) ASC
  `;
  
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return;

  const newOrder = [...rows];
  const temp = newOrder[index];
  newOrder[index] = newOrder[swapIndex];
  newOrder[swapIndex] = temp;

  await Promise.all(newOrder.map((work, i) => {
    return sql`UPDATE works SET sort_order = ${i + 1} WHERE id = ${work.id}`;
  }));

  revalidatePath("/admin");
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/");
}

export async function uploadEditorImageAction(formData: FormData) {
  await requireSession();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "未選擇圖片" };
  }

  const uniqueFilename = `editor/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const blob = await put(uniqueFilename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url };
}

// ===== 帳號管理功能 =====

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const bcrypt = (await import("bcryptjs")).default;
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "editor");

  if (!email || !password) return { error: "請填寫完整資訊" };

  try {
    const { rowCount } = await sql`SELECT 1 FROM users WHERE email = ${email}`;
    if (rowCount !== null && rowCount > 0) {
      return { error: "此信箱已經被註冊過囉！" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (email, password, role)
      VALUES (${email}, ${hashedPassword}, ${role})
    `;

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("建立帳號失敗:", error);
    return { error: "系統發生異常，無法建立帳號" };
  }
}

export async function deleteUserAction(id: number) {
  const session = await requireAdmin();
  if (session.user?.email) {
    const { rows } = await sql`SELECT email FROM users WHERE id = ${id}`;
    if (rows[0]?.email === session.user.email) {
      throw new Error("不能刪除自己的帳號");
    }
  }

  await sql`DELETE FROM users WHERE id = ${id}`;
  revalidatePath("/admin/users");
}

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

export async function updateUserRoleAction(id: number, role: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("權限不足，僅限總管理員操作");
  }
  await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
  revalidatePath("/admin/users");
}

export async function toggleUserNotificationAction(id: number, currentStatus: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("權限不足，僅限總管理員操作");
  }
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_notifications BOOLEAN DEFAULT false;`;
  await sql`UPDATE users SET receive_notifications = ${!currentStatus} WHERE id = ${id}`;
  revalidatePath("/admin/users");
}

// ===== 學生投稿功能 =====

export async function submitStudentWorkAction(formData: FormData) {
  const honeypot = String(formData.get("website_hp") || "");
  if (honeypot) return;

  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const client = await connectRedis();
    const key = `submit_${ip}`;
    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, 600);
    }

    if (count > 3) {
      throw new Error("投稿頻率過高，請 10 分鐘後再試！");
    }
  } catch (error: any) {
    if (error.message?.includes("投稿頻率過高")) throw error;
    console.error("Rate limit 檢查異常:", error);
  }

  const studentClass = String(formData.get("class") || "").trim();
  const rawSeat = formData.get("seatNumber") || formData.get("seat_number");
  const parsedSeat = parseInt(String(rawSeat || "0"), 10);
  const seatNumber = isNaN(parsedSeat) ? 0 : parsedSeat;

  const authorName = String(formData.get("authorName") || formData.get("author_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const category = String(formData.get("category") || "散文");
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const isAnonymous = formData.get("isAnonymous") === "on" || formData.get("is_anonymous") === "on";
  const imageFile = formData.get("image") as File | null;

  if (!studentClass || !authorName || !email || !title || !content) {
    throw new Error("請填寫所有必要的欄位");
  }

  if (!email.toLowerCase().endsWith("@stu.tshs.tp.edu.tw")) {
    throw new Error("必須使用學校核發的 @stu.tshs.tp.edu.tw 信箱");
  }

  let imageUrl = "";
  if (imageFile && imageFile.size > 0) {
    const uniqueFilename = `submissions/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await put(uniqueFilename, imageFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    imageUrl = blob.url;
  }

  await sql`
    INSERT INTO submissions (class, seat_number, author_name, email, category, title, content, image_url, status, is_anonymous)
    VALUES (${studentClass}, ${seatNumber}, ${authorName}, ${email}, ${category}, ${title}, ${content}, ${imageUrl}, 'pending', ${isAnonymous})
  `;

  // 💡 寄信通知邏輯：直接向資料庫查詢開啟通知的使用者
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_notifications BOOLEAN DEFAULT false;`;
    
    const { rows: notifyUsers } = await sql`SELECT email FROM users WHERE receive_notifications = true`;
    const adminEmailsArray = notifyUsers.map(u => u.email).filter(e => e.length > 0);
    
    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (adminEmailsArray.length > 0 && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: adminEmailsArray,
        subject: `【新投稿通知】${studentClass} ${authorName} - 《${title}》`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #8c4033; margin-top: 0;">📩 收到新的學生作品投稿！</h2>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
            <p><strong>文章標題：</strong> ${title}</p>
            <p><strong>文章分類：</strong> ${category}</p>
            <p><strong>投稿學生：</strong> ${studentClass} ${seatNumber}號 - ${authorName}</p>
            <p><strong>聯絡信箱：</strong> ${email}</p>
            <p><strong>發表方式：</strong> ${isAnonymous ? "🕵️ 要求匿名發表" : "👤 具名發表"}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <a href="${siteUrl}/admin/submissions" 
               style="display: inline-block; background-color: #8c4033; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              🚀 前往後台審核稿件
            </a>
          </div>
        `,
      });
    }
  } catch (error) {
    console.error("Email 通知發送失敗：", error);
  }

  revalidatePath("/admin/submissions");
}

export async function publishSubmissionAction(submissionId: string, formData: FormData) {
  await requireSession();
  await ensureColumnsExist();

  const title = String(formData.get("title") || "").trim();
  const author = String(formData.get("author") || "").trim() || "匿名";
  const category = String(formData.get("category") || "散文");
  const sourceType = String(formData.get("sourceType") || "學生投稿").trim();
  
  const issue = sourceType === "學生投稿" ? "" : String(formData.get("issue") || "").trim();
  const content = String(formData.get("content") || "").trim();
  
  const existingImageUrl = String(formData.get("existingImage") || "");
  const imageFile = formData.get("image") as File | null;
  let imageUrl = existingImageUrl;
  
  if (imageFile && imageFile.size > 0) {
    const uniqueFilename = `${Date.now()}-${imageFile.name}`;
    const blob = await put(`works/${uniqueFilename}`, imageFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    imageUrl = blob.url;
  }

  const { rows } = await sql`SELECT MIN(sort_order) as min_order FROM works`;
  const minOrder = (rows[0]?.min_order ?? 1) - 1;

  await sql`
    INSERT INTO works (title, author, category, issue, source_type, content, image_url, sort_order)
    VALUES (${title}, ${author}, ${category}, ${issue}, ${sourceType}, ${content}, ${imageUrl}, ${minOrder})
  `;

  await sql`UPDATE submissions SET status = 'published' WHERE id = ${submissionId}`;

  revalidatePath("/admin");
  revalidatePath("/admin/works");
  revalidatePath("/admin/submissions");
  revalidatePath("/works");
  revalidatePath("/");
  redirect("/admin/submissions");
}

// ===== 首頁外觀與網站設定 =====

export async function getSiteSettings() {
  try {
    const { rows } = await sql`SELECT * FROM site_settings WHERE id = 1`;
    return rows[0] || null;
  } catch (error) {
    console.error("無法取得網站設定:", error);
    return null;
  }
}

export async function updateSiteSettingsAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("未登入");

  const issueInfo = String(formData.get("issueInfo") || "").trim();
  const issueYear = String(formData.get("issueYear") || "").trim();
  const heroTitle = String(formData.get("heroTitle") || "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") || "").trim();
  const coverStoryTitle = String(formData.get("coverStoryTitle") || "").trim();
  
  const existingImageUrl = String(formData.get("existingImage") || "");
  const imageFile = formData.get("image") as File | null;
  
  let imageUrl = existingImageUrl;

  if (imageFile && imageFile.size > 0) {
    const uniqueFilename = `settings/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await put(uniqueFilename, imageFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    imageUrl = blob.url;
  }

  await sql`
    UPDATE site_settings
    SET 
      issue_info = ${issueInfo},
      issue_year = ${issueYear},
      hero_title = ${heroTitle},
      hero_subtitle = ${heroSubtitle},
      cover_story_title = ${coverStoryTitle},
      hero_image_url = ${imageUrl}
    WHERE id = 1
  `;

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function getSubmissionStatus() {
  try {
    await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_submission_open BOOLEAN DEFAULT true;`;
    const { rows } = await sql`SELECT is_submission_open FROM site_settings WHERE id = 1`;
    return rows[0]?.is_submission_open ?? true;
  } catch (error) {
    console.error("讀取投稿狀態失敗:", error);
    return true; 
  }
}

export async function toggleSubmissionStatusAction(currentStatus: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("權限不足，僅限總管理員操作");
  }

  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_submission_open BOOLEAN DEFAULT true;`;
  
  const nextStatus = !currentStatus;
  
  await sql`
    INSERT INTO site_settings (id, is_submission_open)
    VALUES (1, ${nextStatus})
    ON CONFLICT (id) DO UPDATE SET is_submission_open = EXCLUDED.is_submission_open;
  `;

  revalidatePath("/admin");
  revalidatePath("/submit"); 
}