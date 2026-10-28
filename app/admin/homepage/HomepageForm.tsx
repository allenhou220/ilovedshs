"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "@/lib/actions";
import { HERO_TITLE_MAX_CHARS, HERO_TITLE_MAX_LINES, normalizeHeroTitle } from "@/lib/text";

type Values = {
  issueInfo: string;
  issueYear: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  submissionDeadline: string;
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const MAX_IMAGE_MB = 10;
const SUBTITLE_MAX = 200;
const DEFAULT_IMAGE = "/images/hero-library.png";

const inputClass =
  "w-full border border-foreground/25 bg-background px-4 py-3 font-serif text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary";

function Field({ label, hint, htmlFor, children }: { label: string; hint?: ReactNode; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-serif text-sm font-bold">
        {label}
      </label>
      {children}
      {hint && <div className="font-serif text-xs leading-relaxed text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default function HomepageForm({ initial }: { initial: Values }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState<Values>(initial);
  const [values, setValues] = useState<Values>(initial);
  const [newImage, setNewImage] = useState<{ file: File; url: string } | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // 釋放預覽圖片佔用的記憶體
  useEffect(() => () => { if (newImage) URL.revokeObjectURL(newImage.url); }, [newImage]);

  const set = (key: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setMessage(null);
  };

  // ----- 大標題檢查 -----
  const rawLines = values.heroTitle.split("\n").map((l) => l.trim()).filter(Boolean);
  const tooManyLines = rawLines.length > HERO_TITLE_MAX_LINES;
  const longLines = rawLines.slice(0, HERO_TITLE_MAX_LINES).filter((l) => Array.from(l).length > HERO_TITLE_MAX_CHARS);
  const previewTitle = normalizeHeroTitle(values.heroTitle);
  const previewLines = previewTitle ? previewTitle.split("\n") : [];
  const longest = Math.max(3, ...previewLines.map((l) => Array.from(l).length));
  const previewSize = Math.max(20, Math.min(40, Math.floor(300 / longest)));

  // 是否有未儲存的變更：換了圖片，或任何欄位與已儲存的值不同
  const dirty = newImage !== null || (Object.keys(values) as (keyof Values)[]).some((k) => values[k] !== saved[k]);

  // 選擇圖片：先在前端檢查格式與大小，通過才顯示預覽
  function pickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setMessage(null);
    if (!file) return setNewImage(null);
    if (!IMAGE_TYPES.includes(file.type)) {
      e.target.value = "";
      setNewImage(null);
      return setMessage({ type: "error", text: "只接受 JPG、PNG、GIF、WebP、AVIF 圖片。" });
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      e.target.value = "";
      setNewImage(null);
      return setMessage({ type: "error", text: `圖片不可超過 ${MAX_IMAGE_MB}MB。` });
    }
    setNewImage({ file, url: URL.createObjectURL(file) });
  }

  function clearImage() {
    if (fileRef.current) fileRef.current.value = "";
    setNewImage(null);
  }

  // 送出：把欄位與圖片組成 FormData 交給伺服器動作，成功後更新「已儲存」狀態並重新整理頁面
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!previewTitle) {
      setMessage({ type: "error", text: "請輸入本期大標題。" });
      return;
    }
    const fd = new FormData();
    fd.set("issueInfo", values.issueInfo);
    fd.set("issueYear", values.issueYear);
    fd.set("heroTitle", values.heroTitle);
    fd.set("heroSubtitle", values.heroSubtitle);
    fd.set("submissionDeadline", values.submissionDeadline);
    fd.set("existingImage", values.heroImage);
    if (newImage) fd.set("image", newImage.file);

    startTransition(async () => {
      try {
        const result = await updateSiteSettingsAction(fd);
        if ("error" in result) {
          setMessage({ type: "error", text: result.error });
          return;
        }
        const next = { ...values, heroTitle: previewTitle, heroImage: result.imageUrl };
        setValues(next);
        setSaved(next);
        clearImage();
        setMessage({ type: "ok", text: "已儲存，首頁已更新。" });
        router.refresh();
      } catch {
        setMessage({ type: "error", text: "儲存失敗，請確認網路連線或重新登入後再試。" });
      }
    });
  }

  const imageSrc = newImage?.url || values.heroImage || DEFAULT_IMAGE;
  const label = [values.issueInfo, values.issueYear].filter(Boolean).join("　") || "本期專題";

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
      {/* ===== 左：表單 ===== */}
      <div className="flex flex-col gap-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="期數" htmlFor="issueInfo" hint="顯示在大標題上方。">
            <input id="issueInfo" value={values.issueInfo} onChange={set("issueInfo")} maxLength={40} className={inputClass} placeholder="第 14 期・秋季號" />
          </Field>
          <Field label="年份（可留空）" htmlFor="issueYear">
            <input id="issueYear" value={values.issueYear} onChange={set("issueYear")} maxLength={40} className={inputClass} placeholder="2026" />
          </Field>
        </div>

        <Field
          label="本期大標題"
          htmlFor="heroTitle"
          hint={
            <div className="flex flex-col gap-1">
              <span>按 Enter 換行。最多 {HERO_TITLE_MAX_LINES} 行、每行最多 {HERO_TITLE_MAX_CHARS} 字，字越少顯示越大。</span>
              {rawLines.length > 0 && (
                <span className="flex flex-wrap gap-x-4">
                  {rawLines.map((l, i) => {
                    const n = Array.from(l).length;
                    const bad = i >= HERO_TITLE_MAX_LINES || n > HERO_TITLE_MAX_CHARS;
                    return (
                      <span key={i} className={bad ? "font-bold text-primary" : ""}>
                        第 {i + 1} 行 {n} 字
                      </span>
                    );
                  })}
                </span>
              )}
              {(tooManyLines || longLines.length > 0) && (
                <span className="font-bold text-primary">超出的部分不會顯示，請看右邊預覽。</span>
              )}
            </div>
          }
        >
          <textarea
            id="heroTitle"
            value={values.heroTitle}
            onChange={set("heroTitle")}
            rows={4}
            required
            className={`${inputClass} resize-y font-bold leading-relaxed md:text-2xl`}
            placeholder={"在鐘聲\n停下以前"}
          />
        </Field>

        <Field label="引言" htmlFor="heroSubtitle" hint={`${Array.from(values.heroSubtitle).length} / ${SUBTITLE_MAX} 字，一兩句話最好看。`}>
          <textarea
            id="heroSubtitle"
            value={values.heroSubtitle}
            onChange={set("heroSubtitle")}
            rows={3}
            maxLength={SUBTITLE_MAX}
            className={`${inputClass} resize-y leading-relaxed`}
            placeholder="我們以文字留住放學後的光、雨季裡的窗，以及那些還來不及說出口的青春。"
          />
        </Field>

        <Field label="封面圖片" htmlFor="image" hint={`JPG、PNG、WebP 等，${MAX_IMAGE_MB}MB 以內，橫式 4:3 最合適。不選就維持目前的圖片。`}>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center border border-foreground px-5 font-serif text-sm transition-colors hover:bg-foreground hover:text-background">
              選擇圖片
              <input ref={fileRef} id="image" type="file" accept={IMAGE_TYPES.join(",")} onChange={pickImage} className="sr-only" />
            </label>
            {newImage ? (
              <>
                <span className="max-w-[16rem] truncate font-serif text-sm">{newImage.file.name}</span>
                <button type="button" onClick={clearImage} className="min-h-11 font-serif text-sm text-muted-foreground underline underline-offset-4 hover:text-primary">
                  取消
                </button>
              </>
            ) : (
              <span className="font-serif text-sm text-muted-foreground">{values.heroImage ? "使用目前的圖片" : "使用預設圖片"}</span>
            )}
          </div>
        </Field>

        <Field label="本期截稿日期（可留空）" htmlFor="submissionDeadline" hint="會顯示在首頁和投稿頁，日期過了自動隱藏。要停止收件請到後台總覽切換。">
          <div className="flex flex-wrap items-center gap-3">
            <input id="submissionDeadline" type="date" value={values.submissionDeadline} onChange={set("submissionDeadline")} className={`${inputClass} max-w-xs`} />
            {values.submissionDeadline && (
              <button
                type="button"
                onClick={() => setValues((v) => ({ ...v, submissionDeadline: "" }))}
                className="min-h-11 font-serif text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                清除
              </button>
            )}
          </div>
        </Field>

        <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-4 border-t border-foreground/20 bg-background px-5 py-4 md:mx-0 md:px-0">
          <button
            type="submit"
            disabled={pending || !dirty}
            className="inline-flex min-h-12 items-center bg-primary px-8 font-serif text-[15px] tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "儲存中⋯" : "儲存"}
          </button>
          <span role="status" aria-live="polite" className={`font-serif text-sm ${message?.type === "error" ? "text-primary" : "text-muted-foreground"}`}>
            {message?.text || (dirty ? "有尚未儲存的修改" : "")}
          </span>
        </div>
      </div>

      {/* ===== 右：即時預覽 ===== */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 font-serif text-xs text-muted-foreground">首頁預覽</p>
        <div className="flex flex-col gap-5 border border-foreground/20 bg-background p-6">
          <p className="font-serif text-xs font-bold tracking-[0.1em] text-primary">{label}</p>
          {previewLines.length > 0 ? (
            <div className="flex flex-col font-serif font-bold leading-[1.25] tracking-[0.04em]" style={{ fontSize: previewSize }}>
              {previewLines.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          ) : (
            <p className="font-serif text-2xl font-bold text-muted-foreground/40">（尚未輸入標題）</p>
          )}
          {values.heroSubtitle && <p className="font-serif text-sm leading-[1.9] text-foreground/85">{values.heroSubtitle}</p>}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt="封面預覽" className="absolute inset-0 h-full w-full object-cover" />
            {newImage && <span className="absolute left-0 top-0 bg-primary px-2 py-1 font-serif text-xs text-primary-foreground">新圖片・尚未儲存</span>}
          </div>
        </div>
      </aside>
    </form>
  );
}
