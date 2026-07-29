import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await sql`
          SELECT * FROM users WHERE email = ${credentials.email}
        `;
        const user = result.rows[0];
        if (!user) return null;

        // 密碼可能是「加密過的」(bcrypt hash) 或「舊帳號的明碼」，兩種都要支援
        const storedPassword = String(user.password || "");
        const isHashed = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$");

        const passwordMatches = isHashed
          ? await bcrypt.compare(credentials.password, storedPassword)
          : credentials.password === storedPassword;

        if (!passwordMatches) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role || "editor",
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
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