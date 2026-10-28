import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WorkCard } from '@/components/work-card'
import { getAuthor } from '@/lib/queries'
import { issueHref } from '@/lib/text'

export const dynamic = 'force-dynamic'

// 網址參數解碼；格式錯誤時不要丟出例外，直接用原字串
function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const author = safeDecode(name)
  return { title: author, description: `${author} 在東山文薈發表的作品` }
}

// 單一作者頁：列出該作者的所有作品
export default async function AuthorPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const author = await getAuthor(safeDecode(name))
  if (!author) notFound()

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <Link href="/authors" className="mb-10 inline-flex min-h-11 items-center font-serif text-sm tracking-[0.1em] text-muted-foreground transition-colors hover:text-primary">
        ← 作者群像
      </Link>

      <header className="mb-14 grid gap-8 border-b-2 border-foreground pb-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-5xl font-bold tracking-[0.12em] md:text-6xl">{author.name}</h1>
        </div>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <div className="flex flex-col-reverse gap-1">
            <dt className="font-serif text-xs tracking-[0.12em] text-muted-foreground">發表作品</dt>
            <dd className="font-serif text-3xl font-bold">{author.works.length}</dd>
          </div>
          <div className="flex flex-col-reverse gap-1">
            <dt className="font-serif text-xs tracking-[0.12em] text-muted-foreground">文體</dt>
            <dd className="pt-2 font-serif text-lg tracking-[0.1em]">{author.categories.join('・')}</dd>
          </div>
          {author.issues.length > 0 && (
            <div className="flex flex-col-reverse gap-1">
              <dt className="font-serif text-xs tracking-[0.12em] text-muted-foreground">刊登於</dt>
              <dd className="flex flex-wrap gap-x-2 pt-2 font-serif text-lg">
                {author.issues.map((i, idx) => (
                  <span key={i}>
                    <Link href={issueHref(i)} className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-primary">{i}</Link>
                    {idx < author.issues.length - 1 && <span aria-hidden="true">、</span>}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </header>

      <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {author.works.map((w) => (
          <WorkCard key={w.id} work={w} />
        ))}
      </div>
    </main>
  )
}
