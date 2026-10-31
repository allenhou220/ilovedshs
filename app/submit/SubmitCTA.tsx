"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, X } from "lucide-react";
import SubmitForm from "./SubmitForm";

// 投稿按鈕：點擊後展開投稿表單
export default function SubmitCTA() {
  const [isOpen, setIsOpen] = useState(false);

  // 當彈出視窗開啟時，鎖定背景不讓頁面滾動
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    // 按 Esc 也能關閉表單
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex flex-col items-center gap-5 text-center">
        <h2 className="font-serif text-3xl font-bold tracking-[0.06em] md:text-4xl">準備好了嗎？</h2>
        <p className="max-w-md font-serif text-[15px] leading-[2] text-muted-foreground">
          請使用學校信箱投稿。
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group mt-2 inline-flex min-h-14 cursor-pointer items-center gap-3 bg-primary px-10 font-serif text-base tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          開始投稿
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 彈出視窗本體 (使用自動適應主題的 bg-card 與 border-border) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md md:p-8 animate-in fade-in duration-200">
          
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-foreground bg-card p-6 text-foreground shadow-2xl md:p-10"
          >
            
            {/* 關閉按鈕 (固定在右上角，樣式優化) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 z-50 flex size-11 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="關閉表單"
            >
              <X className="size-5" />
            </button>
            
            {/* 彈窗內容 Header */}
            <div className="mb-8 mt-2 text-center">
              <h3 id="submit-dialog-title" className="font-serif text-3xl font-bold tracking-[0.1em] text-foreground">投稿</h3>
            </div>

            {/* 引入已修復深淺色的 SubmitForm */}
            <SubmitForm />
            
          </div>
        </div>
      )}
    </>
  );
}