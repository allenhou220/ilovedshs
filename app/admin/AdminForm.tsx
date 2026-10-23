'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { uploadEditorImageAction } from '@/lib/actions';
import { ArrowLeft, Upload, Trash2, ArrowUp, ArrowDown, Plus, Image as ImageIcon, BookOpen } from 'lucide-react';

const BlockNoteEditor = dynamic(() => import('@/components/blocknote-editor'), {
  ssr: false,
  loading: () => (
    <p style={{ color: 'hsl(var(--muted-foreground))', padding: '0 24px', fontSize: '14px' }}>
      編輯器加載中...
    </p>
  ),
});

function SubmitButton({ label, disabled, disabledLabel = "容量超過 10MB 無法發布" }: { label: string; disabled?: boolean; disabledLabel?: string }) {
  const { pending } = useFormStatus();
  const isBtnDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isBtnDisabled}
      style={{
        padding: "12px",
        background: isBtnDisabled ? "hsl(var(--muted))" : "hsl(var(--foreground))",
        color: isBtnDisabled ? "hsl(var(--foreground))" : "hsl(var(--background))",
        border: "none",
        cursor: isBtnDisabled ? "not-allowed" : "pointer",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "16px",
        transition: "all 0.2s",
        opacity: isBtnDisabled ? 0.7 : 1
      }}
    >
      {pending ? "發布中..." : disabled ? disabledLabel : label}
    </button>
  );
}

type DefaultValues = {
  title?: string;
  author?: string;
  category?: string;
  issue?: string;
  source_type?: string;
  sourceType?: string;
  content?: string;
  image_url?: string;
};

