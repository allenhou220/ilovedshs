import { MetadataRoute } from 'next'
import { sql } from "@vercel/postgres"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ilovedshs.vercel.app' // 你的正式網址

  // 1. 寫死的基本靜態頁面
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // 首頁最重要，權重設為 1
    },
    {
      url: `${baseUrl}/works`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8, // 總覽頁每天可能會有新文章
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // 2. 從資料庫撈取所有文章，自動產生每一篇文章的專屬網址
    const { rows: works } = await sql`SELECT title, created_at FROM works WHERE title IS NOT NULL`

    const dynamicRoutes: MetadataRoute.Sitemap = works.map((work) => ({
      // 將中文標題轉碼，符合網址規範
      url: `${baseUrl}/works/${encodeURIComponent(work.title)}`,
      lastModified: work.created_at ? new Date(work.created_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7, // 文章頁權重
    }))

    // 3. 把靜態頁面和動態文章頁面合併，交給 Google
    return [...staticRoutes, ...dynamicRoutes]
  } catch (error) {
    console.error("生成 Sitemap 失敗:", error)
    // 如果資料庫出錯，至少給 Google 基本的靜態地圖
    return staticRoutes
  }
}