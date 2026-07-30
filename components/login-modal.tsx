"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("帳號或密碼錯誤，請重新輸入");
        setIsLoading(false);
      } else {
        setIsOpen(false);
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("發生未知的錯誤，請稍後再試");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 💡 乾淨俐落的純文字按鈕，樣式跟「作品總覽」完全一致 */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover:underline text-left"
      >
        管理員登入
      </button>

      {/* 彈出視窗 (Modal) 維持不變 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 text-left">
          <div className="w-full max-w-sm rounded-md border border-border bg-[#121212] p-8 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-[#888] hover:text-white transition-colors"
            >
              ✕
            </button>

            <h2 className="mb-2 text-2xl font-bold text-center font-serif tracking-widest">登入系統</h2>
            <p className="mb-6 text-center text-xs text-[#888] tracking-widest">文薈管理員專區</p>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1.5 text-[#ccc]">電子郵件</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-[#333] bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="輸入管理員信箱"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1.5 text-[#ccc]">密碼</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-[#333] bg-transparent px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="輸入密碼"
                />
              </div>
              
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full rounded-sm bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "登入中..." : "確認登入"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}