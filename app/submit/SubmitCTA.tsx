"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, X } from "lucide-react";
import SubmitForm from "./SubmitForm";

export default function SubmitCTA() {
  const [isOpen, setIsOpen] = useState(false);

  // 💡 當彈出視窗開啟時，鎖定背景不讓頁面滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div className="mb-12 text-center md:text-left">
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-primary uppercase">
          READY TO SUBMIT?
        </p>
        <h2 className="font-serif text-3xl font-normal md:text-4xl tracking-wide text-foreground">
          準備好讓作品被看見了嗎？
        </h2>
        <p className="mt-3 mb-8 text-sm text-muted-foreground leading-relaxed">
          請確實填寫基本資料，並使用學校核發之學生信箱進行投稿。
        </p>
        
        {/* 💡 雜誌風質感觸發按鈕 */}
        <button 
          onClick={() => setIsOpen(true)}
          className="group inline-flex items-center gap-3 rounded-sm bg-primary px-8 py-4 font-serif text-xs font-medium tracking-[0.2em] text-primary-foreground transition-all hover:bg-primary/90 shadow-sm cursor-pointer"
        >
          開啟投稿表單 
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 💡 彈出視窗本體 (使用自動適應主題的 bg-card 與 border-border) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md md:p-8 animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 md:p-10 shadow-2xl text-foreground">
            
            {/* 💡 關閉按鈕 (固定在右上角，樣式優化) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 z-50 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="關閉表單"
            >
              <X className="size-5" />
            </button>
            
            {/* 彈窗內容 Header */}
            <div className="mb-8 mt-2 text-center">
              <h3 className="font-serif text-3xl font-normal tracking-wide text-foreground">學生投稿專區</h3>
              <p className="mt-2 text-xs text-muted-foreground tracking-wider">請完整填寫以下資訊，完成投稿。</p>
            </div>

            {/* 引入已修復深淺色的 SubmitForm */}
            <SubmitForm />
            
          </div>
        </div>
      )}
    </>
  );
}