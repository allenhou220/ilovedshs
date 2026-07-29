import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await sql`
          SELECT * FROM users WHERE email = ${credentials.email}
        `;
        const user = result.rows[0];

        if (user && user.password === credentials.password) {
          return { id: user.id.toString(), email: user.email };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};