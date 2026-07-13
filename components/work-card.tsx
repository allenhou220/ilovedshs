import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Work } from '@/lib/works'

export function WorkCard({ work, featured = false }: { work: Work; featured?: boolean }) {
  return (
    <article className={`group flex flex-col gap-5 ${featured ? 'md:grid md:grid-cols-2 md:items-center md:gap-10' : ''}`}>
      <Link href={`/works/${work.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <Image src={work.image} alt={work.imageAlt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 33vw, 100vw'} />
      </Link>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-xs tracking-[0.18em] text-primary">
          <span>{work.category}</span><span className="h-px w-8 bg-primary" /><span className="text-muted-foreground">{work.author}</span>
        </div>
        <h3 className={`${featured ? 'text-3xl md:text-5xl' : 'text-2xl'} text-balance font-serif font-bold leading-tight`}><Link href={`/works/${work.slug}`} className="transition-colors hover:text-primary">{work.title}</Link></h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{work.excerpt}</p>
        <Link href={`/works/${work.slug}`} className="mt-1 inline-flex w-fit items-center gap-2 text-sm font-medium tracking-wider underline decoration-primary underline-offset-8">閱讀全文 <ArrowUpRight className="size-4" /></Link>
      </div>
    </article>
  )
}
