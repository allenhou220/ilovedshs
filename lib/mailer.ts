// 寄信：使用社團的 Gmail 帳號寄出（透過 Google 的寄信伺服器）。
// 需要在環境變數設定：
//   GMAIL_USER          寄件的 Gmail 信箱，例如 dshs.wenhui@gmail.com
//   GMAIL_APP_PASSWORD  這個信箱的「應用程式密碼」（16 個字母，不是登入密碼）
// 沒有設定時不會寄信，也不會讓網站出錯，只在伺服器紀錄留下提醒。
import nodemailer from "nodemailer";

type Mail = {
  to: string | string[];
  subject: string;
  html: string;
};

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        // Google 顯示的應用程式密碼中間有空白，這裡自動去掉
        pass: String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
      },
    });
  }
  return transporter;
}

/** 寄出一封信；成功回傳 true。收件人可以是一個或多個信箱。 */
export async function sendMail({ to, subject, html }: Mail): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn("尚未設定 GMAIL_USER / GMAIL_APP_PASSWORD，略過寄信：", subject);
    return false;
  }
  const recipients = (Array.isArray(to) ? to : [to]).map((s) => s.trim()).filter(Boolean);
  if (recipients.length === 0) return false;

  await getTransporter().sendMail({
    from: { name: "東山文薈", address: String(process.env.GMAIL_USER) },
    // 多位收件人時用密件副本，彼此看不到對方的信箱
    to: recipients.length === 1 ? recipients[0] : String(process.env.GMAIL_USER),
    bcc: recipients.length > 1 ? recipients : undefined,
    subject,
    html,
  });
  return true;
}
