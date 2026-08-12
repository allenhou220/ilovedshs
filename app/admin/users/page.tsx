import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createUserAction } from "@/lib/actions";
import UserRow from "./UserRow"; 

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/admin");
  }

  // 確保通知欄位存在
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS receive_notifications BOOLEAN DEFAULT false;`;
  
  const { rows: users } = await sql`SELECT id, email, role, receive_notifications FROM users ORDER BY id ASC`;
  const currentUserEmail = session.user?.email;

  return (
    <div className="min-h-screen bg-[#121212] text-white py-12 px-5 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">帳號管理</h1>
            <p className="text-gray-400 text-sm">新增或移除老師/學生的登入帳號，並設定權限與通知</p>
          </div>
          <Link href="/admin" className="text-gray-400 text-sm hover:text-white transition">
            ← 返回後台
          </Link>
        </div>

        {/* 新增帳號表單 */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 mb-8">
          <form 
  action={async (formData) => {
    "use server";
    await createUserAction(formData);
  }} 
  className="flex flex-col md:flex-row items-end gap-4"
>
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-400 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full bg-[#121212] border border-[#27272a] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-400 mb-2">密碼</label>
              <input 
                type="text" 
                name="password" 
                required 
                placeholder="手動輸入"
                className="w-full bg-[#121212] border border-[#27272a] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-xs text-gray-400 mb-2">身分</label>
              <select 
                name="role" 
                className="w-full bg-[#121212] border border-[#27272a] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="editor">編輯 (老師/學生)</option>
                <option value="admin">總管理員</option>
              </select>
            </div>

            <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded text-sm transition">
              新增帳號
            </button>
          </form>
        </div>

        {/* 使用者列表 */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
          {users.map((user) => (
            <UserRow 
              key={user.id} 
              user={user} 
              isCurrentUser={user.email === currentUserEmail} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}