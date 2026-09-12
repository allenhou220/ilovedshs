import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Syne, Plus_Jakarta_Sans, Noto_Serif_TC } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { BackToTop } from '@/components/back-to-top'
import './globals.css'

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
  title: { 
    default: '東山文薈', 
    template: '%s｜東山文薈' 
  },
  description: '收錄學生散文、新詩與小說，讓校園裡每一種微小的聲音，都有被閱讀的可能。',
  generator: 'v0.app',
  
  // 💡 加上這段，Google 就能驗證這是你的網站
  verification: {
    google: "rbSnjhQCf1DWi7PiE4y0C02x4bKvUO8KCRG_T-zf6Aw", 
  },
}

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