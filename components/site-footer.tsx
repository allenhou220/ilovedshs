import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr_1fr] md:px-8">
        <div className="flex flex-col gap-4">
          <p className="font-serif text-4xl font-bold tracking-[0.2em]">文薈</p>
          <p className="max-w-sm text-sm leading-relaxed text-background/70">讓校園裡每一種微小的聲音，都有被閱讀的可能。這是屬於學生的文薈
          。</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-background/50">Explore</p>
          <Link href="/works" className="hover:underline">作品總覽</Link>
          <Link href="/about" className="hover:underline">關於文薈</Link>
          <Link href="/submit" className="hover:underline">投稿說明</Link>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-background/50">Contact</p>
          <a href="mailto:wenhui@example.edu.tw" className="hover:underline">29395826教務處電話 打了沒用</a>
          <p className="text-background/60">東山文薈・每學期出刊</p>
        </div>
      </div>
      <div className="border-t border-background/15 px-5 py-5 text-center text-xs tracking-wider text-background/50">© 2026 東山文薈</div>
    </footer>
  )
}
