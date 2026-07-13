import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getWork, works } from '@/lib/works'

export function generateStaticParams() { 
  return works.map((work) => ({ slug: work.slug })) 
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const work = getWork(slug)
  return work ? { title: work.title, description: work.excerpt } : {}
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()
  
  const index = works.findIndex((item) => item.slug === slug)
  const previous = index > 0 ? works[index - 1] : null
  const next = index < works.length - 1 ? works[index + 1] : null
  const isPoetry = work.category === '新詩'

  return (
    <main>
      <article>
        <header className="mx-auto max-w-5xl px-5 pb-14 pt-16 text-center md:px-8 md:pb-20 md:pt-24">
          <Link href="/works" className="mb-12 inline-flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> 返回作品總覽
          </Link>
          <p className="mb-6 text-sm tracking-[0.25em] text-primary">{work.category}・{work.issue}</p>
          <h1 className="text-balance font-serif text-5xl font-black leading-tight md:text-7xl">{work.title}</h1>
          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <span>{work.author}</span>
            <span className="h-px w-8 bg-border" />
            <span className="text-muted-foreground">{work.grade}</span>
          </div>
        </header>
        
        {/* 改為 object-cover，這樣就會跟外面列表頁一樣，滿格填滿、裁切掉下半部、左右不留白 */}
        <div className="relative mx-auto aspect-[4/3] max-w-2xl overflow-hidden bg-muted/40 rounded-lg shadow-sm">
          <Image 
            src={work.image} 
            alt={work.imageAlt} 
            fill 
            priority 
            className="object-cover" 
            sizes="(min-width: 768px) 672px, 100vw" 
          />
        </div>
        
        <div className={`mx-auto px-5 py-16 md:py-24 ${isPoetry ? 'max-w-2xl' : 'max-w-3xl'}`}>
          <p className="mb-12 border-l-2 border-primary pl-6 font-serif text-xl font-bold leading-loose text-muted-foreground">{work.excerpt}</p>
          <div className={`flex flex-col font-serif text-lg leading-[2.15] md:text-xl ${isPoetry ? 'gap-8 text-center' : 'gap-8'}`}>
            {work.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          </div>
          <aside className="mt-20 border-y border-border py-8">
            <p className="mb-3 text-xs tracking-[0.2em] text-primary">ABOUT THE AUTHOR</p>
            <p className="font-serif text-xl font-bold">{work.author}・{work.grade}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">喜歡在放學後散步，也喜歡記下那些看似沒有結局的對話。相信寫作是一種慢慢認識自己的方式。</p>
          </aside>
        </div>
      </article>
      
      <nav className="grid border-t border-border md:grid-cols-2" aria-label="文章前後篇">
        {previous ? (
          <Link href={`/works/${previous.slug}`} className="group flex min-h-40 flex-col justify-center gap-3 border-b border-border px-8 transition-colors hover:bg-card md:border-b-0 md:border-r">
            <span className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground">
              <ArrowLeft className="size-4" /> 上一篇
            </span>
            <span className="font-serif text-2xl font-bold">{previous.title}</span>
          </Link>
        ) : (
          <div className="flex min-h-40 flex-col justify-center border-b border-border px-8 text-muted-foreground/40 md:border-b-0 md:border-r font-serif text-xl bg-muted/5">
            這是第一篇
          </div>
        )}

        {next ? (
          <Link href={`/works/${next.slug}`} className="group flex min-h-40 flex-col items-end justify-center gap-3 px-8 text-right transition-colors hover:bg-card">
            <span className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground">
              下一篇 <ArrowRight className="size-4" />
            </span>
            <span className="font-serif text-2xl font-bold">{next.title}</span>
          </Link>
        ) : (
          <div className="flex min-h-40 flex-col items-end justify-center px-8 text-right text-muted-foreground/40 font-serif text-xl bg-muted/5">
            已是最後一篇
          </div>
        )}
      </nav>
    </main>
  )
}