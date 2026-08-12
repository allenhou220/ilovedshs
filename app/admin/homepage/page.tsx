import { getSiteSettings, updateSiteSettingsAction } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function HomepageSettings() {
  // 從資料庫取得目前的設定值
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      
      {/* 💡 新增的返回大廳按鈕 */}
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#8c4033] transition-colors font-medium">
          <ArrowLeft size={16} /> 返回管理大廳
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#8c4033] mb-6">首頁外觀管理</h1>
      
      {/* 呼叫 server action 來更新資料 */}
      <form action={updateSiteSettingsAction} className="bg-white p-6 rounded shadow-md space-y-4 text-black">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">期數文字 (左上)</label>
            <input 
              type="text" 
              name="issueInfo" 
              defaultValue={settings?.issue_info} 
              className="w-full border p-2 rounded" 
              placeholder="例如：第 1 期・春季號" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">年份文字 (右上)</label>
            <input 
              type="text" 
              name="issueYear" 
              defaultValue={settings?.issue_year} 
              className="w-full border p-2 rounded" 
              placeholder="例如：ISSUE 1 — 2026" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">本期大標題 (最多 4 行，每行 4 字)</label>
          <textarea 
            name="heroTitle" 
            defaultValue={settings?.hero_title} 
            rows={4}
            maxLength={19}
            className="w-full border p-2 rounded text-2xl font-black leading-relaxed" 
            placeholder="標題標題&#10;標題標題" 
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">引言 / 副標題</label>
          <textarea 
            name="heroSubtitle" 
            defaultValue={settings?.hero_subtitle} 
            rows={3} 
            className="w-full border p-2 rounded" 
            placeholder="輸入引言..."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Cover Story 右下角小標題</label>
          <input 
            type="text" 
            name="coverStoryTitle" 
            defaultValue={settings?.cover_story_title} 
            className="w-full border p-2 rounded" 
            placeholder="例如：青春的留白練習" 
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">上傳新主題圖片 (不選代表保留原圖片)</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            className="w-full border p-2 rounded" 
          />
          {/* 隱藏欄位用來記住原本的圖片網址 */}
          <input type="hidden" name="existingImage" value={settings?.hero_image_url || ""} />
          
          {settings?.hero_image_url && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">目前封面圖片：</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.hero_image_url} alt="目前封面" className="h-32 object-cover mt-1 rounded" />
            </div>
          )}
        </div>

        <button type="submit" className="bg-[#8c4033] text-white px-6 py-2 rounded hover:bg-[#7a372c] transition w-full font-bold">
          儲存首頁設定
        </button>
      </form>
    </div>
  );
}