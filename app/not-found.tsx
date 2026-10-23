import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 px-5 py-24 text-center">
      <p className="font-serif text-6xl font-bold text-primary md:text-7xl">404</p>
      <h1 className="font-serif text-4xl font-bold leading-[1.4] tracking-[0.12em] md:text-5xl">
        這一頁，<br />還沒有被寫下。
      </h1>
      <p className="max-w-md font-serif text-base leading-[2] text-muted-foreground">
        你要找的頁面可能已經移除、改了標題，或網址打錯了。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-12 items-center bg-foreground px-6 font-serif text-sm tracking-[0.2em] text-background transition-opacity hover:opacity-90">
          回到首頁
        </Link>
        <Link href="/works" className="inline-flex min-h-12 items-center border border-foreground px-6 font-serif text-sm tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background">
          瀏覽所有作品
        </Link>
      </div>
    </main>
  )
}
