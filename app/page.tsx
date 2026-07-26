import { sql } from "@vercel/postgres"
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Asterisk } from 'lucide-react'
import { WorkCard } from '@/components/work-card'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let works: any[] = []

  try {
    const { rows } = await sql`SELECT * FROM works ORDER BY id DESC`
    works = rows
  } catch (error) {
    console.error("讀取資料庫失敗:", error)
  }

  if (works.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="text-muted-foreground">目前還沒有發布任何文章，請先到後台新增。</p>
      </main>
    )
  }

  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-20">
        <div className="mb-8 flex items-center justify-between border-b border-foreground pb-4 text-xs tracking-[0.18em] text-muted-foreground">
          <span>第n期・春季號</span><span>ISSUE n — 2026</span>
        </div>
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.4fr] md:items-end">
          <div className="flex flex-col gap-8 md:pb-6">
            <p className="flex items-center gap-3 text-sm tracking-[0.25em] text-primary"><Asterisk className="size-4" /> 本期專題</p>
            <h1 className="text-balance font-serif text-6xl font-black leading-[1.08] tracking-tight md:text-8xl">在鐘聲<br />停下以前</h1>
            <p className="max-w-md text-pretty text-base leading-loose text-muted-foreground">我們以文字留住放學後的光、雨季裡的窗，以及那些還來不及說出口的青春。六位學生作者，寫下校園生活的不同切面。</p>
            <Link href={`/works/${works[0].id}`} className="inline-flex w-fit items-center gap-3 border-b border-primary pb-2 text-sm font-medium tracking-wider text-primary">閱讀本期首選 <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-[5/4]">
            <Image src="/images/hero-library.png" alt="雨後圖書館窗邊的書桌與筆記本" fill priority className="object-cover" sizes="(min-width: 768px) 58vw, 100vw" />
            <div className="absolute bottom-0 right-0 bg-primary px-5 py-4 text-primary-foreground">
              <p className="text-xs tracking-[0.18em]">COVER STORY</p>
              <p className="mt-1 font-serif text-lg font-bold">青春的留白練習</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 text-secondary-foreground md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-14 flex items-end justify-between border-b border-secondary-foreground/25 pb-5">
            <div><p className="mb-2 text-xs tracking-[0.22em] text-secondary-foreground/55">EDITOR&apos;S PICK</p><h2 className="font-serif text-4xl font-bold md:text-5xl">編輯精選</h2></div>
            <span className="font-serif text-5xl text-secondary-foreground/20">01</span>
          </div>
          <WorkCard work={works[0]} featured />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex items-end justify-between border-b border-foreground pb-5">
          <div><p className="mb-2 text-xs tracking-[0.22em] text-primary">NEW WRITING</p><h2 className="font-serif text-4xl font-bold md:text-5xl">最新作品</h2></div>
          <Link href="/works" className="hidden items-center gap-2 text-sm tracking-wider md:flex">查看全部 <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-3">
          {works.slice(1, 4).map((work) => <WorkCard key={work.id} work={work} />)}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {['散文 Essay', '新詩 Poetry', '小說 Fiction'].map((item, index) => (
            <Link key={item} href="/works" className="group flex min-h-48 flex-col justify-between border-b border-border p-8 transition-colors hover:bg-primary hover:text-primary-foreground md:border-b-0 md:border-r md:last:border-r-0">
              <span className="text-xs tracking-[0.2em] opacity-60">0{index + 1} / CATEGORY</span>
              <span className="flex items-end justify-between font-serif text-3xl font-bold">{item}<ArrowRight className="size-5 transition-transform group-hover:translate-x-2" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-[1fr_1.4fr] md:px-8 md:py-32">
        <div><p className="mb-4 text-xs tracking-[0.22em] text-primary">ABOUT WENHUI</p><h2 className="text-balance font-serif text-4xl font-bold leading-tight md:text-6xl">把校園裡<br />微小的聲音<br />留在紙上</h2></div>
        <div className="flex flex-col items-start gap-7 md:pt-12"><p className="text-pretty text-lg leading-loose text-muted-foreground">文薈是一份由學生共同編輯、書寫與閱讀的文學誌。我們相信文學不只在課本裡，也在每一次遲到的雨、未寄出的信，和放學後仍亮著的那扇窗。</p><Link href="/about" className="inline-flex items-center gap-2 border-b border-foreground pb-2 text-sm tracking-wider">認識我們 <ArrowRight className="size-4" /></Link></div>
      </section>
    </main>
  )
}