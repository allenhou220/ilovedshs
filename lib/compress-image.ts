// 上傳前在瀏覽器裡壓縮圖片：縮小尺寸並轉成 WebP（不支援的瀏覽器改用 JPEG），
// 讓上傳更快、更不容易超過伺服器的大小限制，訪客看圖也更快。
// 只在瀏覽器端使用；任何一步失敗都會直接回傳原檔，不會擋住上傳。

type Options = {
  /** 寬度上限（像素），預設 2000 */
  maxWidth?: number;
  /** 高度上限（像素），預設 4000；長條漫畫可以放寬 */
  maxHeight?: number;
  /** 壓縮品質 0~1，預設 0.85 */
  quality?: number;
  /** 尺寸本來就夠小、檔案也小於這個大小時，就不重新壓縮（位元組），預設 300KB */
  skipBelow?: number;
};

// 瀏覽器畫布的面積上限（Safari 約 1,670 萬像素），超過就不處理
const MAX_CANVAS_PIXELS = 16_000_000;

const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

export async function compressImageFile(file: File, options: Options = {}): Promise<File> {
  const { maxWidth = 2000, maxHeight = 4000, quality = 0.85, skipBelow = 300 * 1024 } = options;
  if (typeof window === "undefined" || typeof document === "undefined") return file;
  if (!file || !file.type.startsWith("image/")) return file;
  // GIF 可能是動畫、SVG 是向量圖，壓縮反而會壞掉
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  let bitmap: ImageBitmap;
  try {
    // from-image：照片的拍攝方向（手機直拍）會被正確轉正
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    if (scale === 1 && file.size <= skipBelow) return file;

    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    if (w * h > MAX_CANVAS_PIXELS) return file;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);

    const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    let blob = await toBlob("image/webp");
    if (!blob || blob.type !== "image/webp") {
      // 不能輸出 WebP 的瀏覽器：PNG 保持 PNG（保留透明背景），其他轉 JPEG
      blob = await toBlob(file.type === "image/png" ? "image/png" : "image/jpeg");
    }
    // 壓完反而更大（例如原本就是很小的 WebP）就用原檔
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]*$/, "") || "image";
    return new File([blob], `${base}.${EXT[blob.type] || "img"}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}

/** 表單裡某個檔案欄位如果有選圖片，就換成壓縮後的版本 */
export async function compressFormImage(formData: FormData, field = "image", options?: Options) {
  const value = formData.get(field);
  if (value && typeof value === "object" && "size" in value && value.size > 0) {
    formData.set(field, await compressImageFile(value as File, options));
  }
}
