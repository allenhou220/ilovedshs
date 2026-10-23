import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { ensureSchema } from "./db";

// 登入失敗次數限制：同一個帳號 15 分鐘內失敗 5 次就暫時鎖住
const MAX_FAILED_ATTEMPTS = 5;
export const LOGIN_LOCKED_MESSAGE = "登入失敗次數過多，請 15 分鐘後再試";

async function countRecentFailures(email: string) {
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT COUNT(*) AS count FROM login_attempts
      WHERE email = ${email} AND attempted_at > NOW() - INTERVAL '15 minutes'
    `;
    return Number(rows[0]?.count || 0);
  } catch (error) {
    console.error("讀取登入失敗紀錄失敗:", error);
    return 0;
  }
}

async function recordFailure(email: string) {
  try {
    await sql`INSERT INTO login_attempts (email) VALUES (${email})`;
    await sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 day'`;
  } catch (error) {
    console.error("記錄登入失敗失敗:", error);
  }
}

async function clearFailures(email: string) {
  try {
    await sql`DELETE FROM login_attempts WHERE email = ${email}`;
  } catch (error) {
    console.error("清除登入失敗紀錄失敗:", error);
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        if ((await countRecentFailures(email)) >= MAX_FAILED_ATTEMPTS) {
          // 丟出錯誤時，登入視窗會顯示這段訊息
          throw new Error(LOGIN_LOCKED_MESSAGE);
        }

        // 信箱不分大小寫
        const result = await sql`SELECT * FROM users WHERE LOWER(email) = ${email} LIMIT 1`;
        const user = result.rows[0];
        if (!user) {
          await recordFailure(email);
          return null;
        }

        // 密碼可能是「加密過的」(bcrypt hash) 或「舊帳號的明碼」，兩種都要支援
        const storedPassword = String(user.password || "");
        const isHashed = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$");
        const passwordMatches = isHashed
          ? await bcrypt.compare(password, storedPassword)
          : password === storedPassword;

        if (!passwordMatches) {
          await recordFailure(email);
          return null;
        }

        await clearFailures(email);

        // 舊帳號若還是明碼，登入成功時自動改存成加密版本
        if (!isHashed) {
          try {
            const newHash = await bcrypt.hash(password, 10);
            await sql`UPDATE users SET password = ${newHash} WHERE id = ${user.id}`;
          } catch (error) {
            console.error("舊密碼自動加密失敗:", error);
          }
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role || "editor",
        };
      },
    }),
  ],
  pages: {
    // 網站沒有獨立的登入頁，登入是在首頁頁尾的彈出視窗
    signIn: "/",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    // 把 role 塞進 JWT token
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // 把 role 帶到 session，這樣頁面裡可以用 session.user.role 判斷權限
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
