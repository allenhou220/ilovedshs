import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Syne, Plus_Jakarta_Sans, Noto_Serif_TC } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { BackToTop } from '@/components/back-to-top' // 💡 1. 匯入回到頂部按鈕
import './globals.css'

// 💡 方案 2：字體設定 (Syne + Plus Jakarta Sans + Noto Serif TC)
const syne = Syne({ 
  subsets: ['latin'], 
  weight: ['700', '800'], 
  variable: '--font-syne',
  display: 'swap' 
})

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-jakarta',
  display: 'swap' 
})

const serif = Noto_Serif_TC({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '700'], 
  variable: '--font-noto-serif',
  display: 'swap' 
})

export const metadata: Metadata = {
  title: { default: '文薈｜東山文薈', template: '%s｜文薈' },
  description: '收錄學生散文、新詩與小說，讓校園裡每一種微小的聲音，都有被閱讀的可能。',
  generator: 'v0.app',
}

// 💡 2. 升級 Viewport：支援深淺色狀態列無縫切換，並鎖定 maximumScale 防 iOS 誤觸放大
export const viewport: Viewport = { 
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f0e8' }, 
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, 
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      lang="zh-Hant" 
      className={`${syne.variable} ${jakarta.variable} ${serif.variable}`} 
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false} // 💡 3. 必須設為 false，否則先前做的「全站圓形波浪切換動畫」會被 Next-themes 強制阻斷！
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          
          {/* 💡 4. 放置常駐的回到頂部按鈕 */}
          <BackToTop />
          
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}