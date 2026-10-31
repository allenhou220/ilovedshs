"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitStudentWorkAction } from "@/lib/actions";
import { compressImageFile } from "@/lib/compress-image";
import { clearDraft, loadDraft, saveDraft, type SubmitDraft } from "@/lib/submit-draft";
import dynamic from "next/dynamic";

// 學校信箱格式（前端先檢查，伺服器端也會再檢查一次，不能只靠前端）
const STUDENT_EMAIL_RE = /^[a-z0-9._-]+@stu\.tshs\.tp\.edu\.tw$/i;

interface SubmitEditorProps {
  onChange: (html: string, blocks: unknown[]) => void;
  initialBlocks?: unknown[];
}

// 一般文字欄位（不含信箱、匿名勾選，那兩個由 React 狀態控制）
const TEXT_FIELDS = ["class", "seatNumber", "authorName", "title", "category"] as const;

// 文字編輯器只在瀏覽器端載入（ssr: false），因為它需要用到瀏覽器才有的功能
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
  const [submitted, setSubmitted] = useState(false);

  // ----- 草稿自動保存 -----
  const formRef = useRef<HTMLFormElement>(null);
  const blocksRef = useRef<unknown[]>([]);
  const htmlRef = useRef("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftReady, setDraftReady] = useState(false); // 讀完草稿才載入編輯器，才能把內容還原進去
  const [initialBlocks, setInitialBlocks] = useState<unknown[] | undefined>(undefined);
  const [editorKey, setEditorKey] = useState(0);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // 進入頁面時讀取草稿，把各欄位與內文還原
  useEffect(() => {
    const draft = loadDraft();
    const form = formRef.current;
    if (draft && form) {
      for (const name of TEXT_FIELDS) {
        const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
        if (el && draft.fields[name]) el.value = draft.fields[name];
      }
      setEmail(draft.fields.email);
      if (draft.fields.email && !STUDENT_EMAIL_RE.test(draft.fields.email.trim())) {
        setEmailError("僅限使用學校信箱 (@stu.tshs.tp.edu.tw)");
      }
      setIsAnonymous(draft.fields.isAnonymous);
      setEditorContent(draft.html);
      htmlRef.current = draft.html;
      blocksRef.current = draft.blocks;
      setInitialBlocks(draft.blocks);
      setSavedAt(draft.savedAt);
      setRestored(true);
    }
    setDraftReady(true);
  }, []);

  // 從表單目前的狀態組出草稿並存起來（輸入停下 0.8 秒後才存，避免每打一個字就寫一次）
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const get = (name: string) => ((form.elements.namedItem(name) as HTMLInputElement | null)?.value || "");
      const draft: SubmitDraft = {
        fields: {
          class: get("class"),
          seatNumber: get("seatNumber"),
          authorName: get("authorName"),
          email: get("email"),
          title: get("title"),
          category: get("category"),
          isAnonymous: !!(form.elements.namedItem("isAnonymous") as HTMLInputElement | null)?.checked,
        },
        html: htmlRef.current,
        blocks: blocksRef.current,
        savedAt: Date.now(),
      };
      setSavedAt(saveDraft(draft) ? draft.savedAt : null);
    }, 800);
  }, []);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const handleEditorChange = useCallback((html: string, blocks: unknown[]) => {
    htmlRef.current = html;
    blocksRef.current = blocks;
    setEditorContent(html);
    scheduleSave();
  }, [scheduleSave]);

  // 清除草稿：表單、編輯器全部清空（公用電腦用完記得按）
  const handleClearDraft = () => {
    if (!window.confirm("確定要清除草稿嗎？已輸入的內容會全部刪除。")) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    clearDraft();
    formRef.current?.reset();
    setEmail("");
    setEmailError("");
    setIsAnonymous(false);
    setEditorContent("");
    htmlRef.current = "";
    blocksRef.current = [];
    setInitialBlocks(undefined);
    setEditorKey((k) => k + 1); // 重新建立一個空白的編輯器
    setRestored(false);
    setSavedAt(null);
  };

  // 信箱欄位：邊輸入邊檢查格式，不符就即時顯示提醒
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !STUDENT_EMAIL_RE.test(value.trim())) {
      setEmailError("僅限使用學校信箱 (@stu.tshs.tp.edu.tw)");
    } else {
      setEmailError("");
    }
  };

  // 送出投稿：先檢查信箱，再呼叫伺服器；伺服器回傳的錯誤原因直接顯示給學生看
  async function handleSubmit(formData: FormData) {
    if (!STUDENT_EMAIL_RE.test(email.trim())) {
      setEmailError("請填寫正確的學校信箱");
      return;
    }

    setIsSubmitting(true);
    try {
      // 封面圖片先在瀏覽器裡壓縮，上傳更快
      const image = formData.get("image");
      if (image && typeof image === "object" && image.size > 0) {
        formData.set("image", await compressImageFile(image as File));
      }
      const result = await submitStudentWorkAction(formData);
      if ("error" in result) {
        // 顯示伺服器回傳的真正原因（例如投稿太頻繁、圖片格式不對）
        alert(result.error);
        return;
      }
      // 投稿成功：草稿就不需要了
      if (saveTimer.current) clearTimeout(saveTimer.current);
      clearDraft();
      setSubmitted(true);
    } catch (error) {
      alert("投稿發生錯誤，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 投稿成功後改顯示成功畫面，不再顯示表單
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center" role="status">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full border-[1.5px] border-primary text-2xl text-primary">✓</span>
        <h3 className="font-serif text-2xl tracking-[0.15em]">投稿成功</h3>
        <p className="max-w-sm font-serif text-sm leading-[1.9] text-muted-foreground">
          謝謝你把作品交給我們！編輯團隊會盡快閱讀，作品刊登後就會出現在「作品典藏」。
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 border border-foreground px-6 font-serif text-sm tracking-[0.15em] transition-colors hover:bg-foreground hover:text-background"
        >
          再投一篇
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} onChange={scheduleSave} className="flex flex-col gap-6 text-left w-full">
      {/* 還原草稿的提示 */}
      {restored && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-primary/40 bg-primary/5 px-4 py-3 font-serif text-sm" role="status">
          <span>已還原你上次還沒送出的內容，可以接著寫。</span>
          <button type="button" onClick={handleClearDraft} className="min-h-11 text-primary underline underline-offset-4">
            清除草稿、重新開始
          </button>
        </div>
      )}

      {/* 1. 學生基本資料 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">班級</label>
            <input 
              type="text" 
              name="class" 
              placeholder="例: 高一忠" 
              required 
              className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">座號</label>
            <input 
              type="text" 
              name="seatNumber" 
              placeholder="例: 01" 
              required 
              className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">作者姓名</label>
            <input 
              type="text" 
              name="authorName" 
              required 
              className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">聯絡信箱 (限學校信箱)</label>
            <input 
              type="email" 
              name="email" 
              value={email}
              onChange={handleEmailChange}
              placeholder="example@stu.tshs.tp.edu.tw"
              required 
              className={`w-full rounded-md border ${
                emailError ? "border-destructive focus:border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-primary"
              } bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 transition-colors`} 
            />
            {emailError && (
              <p className="mt-1 text-xs font-semibold text-destructive">
                ⚠️ {emailError}
              </p>
            )}
          </div>
        </div>

        {/* 匿名發表勾選框 */}
        <div className="flex items-center gap-2 mt-1">
          <input 
            type="checkbox" 
            id="isAnonymous" 
            name="isAnonymous" 
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background accent-primary cursor-pointer"
          />
          <label htmlFor="isAnonymous" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
            以匿名發表作品 (發布時前台將不顯示真實姓名)
          </label>
        </div>
      </div>

      {/* 2. 文章資訊 */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">文章標題</label>
          <input 
            type="text" 
            name="title" 
            required 
            className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" 
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">文章分類</label>
            <select 
              name="category" 
              required 
              className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="散文" className="bg-background text-foreground">散文</option>
              <option value="小說" className="bg-background text-foreground">小說</option>
              <option value="新詩" className="bg-background text-foreground">新詩</option>
              <option value="採訪" className="bg-background text-foreground">採訪</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-foreground">封面圖片 (選填)</label>
            <input 
              type="file" 
              name="image" 
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif" 
              className="w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border border-border file:bg-muted file:py-2 file:px-4 file:text-xs file:font-semibold file:text-foreground hover:file:bg-muted/80 cursor-pointer" 
            />
          </div>
        </div>
      </div>

      {/* 3. 內文編輯器 */}
      {/* 編輯器的內容（HTML）放在隱藏欄位，表單送出時一起帶給伺服器 */}
      <input type="hidden" name="content" value={editorContent} />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">作品內文</label>
        {draftReady ? (
          <SubmitEditor key={editorKey} onChange={handleEditorChange} initialBlocks={initialBlocks} />
        ) : (
          <div className="min-h-[300px] rounded-md border border-border bg-background" />
        )}
        <p className="text-xs text-muted-foreground mt-1">
          提示：圈選文字即可切換標題大小、套用粗體、斜體與底線。
        </p>
        {/* 草稿狀態：只存在這台裝置的瀏覽器 */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-live="polite">
          <span>
            {savedAt
              ? `已自動保存草稿（${new Date(savedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}），只存在這台裝置。`
              : "輸入的內容會自動保存在這台裝置，不小心關掉也不會不見。"}
          </span>
          {savedAt && !restored && (
            <button type="button" onClick={handleClearDraft} className="min-h-8 underline underline-offset-4 hover:text-primary">
              清除草稿
            </button>
          )}
        </p>
      </div>

      {/* 🍯 防機器人誘餌欄位 (Honeypot) */}
      <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
        <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {/* 4. 送出按鈕 */}
      <button 
        type="submit" 
        disabled={isSubmitting || !editorContent || !!emailError || !email}
        className="mt-4 w-full rounded-md bg-primary hover:bg-primary/90 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {isSubmitting ? "傳送中..." : "確認投稿"}
      </button>
    </form>
  );
}