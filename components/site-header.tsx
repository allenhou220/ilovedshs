import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

const links = [
  { href: '/works', label: '作品' },
  { href: '/about', label: '關於文薈' },
  { href: '/submit', label: '我想投稿' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      {/* 💡 頂部極簡架設中公告條 */}
      <div className="border-b border-border/30 bg-muted/20 py-2 text-center">
        <p className="font-serif text-[11px] tracking-[0.2em] text-muted-foreground/80">
          <span className="mr-2 font-mono text-[10px] font-semibold text-primary uppercase">[ BETA ]</span>
          網站目前仍在架設測試中，部分內容與功能持續更新完善，管理員已經嚴重過勞請體諒
        </p>
      </div>

      <div className="mx-auto flex min-h-[80px] max-w-7xl items-center justify-between px-5 md:px-8">
        
        <Link href="/" className="group flex items-center gap-4" aria-label="文薈首頁">
          {/* 圖片 Logo 區塊 */}
          <div className="relative size-10 overflow-hidden transition-transform duration-500 group-hover:-rotate-3 grayscale-[15%] group-hover:grayscale-0">
            <Image 
              src="/images/dshslogo.jpg" 
              alt="文薈 Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl font-normal tracking-[0.25em] text-foreground group-hover:text-foreground/70">
              東山文薈
            </span>
            <span className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              DSHS WENHUI
            </span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6 md:gap-8">
          {/* 電腦版導覽列 */}
          <nav className="hidden items-center gap-10 md:flex" aria-label="主要導覽">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="relative pb-1 text-xs font-serif tracking-[0.2em] text-muted-foreground hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all after:duration-500 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* 深淺色切換開關 */}
          <div className="opacity-70 transition-opacity hover:opacity-100">
            <ModeToggle />
          </div>
          
          {/* 行動版漢堡選單 */}
          <details className="group/menu relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center text-muted-foreground hover:text-foreground" aria-label="開啟選單">
              <Menu className="size-5" strokeWidth={1.5} />
            </summary>
            
            <nav className="absolute right-0 top-14 flex w-48 flex-col border border-border/50 bg-background/95 p-2 backdrop-blur-md" aria-label="行動版導覽">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="border-b border-border/30 px-4 py-4 text-xs font-serif tracking-[0.25em] text-foreground/80 last:border-0 hover:bg-muted/30 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
        
      </div>
    </header>
  )
}