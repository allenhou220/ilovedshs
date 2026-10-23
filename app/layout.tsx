import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { BackToTop } from '@/components/back-to-top'
import './globals.css'

// 字體：全站使用思源宋體（由 globals.css 從 Google Fonts 依需要分段載入），
// 介面小字使用各裝置內建的黑體，不另外下載字型檔

const SITE_URL = 'https://ilovedshs.vercel.app'

export const metadata: Metadata = {
  title: { 
    default: '東山文薈', 
    template: '%s｜東山文薈' 
  },
  description: '收錄學生散文、新詩與小說，讓校園裡每一種微小的聲音，都有被閱讀的可能。',
  // 讓分享到 LINE、Facebook 時的預覽圖與網址正確
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: '東山文薈',
    locale: 'zh_TW',
    type: 'website',
  },

  // Google Search Console 驗證
  verification: {
    google: "rbSnjhQCf1DWi7PiE4y0C02x4bKvUO8KCRG_T-zf6Aw", 
  },
}

export const viewport: Viewport = { 
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4efe6' },
    { media: '(prefers-color-scheme: dark)', color: '#181512' },
  ],
  width: 'device-width',
  initialScale: 1,
  // 不限制最大縮放：視力較弱的讀者需要能用手指放大文字
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      lang="zh-Hant" 

      suppressHydrationWarning
    >
      <body className="bg-background font-serif text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          <BackToTop />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}