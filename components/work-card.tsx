import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function WorkCard({ work, featured = false }: { work: any; featured?: boolean }) {
  // 💡 將原本的 work.id 改為編碼後的 work.title (若無標題則退回 work.id)
  const targetLink = `/works/${encodeURIComponent(work.title || work.id)}`

  const displayImage = work.image_url || work.image
  const displayContent = work.excerpt || work.content || ''
  const altText = work.imageAlt || work.title || '文章圖片'

  const issue = work.issue || ''
  const sourceType = work.source_type || work.sourceType || '文薈成員創作'
  const isStudent = sourceType === '學生投稿'

  return (
    <article className={`group flex flex-col gap-6 md:gap-8 ${featured ? 'md:grid md:grid-cols-2 md:items-center md:gap-16' : ''}`}>

      {/* 圖片區塊 */}
      <Link href={targetLink} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {displayImage ? (
          <img
            src={displayImage}
            alt={altText}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xs tracking-widest text-muted-foreground font-serif border border-border">
            無圖片
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-4">
        {/* 分類與作者標籤 */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.2em] text-muted-foreground">
          {isStudent ? (
            <span className="border border-border px-2 py-1 text-muted-foreground">
              學生投稿
            </span>
          ) : (
            issue && <span className="font-medium text-muted-foreground">{issue}</span>
          )}

          <span className="text-muted-foreground/50">/</span>
          <span>{work.category || '散文'}</span>
          <span className="h-[1px] w-6 bg-border" />
          <span className="tracking-widest text-foreground/80">{work.author || '匿名'}</span>
        </div>

        {/* 標題 */}
        <h3 className={`${featured ? 'text-4xl md:text-[2.75rem]' : 'text-2xl'} text-balance font-serif font-normal leading-[1.35] text-foreground transition-colors duration-500 group-hover:text-primary`}>
          <Link href={targetLink} className="block">
            {work.title}
          </Link>
        </h3>

        {/* 內文摘要 */}
        <p className="line-clamp-3 text-pretty text-sm leading-[1.8] text-muted-foreground">
          {displayContent}
        </p>

        {/* 閱讀全文按鈕 */}
        <Link
          href={targetLink}
          className="mt-2 inline-flex w-fit items-center gap-2 border-b border-border pb-1 text-xs font-medium tracking-[0.2em] text-muted-foreground transition-all duration-500 hover:border-foreground hover:text-foreground"
        >
          閱讀全文 
          <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}