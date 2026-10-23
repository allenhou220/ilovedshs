import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIssue, getIssues } from '@/lib/queries'
import { issueHref, workHref } from '@/lib/text'
import { IssueCover, cnNumeral } from '@/components/editorial'

export const dynamic = 'force-dynamic'

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const issueName = safeDecode(name)
  return { title: issueName, description: `東山文薈 ${issueName} 目錄` }
}

export default async function IssuePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const issueName = safeDecode(name)

  const [issue, allIssues] = await Promise.all([getIssue(issueName), getIssues()])
  if (!issue) notFound()

  let counter = 0

  return (
    <main className="flush-footer">
      {/* ===== 期數切換 ===== */}
      <div className="border-b border-border">
        <nav aria-label="選擇期數" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 md:px-8">
          {allIssues.map((i) => {
            const active = i.name === issue.name
            return (
              <Link
                key={i.name}
                href={issueHref(i.name)}
                aria-current={active ? 'page' : undefined}
                className={`-mb-px inline-flex min-h-14 items-center whitespace-nowrap border-b-[3px] px-4 font-serif text-sm tracking-[0.2em] transition-colors ${
                  active ? 'border-primary font-bold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {i.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ===== 封面與卷首語 ===== */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16 md:px-8 md:py-20">
        <IssueCover name={issue.name} theme={issue.theme} image={issue.cover_image_url} className="aspect-[3/4] w-full max-w-[340px]" large />

        <div className="flex flex-col gap-7">
          <p className="font-serif text-sm font-bold tracking-[0.1em] text-primary">
            卷首語
          </p>
          <h1 className="font-serif text-4xl font-bold leading-[1.4] tracking-[0.15em] md:text-5xl">
            {issue.theme || issue.name}
          </h1>
          {issue.theme && <p className="-mt-3 font-serif text-base tracking-[0.1em] text-muted-foreground">{issue.name}</p>}
          {issue.editor_note ? (
            <div className="max-w-2xl whitespace-pre-line border-l-2 border-primary pl-6 font-serif text-[17px] leading-[2.1] text-foreground/85">
              {issue.editor_note}
            </div>
          ) : (
            <p className="font-serif text-base leading-[2.1] text-muted-foreground">本期收錄的作品如下，歡迎翻閱。</p>
          )}
          <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6">
            <div className="flex flex-col-reverse gap-1">
              <dt className="font-serif text-xs tracking-[0.12em] text-muted-foreground">收錄作品</dt>
              <dd className="font-serif text-3xl font-bold">{issue.works.length}</dd>
            </div>
            {issue.authorCount > 0 && (
              <div className="flex flex-col-reverse gap-1">
                <dt className="font-serif text-xs tracking-[0.12em] text-muted-foreground">作者</dt>
                <dd className="font-serif text-3xl font-bold">{issue.authorCount}</dd>
              </div>
            )}
            {issue.editors && (
              <div className="flex flex-col-reverse gap-1">
                <dt className="font-serif text-xs tracking-[0.12em] text-muted-foreground">編輯</dt>
                <dd className="pt-2 font-serif text-base">{issue.editors}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* ===== 目錄 ===== */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="mb-12 font-serif text-3xl font-bold tracking-[0.1em]">目錄</h2>
          <div className="flex flex-col gap-14">
            {issue.grouped.map((group, gi) => (
              <div key={group.category} className="grid gap-4 md:grid-cols-[7rem_1fr] md:gap-10">
                <div className="flex items-baseline gap-3 border-t-2 border-foreground pt-3 md:flex-col md:gap-1">
                  <span className="font-serif text-sm text-primary">{cnNumeral(gi + 1)}</span>
                  <span className="font-serif text-xl font-bold tracking-[0.12em]">{group.category}</span>
                </div>
                <ol className="border-t border-foreground">
                  {group.items.map((w) => {
                    counter += 1
                    return (
                      <li key={w.id} className="border-b border-foreground/20">
                        <Link href={workHref(w)} className="group flex items-baseline gap-4 py-4">
                          <span className="w-7 shrink-0 font-serif text-sm text-muted-foreground">{String(counter).padStart(2, '0')}</span>
                          <span className="font-serif text-lg font-bold tracking-[0.06em] transition-colors group-hover:text-primary">{w.title}</span>
                          <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-5px] border-b border-dotted border-foreground/40" />
                          <span className="shrink-0 font-serif text-sm tracking-[0.2em] text-foreground/80">{w.author}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
