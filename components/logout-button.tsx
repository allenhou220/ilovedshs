"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

// 一鍵登出（以前送出表單到 /api/auth/signout 會多跳一個確認頁）
export function LogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        signOut({ callbackUrl: "/" });
      }}
      className="inline-flex items-center gap-2 px-4 py-2 border border-destructive/50 bg-destructive/10 text-destructive rounded-md font-serif text-xs tracking-wider hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-60"
    >
      <LogOut size={15} /> {pending ? "登出中..." : "登出"}
    </button>
  );
}
