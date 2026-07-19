import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const sans = Noto_Sans_TC({ subsets: ['latin'], variable: '--font-noto-sans', display: 'swap' })
const serif = Noto_Serif_TC({ subsets: ['latin'], variable: '--font-noto-serif', display: 'swap' })

export const metadata: Metadata = {
  title: { default: '文薈｜東山文薈', template: '%s｜文薈' },
  description: '收錄學生散文、新詩與小說，讓校園裡每一種微小的聲音，都有被閱讀的可能。',
  generator: 'v0.app',
}

export const viewport: Viewport = { themeColor: '#f4f0e8', userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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