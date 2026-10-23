import Link from 'next/link'
import { authorHref, isPublicAuthor, workHref } from '@/lib/text'
import { WorkPlaceholder } from '@/components/editorial'

type CardWork = {
  id: number
  title: string
  author?: string
  category?: string
  issue?: string
  source_type?: string
  sourceType?: string
  image_url?: string
  excerpt?: string
  content?: string
  readLabel?: string
}

export function WorkCard({ work, featured = false }: { work: CardWork; featured?: boolean }) {
  const href = workHref(work)
  const excerpt = work.excerpt ?? work.content ?? ''
  const isStudent = (work.source_type || work.sourceType) === '學生投稿'
  const author = work.author || '匿名'
  const category = work.category || '散文'

  const image = (
    <Link
      href={href}
      tabIndex={-1}
      aria-hidden="true"
      className={`relative block overflow-hidden border border-foreground/15 ${featured ? 'aspect-[4/3] md:aspect-[5/4]' : 'aspect-[4/3]'}`}
    >
      {work.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={work.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      ) : (
        <WorkPlaceholder category={category} title={work.title} />
      )}
    </Link>
  )

  const meta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-[13px] tracking-[0.2em]">
      <span className="font-bold text-primary">{category}</span>
      <span aria-hidden="true" className="h-3 w-px bg-border" />
      <span className="text-muted-foreground">{isStudent ? '學生投稿' : work.issue || '文薈'}</span>
      {work.readLabel && (
        <>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <span className="text-muted-foreground">{work.readLabel}</span>
        </>
      )}
    </p>
  )

  const byline = isPublicAuthor(author) ? (
    <Link href={authorHref(author)} className="font-serif text-sm tracking-[0.2em] text-foreground transition-colors hover:text-primary">
      文／{author}
    </Link>
  ) : (
    <span className="font-serif text-sm tracking-[0.2em] text-muted-foreground">文／匿名</span>
  )

  if (featured) {
    return (
      <article className="group grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-14">
        {image}
        <div className="flex flex-col gap-5">
          {meta}
          <h3 className="text-balance font-serif text-3xl font-bold leading-[1.4] tracking-[0.08em] md:text-[2.6rem]">
            <Link href={href} className="transition-colors hover:text-primary">
              {work.title}
            </Link>
          </h3>
          {excerpt && (
            <p className="line-clamp-5 border-l-2 border-primary pl-5 font-serif text-[17px] leading-[2.05] text-foreground/80">{excerpt}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            {byline}
            <Link
              href={href}
              className="inline-flex min-h-11 items-center gap-2 bg-foreground px-5 font-serif text-sm tracking-[0.1em] text-background transition-opacity hover:opacity-90"
            >
              閱讀全文 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex flex-col gap-4">
      {image}
      {meta}
      <h3 className="text-balance font-serif text-[1.35rem] font-bold leading-[1.45] tracking-[0.06em]">
        <Link href={href} className="transition-colors hover:text-primary">
          {work.title}
        </Link>
      </h3>
      {excerpt && <p className="line-clamp-3 font-serif text-[15px] leading-[1.95] text-muted-foreground">{excerpt}</p>}
      <div className="mt-auto pt-1">{byline}</div>
    </article>
  )
}
