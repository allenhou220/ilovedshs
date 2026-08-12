import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText, Inbox, LayoutTemplate, User, Users, LogOut } from "lucide-react";
import { getSubmissionStatus, toggleSubmissionStatusAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const isAdmin = (session.user as any)?.role === "admin";
  
  // 💡 抓取目前是否開放投稿的狀態
  const isSubmissionOpen = await getSubmissionStatus();

  return (
    <div className="min-h-screen bg-[#121212] text-white py-12 px-5 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* 頂部 Header：歡迎詞與帳號相關操作 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-700 pb-6 mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">後台管理大廳</h1>
            <p className="text-gray-400 text-sm">歡迎回來，請選擇您要執行的管理項目</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/account" className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 rounded text-sm hover:bg-gray-800 transition">
              <User size={16} /> 我的帳號
            </Link>
            
            {isAdmin && (
              <>
                <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 rounded text-sm hover:bg-gray-800 transition">
                  <Users size={16} /> 帳號管理
                </Link>

                {/* 💡 總管理員專屬：開放/停用投稿開關按鈕 */}
                <form action={async () => {
                  "use server";
                  await toggleSubmissionStatusAction(isSubmissionOpen);
                }} className="m-0">
                  <button 
                    type="submit" 
                    className={`flex items-center gap-2 px-4 py-2 bg-transparent border rounded text-sm transition-colors ${
                      isSubmissionOpen 
                        ? 'border-red-500/50 text-red-400 hover:bg-red-950/40 hover:border-red-500' 
                        : 'border-green-500/50 text-green-400 hover:bg-green-950/40 hover:border-green-500'
                    }`}
                  >
                    {isSubmissionOpen ? "🔴 停用前台投稿" : "🟢 開放前台投稿"}
                  </button>
                </form>
              </>
            )}

            <form action="/api/auth/signout" method="POST" className="m-0">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded text-sm font-medium hover:bg-red-700 transition">
                <LogOut size={16} /> 登出
              </button>
            </form>
          </div>
        </div>
        
        {/* 三個核心功能大按鈕 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. 文章上架與管理 */}
          <Link 
            href="/admin/works" 
            className="group flex flex-col items-center text-center p-8 bg-[#1e1e1e] border-2 border-transparent rounded-xl hover:border-blue-500 hover:bg-[#252525] transition-all duration-300"
          >
            <div className="bg-blue-500/10 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300 text-blue-500 group-hover:text-white">
              <FileText size={40} />
            </div>
            <h2 className="text-xl font-bold mb-3">文章上架管理</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              新增、編輯、刪除正式發布的文章，設定排序與首頁精選。
            </p>
          </Link>

          {/* 2. 學生投稿審核 (💡 依照開關狀態切換樣式與可點擊性) */}
          {isSubmissionOpen ? (
            <Link 
              href="/admin/submissions" 
              className="group flex flex-col items-center text-center p-8 bg-[#1e1e1e] border-2 border-transparent rounded-xl hover:border-amber-500 hover:bg-[#252525] transition-all duration-300"
            >
              <div className="bg-amber-500/10 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-300 text-amber-500 group-hover:text-white">
                <Inbox size={40} />
              </div>
              <h2 className="text-xl font-bold mb-3">學生投稿審核</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                檢視學生投遞的稿件，審核通過後可一鍵將優良作品發布。
              </p>
            </Link>
          ) : (
            <div className="flex flex-col items-center text-center p-8 bg-[#18181b]/50 border-2 border-[#27272a]/50 rounded-xl opacity-60 grayscale cursor-not-allowed transition-all">
              <div className="bg-gray-500/10 p-5 rounded-full mb-6 text-gray-500">
                <Inbox size={40} />
              </div>
              <h2 className="text-xl font-bold mb-3">學生投稿審核</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                檢視學生投遞的稿件，審核通過後可一鍵將優良作品發布。
              </p>
              <span className="text-red-400 font-bold text-xs bg-red-500/10 px-3 py-1.5 rounded-sm tracking-wider">
                目前已停用投稿
              </span>
            </div>
          )}

          {/* 3. 首頁標題編輯 */}
          <Link 
            href="/admin/homepage" 
            className="group flex flex-col items-center text-center p-8 bg-[#1e1e1e] border-2 border-transparent rounded-xl hover:border-[#8c4033] hover:bg-[#252525] transition-all duration-300"
          >
            <div className="bg-[#8c4033]/10 p-5 rounded-full mb-6 group-hover:scale-110 group-hover:bg-[#8c4033] transition-all duration-300 text-[#8c4033] group-hover:text-white">
              <LayoutTemplate size={40} />
            </div>
            <h2 className="text-xl font-bold mb-3">首頁外觀設定</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              修改首頁大標題、引言文字，以及更換首頁的主題封面圖片。
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}