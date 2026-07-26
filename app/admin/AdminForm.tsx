'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

// 獨立的送出按鈕，用來顯示「發布中...」的狀態
function SubmitButton() {
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
      {pending ? "發布中..." : "確認發布"}
    </button>
  );
}

export default function AdminForm({ handlePublish }: { handlePublish: (formData: FormData) => Promise<void> }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 處理圖片選擇與預覽
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form action={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>文章標題</label>
        <input type="text" name="title" required style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box" }} />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>作者</label>
        <input type="text" name="author" placeholder="留空則顯示為匿名" style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box" }} />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>分類</label>
        <select name="category" style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box" }}>
          <option value="散文">散文</option>
          <option value="新詩">新詩</option>
          <option value="小說">小說</option>
        </select>
      </div>

      {/* 封面圖片上傳區塊 */}
      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>封面圖片</label>
        <input 
          type="file" 
          name="image" 
          accept="image/*"
          onChange={handleImageChange}
          style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box", cursor: "pointer" }} 
        />
        
        {/* 圖片預覽畫面 */}
        {imagePreview && (
          <div style={{ marginTop: "12px", borderRadius: "4px", overflow: "hidden", border: "1px solid #333" }}>
            <img src={imagePreview} alt="預覽" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>文章內容</label>
        <textarea name="content" rows={8} required style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: "4px", boxSizing: "border-box", resize: "vertical" }}></textarea>
      </div>

      <SubmitButton />
    </form>
  );
}