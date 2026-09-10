import Link from 'next/link'
import LoginModal from '@/components/login-modal'

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-24">
      <div className="h-[1px] w-full bg-border/50"></div>
      
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        
        <div className="flex flex-col gap-6">
          <p className="font-serif text-3xl font-normal tracking-[0.4em] text-secondary-foreground">
            文薈
          </p>
          <p className="max-w-xs text-sm leading-[2.2] text-secondary-foreground/70">
            讓校園裡每一種微小的聲音，都有被閱讀的可能。這是屬於學生的文薈。
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 text-sm">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-secondary-foreground/50">
            Explore
          </p>
          <Link href="/works" className="transition-colors duration-500 hover:text-secondary-foreground">
            作品總覽
          </Link>
          <Link href="/about" className="transition-colors duration-500 hover:text-secondary-foreground">
            關於文薈
          </Link>
          <Link href="/submit" className="transition-colors duration-500 hover:text-secondary-foreground">
            投稿說明
          </Link>
        </div>

        <div className="flex flex-col items-start gap-4 text-sm">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-secondary-foreground/50">
            Contact
          </p>
          <a href="mailto:wenhui@example.edu.tw" className="transition-colors duration-500 hover:text-secondary-foreground">
            29395826 教務處
          </a>
          <p className="text-secondary-foreground/70">東山文薈・每學期出刊</p>
        </div>

        <div className="flex flex-col items-start gap-4 text-sm">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-secondary-foreground/50">
            System
          </p>
          <div className="opacity-70 transition-opacity duration-500 hover:opacity-100">
            <LoginModal />
          </div>
        </div>

      </div>
      
      <div className="mx-auto max-w-7xl px-5 pb-8 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-[11px] tracking-[0.25em] text-secondary-foreground/60 md:flex-row">
          <p>© 2026 東山文薈. All Rights Reserved.</p>
          <p className="font-serif italic tracking-widest text-secondary-foreground/50">
            The voices of Dongshan.
          </p>
        </div>
      </div>
    </footer>
  )
}