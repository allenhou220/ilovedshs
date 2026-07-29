'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "12px",
        background: pending ? "#3b82f6" : "#2563eb",
        color: "#fff",
        border: "none",
        cursor: pending ? "not-allowed" : "pointer",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "16px",
        opacity: pending ? 0.7 : 1
      }}
    >
      {pending ? "處理中..." : label}
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
        {/* 編輯模式下，把原本的圖片網址一起送出，後端沒收到新圖片時會沿用這個 */}
        {defaultValues && <input type="hidden" name="existingImage" value={defaultValues.image_url || ""} />}

        {imagePreview && (
          <div style={{ marginTop: "12px", borderRadius: "4px", overflow: "hidden", border: "1px solid #333" }}>
            <img src={imagePreview} alt="預覽" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>文章內容</label>
        <textarea name="content" rows={8} required defaultValue={defaultValues?.content} style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box", resize: "vertical" }}></textarea>
      </div>

      <SubmitButton label={submitLabel} />
    </form>
  );
}