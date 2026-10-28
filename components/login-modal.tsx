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

  // 登入：成功就重新整理頁面並進後台，失敗顯示錯誤訊息
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
        // 被鎖住時顯示伺服器傳來的訊息，其他情況一律顯示帳密錯誤
        setError(res.error.includes("15 分鐘") ? res.error : "帳號或密碼錯誤，請重新輸入");
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-left font-serif hover:underline"
      >
        管理員登入
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 px-4 text-left backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="relative w-full max-w-sm border border-foreground bg-card p-8 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="關閉登入視窗"
              className="absolute right-2 top-2 flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              ✕
            </button>

            <p className="mb-5 flex justify-center">
              <span aria-hidden="true" className="inline-flex size-10 items-center justify-center border-[1.5px] border-primary font-serif text-lg font-bold text-primary">薈</span>
            </p>
            <h2 id="login-title" className="mb-1 text-center font-serif text-2xl tracking-[0.12em]">登入系統</h2>
            <p className="mb-7 text-center text-xs tracking-[0.2em] text-muted-foreground">文薈管理員專區</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                電子郵件
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 w-full border border-input bg-background px-3 text-sm transition-colors focus:border-foreground"
                  placeholder="輸入管理員信箱"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                密碼
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 w-full border border-input bg-background px-3 text-sm transition-colors focus:border-foreground"
                  placeholder="輸入密碼"
                />
              </label>

              {error && <p role="alert" className="text-center text-xs text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 min-h-12 w-full bg-foreground px-4 font-serif text-sm tracking-[0.12em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
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
