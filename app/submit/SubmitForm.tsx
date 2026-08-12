"use client";

import { useState } from "react";
import { submitStudentWorkAction } from "@/lib/actions";
import dynamic from "next/dynamic";

interface SubmitEditorProps {
  onChange: (html: string) => void;
}

const SubmitEditor = dynamic<SubmitEditorProps>(
  () => import("./SubmitEditor"),
  { ssr: false }
);

export default function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !value.toLowerCase().endsWith("@stu.tshs.tp.edu.tw")) {
      setEmailError("僅限使用學校信箱 (@stu.tshs.tp.edu.tw)");
    } else {
      setEmailError("");
    }
  };

  async function handleSubmit(formData: FormData) {
    if (!email.toLowerCase().endsWith("@stu.tshs.tp.edu.tw")) {
      setEmailError("請填寫正確的學校信箱");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitStudentWorkAction(formData);
      alert("投稿成功！我們會盡快審核您的作品。");
      window.location.reload();
    } catch (error) {
      alert("投稿發生錯誤，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6 text-left w-full">
      {/* 1. 學生基本資料 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">班級</label>
            <input 
              type="text" 
              name="class" 
              placeholder="例: 高一忠" 
              required 
              className="w-full rounded-md border border-[#333] bg-[#121212] p-2 text-white focus:border-[#8c4033] focus:outline-none" 
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">座號</label>
            <input 
              type="text" 
              name="seatNumber" 
              placeholder="例: 01" 
              required 
              className="w-full rounded-md border border-[#333] bg-[#121212] p-2 text-white focus:border-[#8c4033] focus:outline-none" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">作者姓名</label>
            <input 
              type="text" 
              name="authorName" 
              required 
              className="w-full rounded-md border border-[#333] bg-[#121212] p-2 text-white focus:border-[#8c4033] focus:outline-none" 
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">聯絡信箱 (限學校信箱)</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={handleEmailChange}
              placeholder="example@stu.tshs.tp.edu.tw"
              required 
              className={`w-full rounded-md border ${
                emailError ? "border-red-500 focus:border-red-500" : "border-[#333] focus:border-[#8c4033]"
              } bg-[#121212] p-2 text-white focus:outline-none transition-colors`} 
            />
            {emailError && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                ⚠️ {emailError}
              </p>
            )}
          </div>
        </div>

        {/* 💡 匿名發表勾選框 */}
        <div className="flex items-center gap-2 mt-1">
          <input 
            type="checkbox" 
            id="isAnonymous" 
            name="isAnonymous" 
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-[#333] bg-[#121212] accent-[#8c4033] cursor-pointer"
          />
          <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
            以匿名發表作品 (發布時前台將不顯示真實姓名)
          </label>
        </div>
      </div>

      {/* 2. 文章資訊 */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">文章標題</label>
          <input 
            type="text" 
            name="title" 
            required 
            className="w-full rounded-md border border-[#333] bg-[#121212] p-2 text-white focus:border-[#8c4033] focus:outline-none" 
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">文章分類</label>
            <select 
              name="category" 
              required 
              className="w-full rounded-md border border-[#333] bg-[#121212] p-2 text-white focus:border-[#8c4033] focus:outline-none"
            >
              <option value="散文">散文</option>
              <option value="小說">小說</option>
              <option value="新詩">新詩</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-300">封面圖片 (選填)</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              className="w-full text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-[#333] file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-[#444]" 
            />
          </div>
        </div>
      </div>

      {/* 3. 內文編輯器 */}
      <input type="hidden" name="content" value={editorContent} />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">作品內文</label>
        <SubmitEditor onChange={setEditorContent} />
        <p className="text-xs text-gray-500 mt-1">
          提示：輸入 '/' 可以叫出格式選單，支援標題、粗體與條列式排版。
        </p>
      </div>

      {/* 4. 送出按鈕 */}
      <button 
        type="submit" 
        disabled={isSubmitting || !editorContent || !!emailError || !email}
        className="mt-4 w-full rounded-md bg-[#8c4033] hover:bg-[#a14b3d] py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {isSubmitting ? "傳送中..." : "確認投稿"}
      </button>
    </form>
  );
}
{/* 🍯 防機器人誘餌欄位 (Honeypot) - 使用者看不見 */}
<div className="hidden" aria-hidden="true" style={{ display: "none" }}>
  <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
</div>