'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { uploadEditorImageAction } from '@/lib/actions';

// 💡 透過 forwardedRef 轉接，解決 Next.js dynamic 元件不接受 ref 屬性的問題
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return function CustomQuill({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { 
    ssr: false,
    loading: () => <p style={{ color: '#888', padding: '12px' }}>編輯器載入中...</p>,
  }
);

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isBtnDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isBtnDisabled}
      style={{
        padding: "12px",
        background: isBtnDisabled ? "#4b5563" : "#2563eb",
        color: "#fff",
        border: "none",
        cursor: isBtnDisabled ? "not-allowed" : "pointer",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "16px",
        opacity: isBtnDisabled ? 0.7 : 1
      }}
    >
      {pending ? "處理中..." : disabled ? "容量超過 10MB 無法發布" : label}
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const quillRef = useRef<any>(null);

  // 💡 即時計算內文位元組與 MB 大小
  const contentSizeBytes = typeof Blob !== 'undefined' ? new Blob([editorContent]).size : 0;
  const contentSizeMB = (contentSizeBytes / (1024 * 1024)).toFixed(2);
  const isOverLimit = contentSizeBytes > 10 * 1024 * 1024; // 是否超過 10MB

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 上傳圖片核心邏輯
  const processAndUploadFile = useCallback(async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadEditorImageAction(formData);

      if ('url' in res && res.url) {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          quill.insertEmbed(range.index, 'image', res.url);
          quill.setSelection(range.index + 1);
        }
      } else {
        alert('圖片上傳失敗');
      }
    } catch (err) {
      console.error(err);
      alert('上傳圖片發生錯誤');
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  // 點擊工具列的「圖片」按鈕時觸發
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        await processAndUploadFile(file);
      }
    };
  }, [processAndUploadFile]);

  // 攔截編輯器的「直接貼上圖片 (Ctrl+V)」動作
  useEffect(() => {
    const timer = setTimeout(() => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = items[i].getAsFile();
            if (file) {
              await processAndUploadFile(file);
            }
          }
        }
      };

      quill.root.addEventListener('paste', handlePaste);
      return () => quill.root.removeEventListener('paste', handlePaste);
    }, 500);

    return () => clearTimeout(timer);
  }, [processAndUploadFile]);

  // 工具列設定
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['image', 'clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  return (
    <form action={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>文章標題</label>
        <input type="text" name="title" required defaultValue={defaultValues?.title} style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box" }} />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>作者</label>
        <input type="text" name="author" placeholder="留空則顯示為匿名" defaultValue={defaultValues?.author} style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box" }} />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>分類</label>
        <select name="category" defaultValue={defaultValues?.category || "散文"} style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box" }}>
          <option value="散文">散文</option>
          <option value="新詩">新詩</option>
          <option value="小說">小說</option>
          <option value="採訪">採訪</option>
        </select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>封面圖片{defaultValues ? "（不選則保留原圖）" : ""}</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box", cursor: "pointer" }}
        />
        {defaultValues && <input type="hidden" name="existingImage" value={defaultValues.image_url || ""} />}

        {imagePreview && (
          <div style={{ marginTop: "12px", borderRadius: "4px", overflow: "hidden", border: "1px solid #333" }}>
            <img src={imagePreview} alt="預覽" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label style={{ fontSize: "14px" }}>文章內容</label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "12px" }}>
            {isUploadingImage && <span style={{ color: "#3b82f6" }}>圖片上傳至雲端中...</span>}
            
            {/* 💡 容量提示標籤 */}
            <span style={{
              color: isOverLimit ? "#ef4444" : "#a1a1aa",
              fontWeight: isOverLimit ? "bold" : "normal",
              background: isOverLimit ? "rgba(239, 68, 68, 0.1)" : "transparent",
              padding: "2px 8px",
              borderRadius: "4px",
              border: isOverLimit ? "1px solid #ef4444" : "none"
            }}>
              {isOverLimit ? "⚠️ 超過上限：" : "已使用："}
              {contentSizeMB} MB / 10 MB
            </span>
          </div>
        </div>
        <input type="hidden" name="content" value={editorContent} />
        
        <div style={{ background: "#fff", color: "#000", borderRadius: "4px", overflow: "hidden" }}>
          <ReactQuill 
            forwardedRef={quillRef}
            theme="snow" 
            value={editorContent} 
            onChange={setEditorContent} 
            modules={quillModules}
            style={{ minHeight: "300px" }}
          />
        </div>
      </div>

      <SubmitButton label={submitLabel} disabled={isOverLimit} />
    </form>
  );
}