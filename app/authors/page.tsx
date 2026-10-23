import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthors } from '@/lib/queries'
import { authorHref } from '@/lib/text'
import { PageHeading } from '@/components/editorial'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '作者',
  description: '在東山文薈發表過作品的作者。',
}

export default async function AuthorsPage() {
  const authors = await getAuthors()

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <PageHeading mark="作" title="作者群像" lead={`共 ${authors.length} 位作者。`} />

      {authors.length === 0 ? (
        <p className="py-20 text-center font-serif text-muted-foreground">目前還沒有公開署名的作品。</p>
      ) : (
        <ul className="grid grid-cols-2 gap-px border border-foreground/20 bg-foreground/20 sm:grid-cols-3 lg:grid-cols-5">
          {authors.map((a) => (
            <li key={a.name} className="bg-background">
              <Link href={authorHref(a.name)} className="group flex h-full min-h-36 flex-col justify-between gap-6 p-5 transition-colors hover:bg-card">
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 items-center justify-center border-[1.5px] border-primary font-serif text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  {Array.from(a.name)[0]}
                </span>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-lg font-bold tracking-[0.2em]">{a.name}</span>
                  <span className="font-serif text-xs tracking-[0.1em] text-muted-foreground">{a.count} 篇</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
