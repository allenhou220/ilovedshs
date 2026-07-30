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
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image_url || null);
  const [editorContent, setEditorContent] = useState(defaultValues?.content || '');
  const [isMounted, setIsMounted] = useState(false);
  
  // 容量計算
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

  // 💡 建立 Notion 風格編輯器，並直接整合 Vercel Blob 上傳功能
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadEditorImageAction(formData);
      return res.url || "";
    }
  });

  // 💡 如果是「編輯舊文章」，將舊的 HTML 解析成 Notion 區塊載入
  const initLoaded = useRef(false);
  useEffect(() => {
    async function loadInitialHTML() {
      if (defaultValues?.content && !initLoaded.current) {
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
  }, [editor, defaultValues?.content]);

  // 當編輯器內容改變時，自動轉換為 HTML 存入隱藏欄位
  const handleEditorChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    setEditorContent(html);
  };

  return (
    <form action={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>文章標題</label>
        <input type="text" name="title" required defaultValue={defaultValues?.title} style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", fontSize: "16px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>作者</label>
          <input type="text" name="author" placeholder="留空則顯示為匿名" defaultValue={defaultValues?.author} style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#a1a1aa" }}>分類</label>
          <select name="category" defaultValue={defaultValues?.category || "散文"} style={{ width: "100%", padding: "12px", background: "#18181b", border: "1px solid #27272a", color: "#fff", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }}>
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
          <label style={{ fontSize: "14px", color: "#a1a1aa" }}>文章內容</label>
          
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
        
        <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "6px", padding: "16px 0", minHeight: "400px" }}>
          {isMounted ? (
            /* 💡 將編輯器設定為深色模式，與後台完美融合 */
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

      <SubmitButton label={submitLabel} disabled={isOverLimit} />
    </form>
  );
}