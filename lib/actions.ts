"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { sanitizeHtml, escapeHtml } from "./sanitize-html";
import { ensureSchema } from "./db";
import { normalizeHeroTitle } from "./text";
import { getSubmissionStatus } from "./queries";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_to_pass_build");

// ===== 共用：權限檢查 =====

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("未登入");
  }
  return session;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("權限不足，僅限總管理員操作");
  }
  return session;
}

const VALID_ROLES = new Set(["admin", "editor"]);
const STUDENT_EMAIL_RE = /^[a-z0-9._-]+@stu\.tshs\.tp\.edu\.tw$/i;

// ===== 共用：圖片上傳 =====

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// 只接受真正的圖片格式，並重新命名，避免有人上傳 .html 等檔案放到公開空間
async function uploadImage(file: File, folder: string) {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw new Error("只能上傳 JPG、PNG、GIF、WebP 或 AVIF 圖片");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("圖片不可超過 10MB");

  const base = (file.name.replace(/\.[^.]*$/, "").replace(/[^a-zA-Z0-9-]/g, "_") || "image").slice(0, 60);
  const blob = await put(`${folder}/${Date.now()}-${base}.${ext}`, file, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

/** 表單裡若有選新圖片就上傳，否則沿用舊圖 */
async function resolveImage(formData: FormData, folder: string, fallback = "") {
  const imageFile = formData.get("image") as File | null;
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    return uploadImage(imageFile, folder);
  }
  return fallback;
}

// ===== 共用：重新整理快取 =====

function revalidateWorks(extraPaths: string[] = []) {
  for (const path of ["/", "/works", "/admin", "/admin/works", ...extraPaths]) {
    revalidatePath(path);
  }
}

// ===== 共用：讀取文章表單 =====

function readWorkForm(formData: FormData, defaultSource: string) {
  const sourceType = String(formData.get("sourceType") || defaultSource).trim();
  return {
    title: String(formData.get("title") || "").trim(),
    author: String(formData.get("author") || "").trim() || "匿名",
    category: String(formData.get("category") || "散文"),
    sourceType,
    issue: sourceType === "學生投稿" ? "" : String(formData.get("issue") || "").trim(),
    content: sanitizeHtml(String(formData.get("content") || "").trim()),
    existingImage: String(formData.get("existingImage") || ""),
  };
}

async function insertWork(work: ReturnType<typeof readWorkForm>, imageUrl: string): Promise<number> {
  // 新文章排在最前面
  const { rows } = await sql`SELECT MIN(sort_order) AS min_order FROM works`;
  const minOrder = (rows[0]?.min_order ?? 1) - 1;

  const inserted = await sql`
    INSERT INTO works (title, author, category, issue, source_type, content, image_url, sort_order)
    VALUES (${work.title}, ${work.author}, ${work.category}, ${work.issue}, ${work.sourceType}, ${work.content}, ${imageUrl}, ${minOrder})
    RETURNING id
  `;
  return inserted.rows[0]?.id;
}

// ===== 文章管理功能 =====

export async function createWorkAction(formData: FormData) {
  await requireSession();
  await ensureSchema();

  const work = readWorkForm(formData, "文薈成員創作");
  if (!work.title || !work.content) return;

  const imageUrl = await resolveImage(formData, "works");
  await insertWork(work, imageUrl);

  revalidateWorks();
  redirect("/admin/works");
}

export async function updateWorkAction(id: number, formData: FormData) {
  await requireSession();
  await ensureSchema();

  const work = readWorkForm(formData, "文薈成員創作");
  if (!work.title || !work.content) return;

  const imageUrl = await resolveImage(formData, "works", work.existingImage);

  await sql`
    UPDATE works
    SET title = ${work.title}, author = ${work.author}, category = ${work.category},
        issue = ${work.issue}, source_type = ${work.sourceType}, content = ${work.content},
        image_url = ${imageUrl}
    WHERE id = ${id}
  `;

  revalidateWorks([`/works/${encodeURIComponent(work.title)}`]);
  redirect("/admin/works");
}

export async function deleteWorkAction(id: number) {
  await requireSession();
  await sql`DELETE FROM works WHERE id = ${id}`;
  revalidateWorks();
}

export async function toggleFeaturedAction(id: number, nextFeatured: boolean) {
  await requireSession();
  if (nextFeatured) {
    // 一次完成：這篇設為精選、其他全部取消（同一時間只會有一篇精選）
    await sql`UPDATE works SET featured = (id = ${id}) WHERE featured = true OR id = ${id}`;
  } else {
    await sql`UPDATE works SET featured = false WHERE id = ${id}`;
  }
  revalidateWorks();
}

export async function moveWorkAction(id: number, direction: "up" | "down") {
  await requireSession();

  // 與前台、後台列表使用「完全相同」的排序規則
  const { rows } = await sql`
    SELECT id FROM works
    ORDER BY sort_order ASC NULLS LAST, id DESC
  `;
  const ids: number[] = rows.map((r) => Number(r.id));

  const index = ids.indexOf(Number(id));
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ids.length) return;

  [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];

  // 以前是每篇文章各送一次 UPDATE，現在一次更新全部
  await sql`
    UPDATE works AS w
    SET sort_order = v.ord
    FROM unnest(${ids as any}::int[]) WITH ORDINALITY AS v(id, ord)
    WHERE w.id = v.id
  `;

  revalidateWorks();
}