export default function AdminForm({
  handlePublish,
  defaultValues,
  submitLabel = "確認發布",
  isSubmission = false,
}: {
  handlePublish: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
  submitLabel?: string;
  isSubmission?: boolean;
}) {
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [author, setAuthor] = useState(defaultValues?.author || '');
  const [category, setCategory] = useState(defaultValues?.category || '散文');
  
  const initialSource = isSubmission 
    ? '學生投稿' 
    : (defaultValues?.source_type || defaultValues?.sourceType || '文薈成員創作');
    
  const [sourceType, setSourceType] = useState(initialSource);
  const [issue, setIssue] = useState(initialSource === '學生投稿' ? '' : (defaultValues?.issue || '第 1 期'));
  
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image_url || null);
  const [editorContent, setEditorContent] = useState(defaultValues?.content || '');
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // 💡 漫畫專用頁面狀態
  const [comicPages, setComicPages] = useState<string[]>([]);
  const [comicUploading, setComicUploading] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // 初始化解析：若為編輯狀態且是漫畫分類，自動解析圖片網址
  useEffect(() => {
    if (defaultValues?.category === '漫畫' && defaultValues?.content) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      const matches: string[] = [];
      let match;
      while ((match = imgRegex.exec(defaultValues.content)) !== null) {
        matches.push(match[1]);
      }
      if (matches.length > 0) {
        setComicPages(matches);
      }
    }
  }, [defaultValues]);

  // 當漫畫頁面變更時，自動編排為 HTML 直條漫格式並寫入 editorContent
  useEffect(() => {
    if (category === '漫畫') {
      const htmlContent = comicPages
        .map((src, i) => `<img src="${src}" alt="Comic Page ${i + 1}" class="comic-page-img w-full h-auto rounded-sm my-2 block" />`)
        .join('');
      setEditorContent(htmlContent);
    }
  }, [comicPages, category]);

  useEffect(() => {
    if (isSubmission || defaultValues?.sourceType === '學生投稿' || defaultValues?.source_type === '學生投稿') {
      setSourceType('學生投稿');
      setIssue('');
    }
  }, [isSubmission, defaultValues]);

  const contentSizeBytes = typeof Blob !== 'undefined' ? new Blob([editorContent]).size : 0;
  const isOverLimit = contentSizeBytes > 10 * 1024 * 1024;
  const displaySize = contentSizeBytes < 1024 * 1024 
    ? `${(contentSizeBytes / 1024).toFixed(2)} KB` 
    : `${(contentSizeBytes / (1024 * 1024)).toFixed(2)} MB`;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 批量上傳漫畫圖片：直接上傳到圖片空間，文章裡只存圖片網址
  // （以前會把整張圖片轉成文字塞進文章，導致文章動輒數 MB、頁面載入很慢）
  const handleComicFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = input.files;
    if (!files || files.length === 0) return;

    const fileArray: File[] = Array.from(files as FileList);
    setComicUploading(fileArray.length);

    const failed: string[] = [];
    const urls: string[] = [];
    // 依序上傳，確保頁面順序與選擇的檔案順序一致
    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadEditorImageAction(formData);
        if ('url' in res && res.url) {
          urls.push(res.url);
        } else {
          failed.push(`${file.name}：${'error' in res ? res.error : '上傳失敗'}`);
        }
      } catch {
        failed.push(`${file.name}：上傳失敗`);
      }
      setComicUploading((n) => Math.max(0, n - 1));
    }

    if (urls.length > 0) {
      setComicPages((prev) => [...prev, ...urls]);
    }
    if (failed.length > 0) {
      alert(`以下圖片未能上傳：\n${failed.join('\n')}`);
    }
    input.value = '';
  };

  // 新增單張外連網址
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setComicPages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  // 上下移動漫畫頁面
  const moveComicPage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...comicPages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setComicPages(newPages);
  };

  // 刪除漫畫頁面
  const removeComicPage = (index: number) => {
    setComicPages((prev) => prev.filter((_, i) => i !== index));
  };

  // 預覽前先過濾，避免學生投稿夾帶的惡意程式在管理員瀏覽器裡執行
  const cleanContent = sanitizeHtml(editorContent || '')
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') 
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')     
    .replace(/<p>\s*<\/p>/gi, '');             

  const isStudent = sourceType === "學生投稿";

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

      <div style={{ marginBottom: "16px" }}>
        <Link 
          href="/admin/works" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            fontSize: "14px", 
            color: "hsl(var(--muted-foreground))", 
            textDecoration: "none",
            fontWeight: "500"
          }}
        >
          <ArrowLeft size={16} /> 返回文章列表
        </Link>
      </div>

      <form action={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>文章標題</label>
          <input 
            type="text" 
            name="title" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ width: "100%", padding: "12px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "6px", boxSizing: "border-box", fontSize: "16px" }} 
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>作者</label>
            <input 
              type="text" 
              name="author" 
              placeholder="留空則顯示為匿名" 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              style={{ width: "100%", padding: "12px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>文體分類</label>
            <select 
              name="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              style={{ width: "100%", padding: "12px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }}
            >
              <option value="散文">散文</option>
              <option value="新詩">新詩</option>
              <option value="小說">小說</option>
              <option value="採訪">採訪</option>
              <option value="漫畫">漫畫</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>
              刊物期數 {isStudent && "（學生投稿免填）"}
            </label>
            <input 
              type="text" 
              name="issue" 
              disabled={isStudent}
              placeholder={isStudent ? "學生投稿不需填寫期數" : "例如：第 1 期 或 2026特刊"} 
              value={isStudent ? "" : issue} 
              onChange={(e) => setIssue(e.target.value)} 
              style={{ 
                width: "100%", 
                padding: "12px", 
                background: isStudent ? "hsl(var(--border))" : "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))", 
                color: isStudent ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))", 
                borderRadius: "6px", 
                boxSizing: "border-box", 
                fontSize: "15px",
                cursor: isStudent ? "not-allowed" : "text"
              }} 
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>文章來源</label>
            <select 
              name="sourceType" 
              value={sourceType} 
              onChange={(e) => {
                const newSource = e.target.value;
                setSourceType(newSource);
                if (newSource === "學生投稿") {
                  setIssue("");
                } else if (!issue) {
                  setIssue("第 1 期");
                }
              }} 
              style={{ width: "100%", padding: "12px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "6px", boxSizing: "border-box", fontSize: "15px" }}
            >
              <option value="學生投稿">學生投稿</option>
              <option value="文薈成員創作">文薈成員創作</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "hsl(var(--muted-foreground))" }}>封面圖片{defaultValues ? "（不選則保留原圖）" : ""}</label>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleImageChange}
            style={{ width: "100%", padding: "12px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "6px", boxSizing: "border-box", cursor: "pointer", fontSize: "14px" }}
          />
          {defaultValues && <input type="hidden" name="existingImage" value={defaultValues.image_url || ""} />}

          {imagePreview && (
            <div style={{ marginTop: "16px", borderRadius: "6px", overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
              <img src={imagePreview} alt="預覽" style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
            </div>
          )}
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <label style={{ fontSize: "14px", color: "hsl(var(--muted-foreground))", display: "flex", alignItems: "center", gap: "12px" }}>
              {category === '漫畫' ? '漫畫頁面管理' : '文章內容'}
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                style={{
                  padding: "4px 12px",
                  background: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
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
              color: isOverLimit ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
              fontWeight: isOverLimit ? "bold" : "normal",
              background: isOverLimit ? "hsl(var(--destructive) / 0.1)" : "transparent",
              padding: "4px 8px",
              borderRadius: "4px",
              border: isOverLimit ? "1px solid hsl(var(--destructive))" : "none"
            }}>
              {isOverLimit ? "⚠️ 超過上限：" : "容量計算："}
              {displaySize} / 10 MB
            </span>
          </div>
          
          <input type="hidden" name="content" value={editorContent} />
          
          <div style={{ display: activeTab === "edit" ? "block" : "none" }}>
            {category === '漫畫' ? (
              <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", padding: "20px" }}>
                <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <label 
                    style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      padding: "10px 16px", 
                      background: "hsl(var(--border))", 
                      color: "hsl(var(--foreground))", 
                      borderRadius: "4px", 
                      cursor: "pointer", 
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    <Upload size={16} /> 批量選擇漫畫圖檔
                    <input 
                      type="file" 
                      multiple 
                      accept="image/jpeg,image/png,image/gif,image/webp,image/avif" 
                      onChange={handleComicFilesUpload} 
                      style={{ display: "none" }} 
                    />
                  </label>
                  <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>
                    {comicUploading > 0 ? `上傳中，還剩 ${comicUploading} 張...` : `已載入 ${comicPages.length} 頁漫畫`}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                  <input 
                    type="text" 
                    placeholder="或輸入外連漫畫圖片 URL..." 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "4px", fontSize: "14px" }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddImageUrl}
                    style={{ padding: "8px 16px", background: "hsl(var(--border))", color: "hsl(var(--foreground))", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Plus size={16} /> 新增
                  </button>
                </div>

                {comicPages.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {comicPages.map((src, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between", 
                          background: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))", 
                          padding: "10px 16px", 
                          borderRadius: "4px" 
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", fontFamily: "monospace", width: "40px" }}>
                            P.{index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </span>
                          <img src={src} alt={`P.${index + 1}`} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px" }} />
                          <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whitespace: "nowrap" }}>
                            {src.substring(0, 35)}...
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button 
                            type="button" 
                            disabled={index === 0} 
                            onClick={() => moveComicPage(index, 'up')}
                            style={{ padding: "6px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: index === 0 ? "hsl(var(--muted))" : "hsl(var(--foreground))", borderRadius: "4px", cursor: index === 0 ? "not-allowed" : "pointer" }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button 
                            type="button" 
                            disabled={index === comicPages.length - 1} 
                            onClick={() => moveComicPage(index, 'down')}
                            style={{ padding: "6px", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: index === comicPages.length - 1 ? "hsl(var(--muted))" : "hsl(var(--foreground))", borderRadius: "4px", cursor: index === comicPages.length - 1 ? "not-allowed" : "pointer" }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => removeComicPage(index)}
                            style={{ padding: "6px", background: "hsl(var(--destructive) / 0.12)", border: "1px solid hsl(var(--destructive) / 0.25)", color: "hsl(var(--destructive))", borderRadius: "4px", cursor: "pointer", marginLeft: "8px" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 0", border: "1px dashed hsl(var(--border))", borderRadius: "4px", color: "hsl(var(--muted-foreground))" }}>
                    <ImageIcon size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                    <p style={{ fontSize: "14px" }}>尚未上傳任何漫畫頁面，請點擊上方按鈕批量上傳。</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", padding: "16px 0", minHeight: "400px" }}>
                {isMounted ? (
                  <BlockNoteEditor
                    initialContent={defaultValues?.content || ''}
                    onChange={setEditorContent}
                  />
                ) : (
                  <p style={{ color: 'hsl(var(--muted-foreground))', padding: '0 24px', fontSize: '14px' }}>編輯器初始化中...</p>
                )}
              </div>
            )}
          </div>
        </div>

        <SubmitButton
          label={submitLabel}
          disabled={isOverLimit || comicUploading > 0}
          disabledLabel={comicUploading > 0 ? "圖片上傳中，請稍候..." : undefined}
        />
      </form>

      {/* 💡 前台預覽 Modal（包含漫畫直條漫模組） */}
      {activeTab === "preview" && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground">
          <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-6 py-4 shadow-sm">
            <span className="text-sm font-bold tracking-widest text-muted-foreground">文薈 - 前台模擬預覽</span>
            <button 
              type="button" 
              onClick={() => setActiveTab("edit")}
              className="rounded-sm bg-foreground px-5 py-2 text-sm font-bold text-background transition-opacity hover:opacity-90"
            >
              退出預覽 / 繼續編輯
            </button>
          </div>
          
          <article className="min-h-screen">
            <header className="mx-auto max-w-5xl px-5 pb-10 pt-16 text-center md:px-8 md:pb-14 md:pt-24">
              <div className="mb-12 inline-flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground opacity-50">
                ← 返回作品總覽 (這只是預覽哦)
              </div>

              <p className="mb-6 text-sm tracking-[0.25em] text-muted-foreground">
                {isStudent ? "學生投稿" : issue} ・ {category || '散文'}
              </p>

              <h1 className="text-balance font-serif text-5xl font-black leading-tight md:text-7xl text-foreground">
                {title || '請輸入標題'}
              </h1>

              <div className="mt-8 flex items-center justify-center gap-3 text-sm">
                <span className="font-medium text-foreground">{author || '匿名'}</span>
              </div>
            </header>

            {/* 封面圖片（非漫畫時顯示） */}
            {imagePreview && category !== '漫畫' && (
              <div className="mx-auto max-w-5xl px-5 md:px-8 mb-12">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-card">
                  <img
                    src={imagePreview}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 💡 預覽條件分流：漫畫條漫模式 vs 文字文章模式 */}
            {category === '漫畫' ? (
              <section className="mx-auto max-w-3xl px-0 md:px-4 pb-16">
                <div className="mb-6 flex items-center justify-between px-5 font-mono text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" /> 直條漫預覽模式
                  </span>
                  <span>{comicPages.length > 0 ? `共 ${comicPages.length} 頁` : ''}</span>
                </div>

                <div className="flex flex-col items-center bg-foreground p-0 md:rounded-md md:border md:border-border overflow-hidden shadow-2xl">
                  {comicPages.length > 0 ? (
                    comicPages.map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        alt={`漫畫第 ${index + 1} 頁`}
                        className="w-full h-auto block object-contain select-none"
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-sm text-muted-foreground">
                      尚未新增任何漫畫頁面。
                    </div>
                  )}
                </div>

                <aside className="mt-16 mx-5 border-y border-border py-8 text-center md:text-left">
                  <p className="mb-3 text-xs tracking-[0.2em] text-muted-foreground">ABOUT THE AUTHOR</p>
                  <p className="font-serif text-xl font-bold text-foreground">{author || '匿名'}</p>
                </aside>
              </section>
            ) : (
              <div className={`mx-auto px-5 py-16 md:py-24 ${category === '新詩' ? 'max-w-2xl text-center' : 'max-w-3xl'}`}>
                <div 
                  className="
                    custom-article-content
                    text-lg leading-[2.15] md:text-xl text-foreground text-justify
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

                <aside className="mt-20 border-y border-border py-8 text-center md:text-left">
                  <p className="mb-3 text-xs tracking-[0.2em] text-muted-foreground">ABOUT THE AUTHOR</p>
                  <p className="font-serif text-xl font-bold text-foreground">{author || '匿名'}</p>
                </aside>
              </div>
            )}
          </article>
        </div>
      )}
    </>
  );
}