import type { MetadataRoute } from 'next'

// 告訴搜尋引擎：後台與 API 不要收錄，並提供 sitemap 位置
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: 'https://ilovedshs.vercel.app/sitemap.xml',
  }
}