export async function uploadEditorImageAction(formData: FormData) {
  await requireSession();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "未選擇圖片" };
  }

  try {
    const url = await uploadImage(file, "editor");
    return { url };
  } catch (error: any) {
    return { error: error?.message || "圖片上傳失敗" };
  }
}

// ===== 帳號管理功能 =====

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const bcrypt = (await import("bcryptjs")).default;
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "editor");

  if (!email || !password) return { error: "請填寫完整資訊" };
  if (!VALID_ROLES.has(role)) return { error: "權限設定不正確" };
  if (password.length < 8) return { error: "密碼至少要 8 個字元" };

  try {
    const { rowCount } = await sql`SELECT 1 FROM users WHERE LOWER(email) = ${email}`;
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
  const { rows } = await sql`SELECT email FROM users WHERE id = ${id}`;
  if (rows[0]?.email && rows[0].email === session.user?.email) {
    throw new Error("不能刪除自己的帳號");
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
  if (newPassword.length < 8) return { error: "新密碼至少要 8 個字元" };

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
  const session = await requireAdmin();
  if (!VALID_ROLES.has(role)) throw new Error("權限設定不正確");

  const { rows } = await sql`SELECT email FROM users WHERE id = ${id}`;
  if (rows[0]?.email && rows[0].email === session.user?.email) {
    throw new Error("不能修改自己的權限");
  }

  await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
  revalidatePath("/admin/users");
}

export async function toggleUserNotificationAction(id: number, currentStatus: boolean) {
  await requireAdmin();
  await ensureSchema();
  await sql`UPDATE users SET receive_notifications = ${!currentStatus} WHERE id = ${id}`;
  revalidatePath("/admin/users");
}

// ===== 學生投稿功能 =====

type SubmitResult = { success: true } | { error: string };

// 回傳 { error } 而不是丟出例外：正式上線後，Next.js 會把例外訊息藏起來，
// 學生只會看到「發生錯誤」，用回傳值才能把真正原因（例如投稿太頻繁）顯示出來。
export async function submitStudentWorkAction(formData: FormData): Promise<SubmitResult> {
  const honeypot = String(formData.get("website_hp") || "");
  if (honeypot) return { success: true }; // 機器人：假裝成功

  if (!(await getSubmissionStatus())) {
    return { error: "目前暫不開放投稿" };
  }

  const studentClass = String(formData.get("class") || "").trim();
  const rawSeat = formData.get("seatNumber") || formData.get("seat_number");
  const parsedSeat = parseInt(String(rawSeat || "0"), 10);
  const seatNumber = isNaN(parsedSeat) ? 0 : parsedSeat;

  const authorName = String(formData.get("authorName") || formData.get("author_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const category = String(formData.get("category") || "散文");
  const title = String(formData.get("title") || "").trim();
  const content = sanitizeHtml(String(formData.get("content") || "").trim());
  const isAnonymous = formData.get("isAnonymous") === "on" || formData.get("is_anonymous") === "on";

  if (!studentClass || !authorName || !email || !title || !content) {
    return { error: "請填寫所有必要的欄位" };
  }
  if (!STUDENT_EMAIL_RE.test(email)) {
    return { error: "必須使用學校核發的 @stu.tshs.tp.edu.tw 信箱" };
  }

  // 頻率限制：同一信箱 10 分鐘 3 篇；全站 10 分鐘 30 篇
  try {
    const { rows } = await sql`
      SELECT
        COUNT(*) FILTER (WHERE email = ${email}) AS mine,
        COUNT(*) AS total
      FROM submissions
      WHERE created_at > NOW() - INTERVAL '10 minutes'
    `;
    if (Number(rows[0]?.mine || 0) >= 3 || Number(rows[0]?.total || 0) >= 30) {
      return { error: "投稿頻率過高，請 10 分鐘後再試！" };
    }
  } catch (error) {
    console.error("投稿頻率檢查異常:", error);
  }

  let imageUrl = "";
  try {
    imageUrl = await resolveImage(formData, "submissions");
  } catch (error: any) {
    return { error: error?.message || "圖片上傳失敗" };
  }

  await sql`
    INSERT INTO submissions (class, seat_number, author_name, email, category, title, content, image_url, status, is_anonymous)
    VALUES (${studentClass}, ${seatNumber}, ${authorName}, ${email}, ${category}, ${title}, ${content}, ${imageUrl}, 'pending', ${isAnonymous})
  `;

  await notifyEditors({ studentClass, seatNumber, authorName, email, category, title, isAnonymous });

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  return { success: true };
}

async function notifyEditors(info: {
  studentClass: string;
  seatNumber: number;
  authorName: string;
  email: string;
  category: string;
  title: string;
  isAnonymous: boolean;
}) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await ensureSchema();
    const { rows } = await sql`SELECT email FROM users WHERE receive_notifications = true`;
    const recipients = rows.map((u) => String(u.email || "")).filter(Boolean);
    if (recipients.length === 0) return;

    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: recipients,
      subject: `【新投稿通知】${info.studentClass} ${info.authorName} - 《${info.title}》`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #8c4033; margin-top: 0;">📩 收到新的學生作品投稿！</h2>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
          <p><strong>文章標題：</strong> ${escapeHtml(info.title)}</p>
          <p><strong>文章分類：</strong> ${escapeHtml(info.category)}</p>
          <p><strong>投稿學生：</strong> ${escapeHtml(info.studentClass)} ${info.seatNumber}號 - ${escapeHtml(info.authorName)}</p>
          <p><strong>聯絡信箱：</strong> ${escapeHtml(info.email)}</p>
          <p><strong>發表方式：</strong> ${info.isAnonymous ? "🕵️ 要求匿名發表" : "👤 具名發表"}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <a href="${escapeHtml(siteUrl)}/admin/submissions"
             style="display: inline-block; background-color: #8c4033; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            🚀 前往後台審核稿件
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email 通知發送失敗：", error);
  }
}

export async function publishSubmissionAction(submissionId: string, formData: FormData) {
  await requireSession();
  await ensureSchema();

  const work = readWorkForm(formData, "學生投稿");
  if (!work.title || !work.content) return;

  const imageUrl = await resolveImage(formData, "works", work.existingImage);
  const workId = await insertWork(work, imageUrl);
  await sql`
    UPDATE submissions
    SET status = 'published', work_id = ${workId}, reviewed_at = NOW()
    WHERE id = ${submissionId}
  `;

  revalidateWorks(["/admin/submissions"]);
  redirect("/admin/submissions");
}

// 本期未收錄：從待審清單移除，但保留稿件紀錄（後台統計用）
export async function rejectSubmissionAction(id: number) {
  await requireSession();
  await ensureSchema();
  await sql`UPDATE submissions SET status = 'rejected', reviewed_at = NOW() WHERE id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  return { success: true };
}

export async function deleteSubmissionAction(id: number) {
  await requireSession();

  try {
    await sql`DELETE FROM submissions WHERE id = ${id}`;
    revalidatePath("/admin");
    revalidatePath("/admin/submissions");
    return { success: true };
  } catch (error) {
    console.error("刪除投稿失敗:", error);
    throw new Error("無法從資料庫抹除該投稿");
  }
}

// ===== 首頁外觀與網站設定 =====

export async function updateSiteSettingsAction(formData: FormData): Promise<{ success: true; imageUrl: string } | { error: string }> {
  await requireSession();
  await ensureSchema();

  const issueInfo = String(formData.get("issueInfo") || "").trim().slice(0, 40);
  const issueYear = String(formData.get("issueYear") || "").trim().slice(0, 40);
  const heroTitle = normalizeHeroTitle(String(formData.get("heroTitle") || ""));
  const heroSubtitle = String(formData.get("heroSubtitle") || "").trim().slice(0, 200);
  const rawDeadline = String(formData.get("submissionDeadline") || "").trim();
  const submissionDeadline = /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline) ? rawDeadline : "";
  const existingImageUrl = String(formData.get("existingImage") || "");

  if (!heroTitle) return { error: "請輸入本期大標題。" };

  let imageUrl = existingImageUrl;
  try {
    imageUrl = await resolveImage(formData, "settings", existingImageUrl);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "封面圖片上傳失敗，請再試一次。" };
  }

  // 用 upsert：就算資料庫裡還沒有設定資料，也能正確存入
  await sql`
    INSERT INTO site_settings (id, issue_info, issue_year, hero_title, hero_subtitle, hero_image_url, submission_deadline)
    VALUES (1, ${issueInfo}, ${issueYear}, ${heroTitle}, ${heroSubtitle}, ${imageUrl}, ${submissionDeadline})
    ON CONFLICT (id) DO UPDATE SET
      issue_info = EXCLUDED.issue_info,
      issue_year = EXCLUDED.issue_year,
      hero_title = EXCLUDED.hero_title,
      hero_subtitle = EXCLUDED.hero_subtitle,
      hero_image_url = EXCLUDED.hero_image_url,
      submission_deadline = EXCLUDED.submission_deadline
  `;

  revalidatePath("/");
  revalidatePath("/submit");
  revalidatePath("/admin/homepage");
  return { success: true, imageUrl };
}

// 切換是否開放投稿：直接以資料庫目前的狀態為準，避免畫面資料過期造成切錯
export async function toggleSubmissionStatusAction() {
  await requireAdmin();
  await ensureSchema();

  await sql`
    INSERT INTO site_settings (id, is_submission_open)
    VALUES (1, false)
    ON CONFLICT (id) DO UPDATE
      SET is_submission_open = NOT COALESCE(site_settings.is_submission_open, true)
  `;

  revalidatePath("/admin");
  revalidatePath("/submit");
}

// ===== 期刊資訊 =====

export async function saveIssueAction(formData: FormData): Promise<{ success: true } | { error: string }> {
  await requireSession();
  await ensureSchema();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "缺少期數名稱" };

  const theme = String(formData.get("theme") || "").trim().slice(0, 100);
  const editorNote = String(formData.get("editorNote") || "").trim().slice(0, 3000);
  const editors = String(formData.get("editors") || "").trim().slice(0, 200);
  const existingImage = String(formData.get("existingImage") || "");

  let coverUrl = existingImage;
  try {
    coverUrl = await resolveImage(formData, "issues", existingImage);
  } catch (error: any) {
    return { error: error?.message || "封面上傳失敗" };
  }

  await sql`
    INSERT INTO issues (name, theme, editor_note, editors, cover_image_url, updated_at)
    VALUES (${name}, ${theme}, ${editorNote}, ${editors}, ${coverUrl}, NOW())
    ON CONFLICT (name) DO UPDATE SET
      theme = EXCLUDED.theme,
      editor_note = EXCLUDED.editor_note,
      editors = EXCLUDED.editors,
      cover_image_url = EXCLUDED.cover_image_url,
      updated_at = NOW()
  `;

  revalidatePath("/");
  revalidatePath("/issues");
  revalidatePath(`/issues/${encodeURIComponent(name)}`);
  revalidatePath("/admin/issues");
  return { success: true };
}
