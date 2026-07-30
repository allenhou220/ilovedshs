'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { uploadEditorImageAction } from '@/lib/actions';

// 💡 引入 BlockNote 編輯器核心與專屬樣式
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isBtnDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isBtnDisabled}
      style={{
        padding: "12px",
        background: isBtnDisabled ? "#4b5563" : "#fafafa",
        color: isBtnDisabled ? "#fff" : "#000",
        border: "none",
        cursor: isBtnDisabled ? "not-allowed" : "pointer",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "16px",
        transition: "all 0.2s",
        opacity: isBtnDisabled ? 0.7 : 1
      }}
    >
      {pending ? "發布中..." : disabled ? "容量超過 10MB 無法發布" : label}
    </button>
  );
}

type DefaultValues = {
  title?: string;
  author?: string;
  category?: string;
  content?: string;
  image_url?: string;
};

export default function AdminForm({
  handlePublish,
  defaultValues,
  submitLabel = "確認發布",
}: {
  handlePublish: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
  submitLabel?: string;
}) {
  // 💡 將標題、作者、分類加入狀態，讓預覽可以「即時連動」
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [author, setAuthor] = useState(defaultValues?.author || '');
  const [category, setCategory] = useState(defaultValues?.category || '散文');
  
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image_url || null);
  const [editorContent, setEditorContent] = useState(defaultValues?.content || '');
  const [isMounted, setIsMounted] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const contentSizeBytes = typeof Blob !== 'undefined' ? new Blob([editorContent]).size : 0;
  const contentSizeMB = (contentSizeBytes / (1024 * 1024)).toFixed(2);
  const isOverLimit = contentSizeBytes > 10 * 1024 * 1024;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadEditorImageAction(formData);
      return res.url || "";
    }
  });

  // 💡 修復舊文章讀取失敗的問題：加入 isMounted 確保 DOM 準備好後才塞資料
  const initLoaded = useRef(false);
  useEffect(() => {
    async function loadInitialHTML() {
      if (isMounted && defaultValues?.content && !initLoaded.current) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(defaultValues.content);
          editor.replaceBlocks(editor.document, blocks);
          initLoaded.current = true;
        } catch (e) {
          console.error("載入舊文章內容失敗", e);
        }
      }
    }
    loadInitialHTML();
  }, [editor, defaultValues?.content, isMounted]);

  const handleEditorChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    setEditorContent(html);
  };

  const cleanContent = (editorContent || '')
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') 
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')     
    .replace(/<p>\s*<\/p>/gi, '');             

  return (
    <>
      <style>{`
        .custom-article-content,
        .custom-article-content * {
          font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) !important;
          font-variant-numeric: lining-nums tabular-nums !important;
          font-feature-settings: "lnum" 1, "tnum" 1 !important;
        }
        .custom-article-content h1,
        .custom-article-content h2,
        .custom-article-content h3 {
          font-family: var(--font-serif, Georgia, serif) !important;
        }
      `}</style>

      <form action={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>文章標題</label>
          <input 
            type="text" 
            name="title" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", fontSize: "16px" }} 
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>作者</label>
            <input 
              type="text" 
              name="author" 
              placeholder="留空則顯示為匿名" 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>分類</label>
            <select 
              name="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }}
            >
              <option value="散文">散文</option>
              <option value="新詩">新詩</option>
              <option value="小說">小說</option>
              <option value="採訪">採訪</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>封面圖片{defaultValues ? "（不選則保留原圖）" : ""}</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", cursor: "pointer", fontSize: "14px" }}
          />
          {defaultValues && <input type="hidden" name="existingImage" value={defaultValues.image_url || ""} />}

          {imagePreview && (
            <div style={{ marginTop: "16px", borderRadius: "6px", overflow: "hidden", border: "1px solid #27272a" }}>
              <img src={imagePreview} alt="預覽" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
            </div>
          )}
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <label style={{ fontSize: "14px", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "12px" }}>
              文章內容
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                style={{
                  padding: "4px 12px",
                  background: "#3f3f46",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                👁️ 展開前台預覽
              </button>
            </label>
            
            <span style={{
              fontSize: "12px",
              color: isOverLimit ? "#ef4444" : "#71717a",
              fontWeight: isOverLimit ? "bold" : "normal",
              background: isOverLimit ? "rgba(239, 68, 68, 0.1)" : "transparent",
              padding: "4px 8px",
              borderRadius: "4px",
              border: isOverLimit ? "1px solid #ef4444" : "none"
            }}>
              {isOverLimit ? "⚠️ 超過上限：" : "內文容量："}
              {contentSizeMB} MB / 10 MB
            </span>
          </div>
          
          <input type="hidden" name="content" value={editorContent} />
          
          <div style={{ display: activeTab === "edit" ? "block" : "none" }}>
            <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "6px", padding: "16px 0", minHeight: "400px" }}>
              {isMounted ? (
                <BlockNoteView 
                  editor={editor} 
                  theme="dark" 
                  onChange={handleEditorChange}
                />
              ) : (
                <p style={{ color: '#71717a', padding: '0 24px', fontSize: '14px' }}>編輯器初始化中...</p>
              )}
            </div>
          </div>
        </div>

        <SubmitButton label={submitLabel} disabled={isOverLimit} />
      </form>

      {/* 💡 終極前台預覽模式：複製 100% 前台的排版 */}
      {activeTab === "preview" && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground bg-[#09090b]">
          {/* 頂部控制列 */}
          <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md px-6 py-4 shadow-sm">
            <span className="text-sm font-bold tracking-widest text-primary">文薈 - 前台模擬預覽</span>
            <button 
              type="button" 
              onClick={() => setActiveTab("edit")}
              className="rounded-sm bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-gray-200"
            >
              退出預覽 / 繼續編輯
            </button>
          </div>
          
          {/* 💡 完美複製前台 WorkDetailPage 的結構 */}
          <article className="min-h-screen">
            <header className="mx-auto max-w-5xl px-5 pb-10 pt-16 text-center md:px-8 md:pb-14 md:pt-24">
              <div className="mb-12 inline-flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground opacity-50">
                ← 返回作品總覽 (這只是預覽哦)
              </div>

              <p className="mb-6 text-sm tracking-[0.25em] text-primary">
                {category || '散文'}
              </p>

              <h1 className="text-balance font-serif text-5xl font-black leading-tight md:text-7xl text-white">
                {title || '請輸入標題'}
              </h1>

              <div className="mt-8 flex items-center justify-center gap-3 text-sm">
                <span className="font-medium text-white">{author || '匿名'}</span>
              </div>
            </header>

            {imagePreview && (
              <div className="mx-auto max-w-5xl px-5 md:px-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-[#27272a] bg-[#18181b]">
                  <img
                    src={imagePreview}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className={`mx-auto px-5 py-16 md:py-24 ${category === '新詩' ? 'max-w-2xl text-center' : 'max-w-3xl'}`}>
              <div 
                className="
                  custom-article-content
                  text-lg leading-[2.15] md:text-xl text-white text-justify
                  [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-black [&_h1]:mt-12 [&_h1]:mb-6
                  [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-5
                  [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-4
                  [&_p]:!m-0 
                  [&_img]:mx-auto [&_img]:my-8 [&_img]:rounded-md [&_img]:max-w-full [&_img]:h-auto
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                "
                dangerouslySetInnerHTML={{ __html: cleanContent }}
              />

              <aside className="mt-20 border-y border-[#27272a] py-8 text-center md:text-left">
                <p className="mb-3 text-xs tracking-[0.2em] text-primary">ABOUT THE AUTHOR</p>
                <p className="font-serif text-xl font-bold text-white">{author || '匿名'}</p>
              </aside>
            </div>
          </article>
        </div>
      )}
    </>
  );
}