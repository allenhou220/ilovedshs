import { sql } from "@vercel/postgres"
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Asterisk } from 'lucide-react'
import { WorkCard } from '@/components/work-card'
import LoginModal from '@/components/login-modal'
import { getSiteSettings } from "@/lib/actions"

export const dynamic = 'force-dynamic'

function stripHtml(html: string = '') {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function Page() {
  let works: any[] = []
  let settings: any = null

  try {
    const { rows } = await sql`SELECT * FROM works ORDER BY sort_order ASC`
    works = rows
    settings = await getSiteSettings()
  } catch (error) {
    console.error("讀取資料庫失敗:", error)
  }

  if (works.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-32 text-center bg-background text-foreground">
        <p className="text-muted-foreground font-serif tracking-widest">目前還沒有發布任何文章，請先到後台新增。</p>
        <div className="mt-8">
          <LoginModal />
        </div>
      </main>
    )
  }

  const rawFeaturedWork = works.find((w) => w.featured) || works[0]
  const rawLatestWorks = works.filter((w) => w.id !== rawFeaturedWork.id).slice(0, 3)

  const featuredWork = {
    ...rawFeaturedWork,
    content: stripHtml(rawFeaturedWork.content || '')
  }

  const latestWorks = rawLatestWorks.map((work) => ({
    ...work,
    content: stripHtml(work.content || '')
  }))

  return (
    <main className="bg-background text-foreground">
      {/* ===== Hero 區塊 ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-12 md:px-8 md:pb-32 md:pt-20">
        <div className="mb-12 flex items-center justify-between border-b border-border/60 pb-6 text-xs tracking-[0.25em] text-muted-foreground">
          <span className="font-serif tracking-[0.3em]">{settings?.issue_info || '第 2 期・春季號'}</span>
          <span className="font-display tracking-[0.2em] font-semibold text-foreground/80">{settings?.issue_year || 'ISSUE 01 — 2026'}</span>
        </div>
        
        <div className="grid gap-12 md:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div className="flex h-full flex-col items-start">
            <div className="flex flex-col gap-5">
              <p className="flex items-center gap-3 text-xs tracking-[0.3em] text-primary">
                <Asterisk className="size-3.5 opacity-80" /> 
                <span className="font-serif font-medium">本期專題</span>
              </p>
              
              <h1 className="text-balance font-serif text-5xl font-light leading-[1.1] tracking-wide sm:text-6xl md:text-[5rem] whitespace-pre-wrap text-foreground">
                {settings?.hero_title || '在鐘聲\n停下以前'}
              </h1>
              
              <p className="max-w-sm text-pretty font-serif text-sm md:text-base leading-[1.85] text-muted-foreground font-light">
                {settings?.hero_subtitle || '我們以文字留住放學後的光、雨季裡的窗，以及那些還來不及說出口的青春。六位學生作者，寫下校園生活的不同切面。'}
              </p>
            </div>
            
            <Link 
              href={`/works/${featuredWork.id}`} 
              className="group mt-10 inline-flex w-fit items-center gap-4 border-b border-foreground/80 pb-2 font-serif text-xs font-normal tracking-[0.25em] text-foreground transition-all duration-500 hover:border-primary hover:text-primary md:mt-auto"
            >
              閱讀本期首選 
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-2" />
            </Link>
          </div>
          
          <div className="group relative w-full overflow-hidden bg-muted aspect-[4/3]">
            <img 
              src={settings?.hero_image_url || "/images/hero-library.png"} 
              alt="Cover Story" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
            />
            <div className="absolute bottom-0 right-0 max-w-[85%] border-l border-t border-border/40 bg-card/90 px-6 py-5 backdrop-blur-md md:px-8 md:py-6">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary font-bold">COVER STORY</p>
              <p className="mt-1.5 font-serif text-base font-normal leading-snug text-card-foreground md:text-lg">
                {settings?.cover_story_title || '青春的留白練習'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 編輯精選區塊 ===== */}
      <section className="border-y border-border bg-muted/30 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-16 flex items-end justify-between border-b border-border/60 pb-6">
            <div>
              <p className="mb-2 font-display text-xs tracking-[0.3em] text-primary font-bold">EDITOR&apos;S PICK</p>
              <h2 className="font-serif text-3xl font-normal md:text-4xl tracking-wide">編輯精選</h2>
            </div>
            <span className="font-display text-6xl md:text-7xl font-light text-muted-foreground/20 leading-none">01</span>
          </div>
          <WorkCard work={featuredWork} featured />
        </div>
      </section>

      {/* ===== 最新作品區塊 ===== */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="mb-16 flex items-end justify-between border-b border-border/60 pb-6">
          <div>
            <p className="mb-2 font-display text-xs tracking-[0.3em] text-primary font-bold">NEW WRITING</p>
            <h2 className="font-serif text-3xl font-normal md:text-4xl tracking-wide">最新作品</h2>
          </div>
          <Link 
            href="/works" 
            className="group hidden items-center gap-3 border-b border-transparent pb-1 font-serif text-xs tracking-[0.2em] text-muted-foreground transition-colors duration-500 hover:border-foreground hover:text-foreground md:flex"
          >
            查看全部 
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-x-12 gap-y-20 md:grid-cols-3">
          {latestWorks.map((work) => <WorkCard key={work.id} work={work} />)}
        </div>
      </section>

 {/* ===== 分類區塊（3 欄 × 2 列雙排網格） ===== */}
<section className="border-t border-border/60 bg-background">
  <div className="mx-auto max-w-7xl border-l border-border/60">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { id: '01', zh: '散文', en: 'Essay', href: '/works?category=散文' },
        { id: '02', zh: '新詩', en: 'Poetry', href: '/works?category=新詩' },
        { id: '03', zh: '小說', en: 'Fiction', href: '/works?category=小說' },
        { id: '04', zh: '採訪', en: 'Interview', href: '/works?category=採訪' },
        { id: '05', zh: '漫畫', en: 'Comic', href: '/works?category=漫畫' },
        { id: '06', zh: '全部作品', en: 'All Works', href: '/works', isAll: true },
      ].map((item) => (
        <Link 
          key={item.id} 
          href={item.href} 
          className={`group flex min-h-[200px] flex-col justify-between border-b border-r border-border/60 p-8 md:p-10 transition-colors duration-500 hover:bg-muted/40 ${
            item.isAll ? 'bg-muted/15' : ''
          }`}
        >
          {/* 上標編號 */}
          <span className="font-display text-[10px] tracking-[0.25em] text-muted-foreground/70">
            {item.id} / {item.isAll ? 'EXPLORE' : 'CATEGORY'}
          </span>

          {/* 中英文名稱 */}
          <div className="mt-8 flex items-baseline justify-between">
            <span className={`font-serif text-2xl font-light tracking-wide transition-colors duration-500 group-hover:text-primary lg:text-3xl ${
              item.isAll ? 'text-primary font-normal' : 'text-foreground'
            }`}>
              {item.zh}
            </span>
            <span className="font-display text-xs tracking-widest text-muted-foreground/60 transition-colors duration-500 group-hover:text-primary">
              {item.en}
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>

      {/* ===== 關於文薈區塊 ===== */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-32 md:grid-cols-[1fr_1.3fr] md:px-8 md:py-40">
        <div>
          <p className="mb-4 font-display text-xs tracking-[0.3em] text-primary font-bold">ABOUT WENHUI</p>
          <h2 className="text-balance font-serif text-4xl font-light leading-[1.35] tracking-wide md:text-5xl">
            把校園裡<br />微小的聲音<br />留在紙上。
          </h2>
        </div>
        <div className="flex flex-col items-start gap-10 md:pt-10">
          <p className="text-pretty font-serif text-base md:text-lg leading-[2.2] text-muted-foreground font-light">
            文薈是一份由學生共同編輯、書寫與閱讀的文學誌。我們相信文學不只在課本裡，也在每一次遲到的雨、未寄出的信，和放學後仍亮著的那扇窗。
          </p>
          <Link 
            href="/about" 
            className="group inline-flex items-center gap-4 border-b border-border pb-2 font-serif text-xs tracking-[0.2em] text-muted-foreground transition-colors duration-500 hover:border-foreground hover:text-foreground"
          >
            認識我們 
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </div>
      </section>
    </main>
  )
}