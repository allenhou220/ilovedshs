import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'

const links = [
  { href: '/works', label: '作品' },
  { href: '/about', label: '關於文薈' },
  { href: '/submit', label: '我想投稿' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="文薈首頁">
          
          {/* 圖片 Logo 區塊：取代原本的「文」字方塊 */}
          <div className="relative size-11 overflow-hidden transition-transform group-hover:-rotate-3">
            <Image 
              src="/images/dshslogo.jpg" // 
              alt="文薈 Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl font-bold tracking-[0.2em]">東山文薈</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Campus Literary Review</span>
          </span>
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex" aria-label="主要導覽">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium tracking-widest text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        
        <details className="relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center" aria-label="開啟選單">
            <Menu className="size-6" />
          </summary>
          <nav className="absolute right-0 top-12 flex w-52 flex-col border border-border bg-background p-4 shadow-lg" aria-label="行動版導覽">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="border-b border-border px-2 py-3 text-sm tracking-widest last:border-0">
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  )
}