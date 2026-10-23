import Link from 'next/link'
import LoginModal from '@/components/login-modal'

const explore = [
  { href: '/works', label: '作品' },
  { href: '/issues', label: '期刊' },
  { href: '/authors', label: '作者' },
  { href: '/about', label: '關於' },
  { href: '/submit', label: '投稿' },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-16">
        {/* 刊名 */}
        <div className="flex flex-col gap-4">
          <span className="font-serif text-3xl font-bold tracking-[0.1em]">東山文薈</span>
          <p className="max-w-[18rem] font-serif text-sm leading-[2] text-background/65">
            讓校園裡每一種微小的聲音，都有被閱讀的可能。
          </p>
        </div>

        <nav aria-label="頁尾導覽" className="flex flex-col gap-1">
          <p className="mb-2 font-serif text-xs text-background/50">目次</p>
          {explore.map((link) => (
            <Link key={link.href} href={link.href} className="w-fit py-1.5 font-serif text-[15px] tracking-[0.1em] transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1">
          <p className="mb-2 font-serif text-xs text-background/50">聯絡</p>
          <a href="mailto:dswh108@gmail.com" className="w-fit py-1.5 font-sans text-[15px] transition-colors hover:text-primary">
            dswh108@gmail.com
          </a>
          <div className="mt-6 w-fit font-serif text-sm text-background/60 transition-colors hover:text-background">
            <LoginModal />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-8 md:px-8">
        <div className="flex flex-col justify-between gap-2 border-t border-background/20 pt-6 font-sans text-xs tracking-[0.15em] text-background/55 md:flex-row">
          <p>© {new Date().getFullYear()} 東山文薈</p>
        </div>
      </div>
    </footer>
  )
}
