"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, X } from "lucide-react";
import SubmitForm from "./SubmitForm";

export default function SubmitCTA() {
  const [isOpen, setIsOpen] = useState(false);

  // 💡 當彈出視窗開啟時，鎖定背景不讓它滾動
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
        <p className="mb-3 text-xs tracking-[0.2em] text-primary">READY TO SUBMIT?</p>
        <h2 className="font-serif text-3xl font-bold md:text-4xl">準備好讓作品被看見了嗎？</h2>
        <p className="mt-3 mb-8 text-sm text-muted-foreground">請確實填寫基本資料，並使用學校核發之學生信箱進行投稿。</p>
        
        {/* 觸發彈出視窗的按鈕 */}
        <button 
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-3 bg-primary px-8 py-4 text-sm font-bold tracking-wider text-primary-foreground transition-all hover:opacity-90"
        >
          開啟投稿表單 <ArrowUpRight className="size-4" />
        </button>
      </div>

      {/* 彈出視窗本體 */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm md:p-8">
          {/* 視窗內容區塊 (設定最大高度並允許內部滾動) */}
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md border border-border bg-card shadow-2xl">
            
            {/* 關閉按鈕 (固定在右上角) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="sticky right-4 top-4 z-50 float-right rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md transition-colors hover:bg-border"
            >
              <X className="size-5" />
            </button>
            
            {/* 引入我們做好的表單 */}
            <div className="p-2 md:p-6">
              <div className="mb-6 mt-4 text-center">
                <h3 className="font-serif text-2xl font-bold text-foreground">學生投稿專區</h3>
                <p className="mt-2 text-sm text-muted-foreground">請完整填寫以下資訊，完成投稿。</p>
              </div>
              <SubmitForm />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}