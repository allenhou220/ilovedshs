import Link from 'next/link'
import LoginModal from '@/components/login-modal'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
        
        {/* 第 1 欄：品牌介紹 */}
        <div className="flex flex-col gap-4">
          <p className="font-serif text-4xl font-bold tracking-[0.2em]">文薈</p>
          <p className="max-w-sm text-sm leading-relaxed text-secondary-foreground/70">
            讓校園裡每一種微小的聲音，都有被閱讀的可能。這是屬於學生的文薈。
          </p>
        </div>

        {/* 第 2 欄：Explore */}
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-secondary-foreground/50">Explore</p>
          <Link href="/works" className="hover:underline">作品總覽</Link>
          <Link href="/about" className="hover:underline">關於文薈</Link>
          <Link href="/submit" className="hover:underline">投稿說明</Link>
        </div>

        {/* 第 3 欄：Contact */}
        <div className="flex flex-col items-start gap-3 text-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-secondary-foreground/50">Contact</p>
          <a href="mailto:wenhui@example.edu.tw" className="hover:underline">29395826教務處電話</a>
          <p className="text-secondary-foreground/60">東山文薈・每學期出刊</p>
        </div>

        {/* 第 4 欄：System (登入按鈕) */}
        <div className="flex flex-col items-start gap-3 text-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-secondary-foreground/50">System</p>
          <LoginModal />
        </div>

      </div>
      
      {/* 底部版權宣告 */}
      <div className="border-t border-secondary-foreground/15 px-5 py-5 text-center text-xs tracking-wider text-secondary-foreground/50">
        © 2026 東山文薈
      </div>
    </footer>
  )
}
