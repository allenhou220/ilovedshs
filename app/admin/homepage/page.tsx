import { getSiteSettings, updateSiteSettingsAction } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomepageSettings() {
  // 從資料庫取得目前的設定值
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* 返回管理大廳 */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> 返回管理大廳
          </Link>
        </div>

        {/* 頁面標題區塊 */}
        <header className="border-b border-border/60 pb-8 mb-10">
          <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-primary font-bold">
            HOMEPAGE SETTINGS / 首頁外觀管理
          </p>
          <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl text-foreground">
            首頁外觀與封面設定
          </h1>
          <p className="mt-2 font-serif text-sm text-muted-foreground font-light tracking-wide">
            自訂刊物期數、主題大標題、引言宣告及封面展示圖片。
          </p>
        </header>
        
        {/* 表單卡片區塊 */}
        <form 
          action={updateSiteSettingsAction} 
          className="rounded-xl border border-border/70 bg-card/40 p-6 sm:p-10 backdrop-blur-sm shadow-sm space-y-8"
        >
          {/* 1. 期數與年份 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2.5">
                期數文字 (左上)
              </label>
              <input 
                type="text" 
                name="issueInfo" 
                defaultValue={settings?.issue_info} 
                className="w-full rounded-md border border-border/80 bg-background/60 px-4 py-2.5 font-serif text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30" 
                placeholder="例如：第 1 期・春季號" 
              />
            </div>
            <div>
              <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2.5">
                年份文字 (右上)
              </label>
              <input 
                type="text" 
                name="issueYear" 
                defaultValue={settings?.issue_year} 
                className="w-full rounded-md border border-border/80 bg-background/60 px-4 py-2.5 font-serif text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30" 
                placeholder="例如：ISSUE 1 — 2026" 
              />
            </div>
          </div>

          {/* 2. 本期大標題 */}
          <div>
            <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2.5">
              本期大標題 (最多 4 行，每行約 4 字)
            </label>
            <textarea 
              name="heroTitle" 
              defaultValue={settings?.hero_title} 
              rows={4}
              maxLength={19}
              className="w-full rounded-md border border-border/80 bg-background/60 p-4 font-serif text-xl sm:text-2xl font-light leading-relaxed text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30" 
              placeholder="這個網站&#10;還在架設&#10;你不要急&#10;感謝配合" 
            />
          </div>

          {/* 3. 引言 / 副標題 */}
          <div>
            <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2.5">
              引言 / 副標題
            </label>
            <textarea 
              name="heroSubtitle" 
              defaultValue={settings?.hero_subtitle} 
              rows={3} 
              className="w-full rounded-md border border-border/80 bg-background/60 p-4 font-serif text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30" 
              placeholder="輸入引言宣告..."
            />
          </div>

          {/* 4. Cover Story 小標題 */}
          <div>
            <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2.5">
              Cover Story 右下角小標題
            </label>
            <input 
              type="text" 
              name="coverStoryTitle" 
              defaultValue={settings?.cover_story_title} 
              className="w-full rounded-md border border-border/80 bg-background/60 px-4 py-2.5 font-serif text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30" 
              placeholder="例如：青春的留白練習" 
            />
          </div>

          {/* 5. 封面圖片上傳與預覽 */}
          <div className="pt-2 border-t border-border/40">
            <label className="block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2.5">
              上傳新主題圖片 (不選擇則維持原封面)
            </label>
            
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                className="w-full text-xs font-serif text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-serif file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer border border-border/80 rounded-md bg-background/60 p-2" 
              />
            </div>

            {/* 隱藏欄位：記住原本的圖片網址 */}
            <input type="hidden" name="existingImage" value={settings?.hero_image_url || ""} />
            
            {/* 目前封面圖片預覽 */}
            {settings?.hero_image_url && (
              <div className="mt-6">
                <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-3 flex items-center gap-1.5">
                  <ImageIcon size={13} /> 當前封面圖片檔
                </p>
                <div className="relative aspect-video max-w-sm overflow-hidden rounded-lg border border-border/70 bg-muted/30 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={settings.hero_image_url} 
                    alt="目前封面" 
                    className="h-full w-full object-cover" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* 提交按鈕 */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3.5 font-serif text-xs tracking-[0.2em] text-primary-foreground font-medium transition-colors hover:bg-primary/90 shadow-sm"
            >
              儲存首頁外觀設定
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}