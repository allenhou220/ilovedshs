import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Syne, Plus_Jakarta_Sans, Noto_Serif_TC } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
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

export const viewport: Viewport = { themeColor: '#f4f0e8', userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      lang="zh-Hant" 
      className={`${syne.variable} ${jakarta.variable} ${serif.variable}`} 
      suppressHydrationWarning
    >
      {/* 💡 移除 body 上的 transition-colors duration-500，確保 View Transitions 切換 100% 同步流暢 */}
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
