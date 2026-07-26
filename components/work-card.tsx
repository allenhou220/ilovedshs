import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function WorkCard({ work, featured = false }: { work: any; featured?: boolean }) {

  // 正確的文章連結：使用資料庫的 id（必須轉成字串）
  const targetLink = `/works/${work.id.toString()}`

  // 讀取資料庫的圖片欄位（image_url）
  const displayImage = work.image_url || work.image

  // 讀取摘要（excerpt）或 content
  const displayContent = work.excerpt || work.content || ''

  const altText = work.imageAlt || work.title || '文章圖片'

  return (
    <article className={`group flex flex-col gap-5 ${featured ? 'md:grid md:grid-cols-2 md:items-center md:gap-10' : ''}`}>

      <Link href={targetLink} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {displayImage ? (
          <img
            src={displayImage}
            alt={altText}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground font-serif">
            無圖片
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-xs tracking-[0.18em] text-primary">
          <span>{work.category || '散文'}</span>
          <span className="h-px w-8 bg-primary" />
          <span className="text-muted-foreground">{work.author || '匿名'}</span>
        </div>

        <h3 className={`${featured ? 'text-3xl md:text-5xl' : 'text-2xl'} text-balance font-serif font-bold leading-tight`}>
          <Link href={targetLink} className="transition-colors hover:text-primary">
            {work.title}
          </Link>
        </h3>

        <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          {displayContent}
        </p>

        <Link
          href={targetLink}
          className="mt-1 inline-flex w-fit items-center gap-2 text-sm font-medium tracking-wider underline decoration-primary underline-offset-8"
        >
          閱讀全文 <ArrowUpRight className="size-4" />
        </Link>
      </div>

    </article>
  )
}

