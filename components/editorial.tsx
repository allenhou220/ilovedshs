import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

// ============================================================
// 東山文薈・共用版面元件（伺服器端，可在任何頁面使用）
// ============================================================

const CN_NUMERALS = ['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾']

/** 1 → 壹、2 → 貳 …… 超過 10 則用阿拉伯數字 */
export function cnNumeral(n: number) {
  return CN_NUMERALS[n - 1] || String(n)
}

/** 印章風格標記：朱紅細框內一個字 */
export function Seal({ children, size = 'md', className = '' }: { children: ReactNode; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const box = size === 'sm' ? 'size-7 text-sm' : size === 'lg' ? 'size-12 text-2xl' : 'size-9 text-base'
  return (
    <span
      aria-hidden="true"
      className={`${box} inline-flex shrink-0 items-center justify-center border-[1.5px] border-primary font-serif font-bold leading-none text-primary ${className}`}
    >
      {children}
    </span>
  )
}

/** 區塊標題：【壹】本期目錄 ———————— 查看全部 → */
export function SectionTitle({
  no,
  title,
  sub,
  link,
  as: Tag = 'h2',
}: {
  no?: number
  title: string
  sub?: string
  link?: { href: string; label: string }
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-foreground pb-3 md:mb-10">
      <div className="flex items-baseline gap-4">
        <Tag className={`${Tag === 'h1' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-[1.75rem]'} font-serif font-bold leading-tight tracking-[0.06em]`}>
          {title}
        </Tag>
        {sub && <p className="font-serif text-sm text-muted-foreground">{sub}</p>}
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex min-h-11 items-center gap-2 font-serif text-sm text-muted-foreground transition-colors hover:text-primary">
          {link.label}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  )
}

/** 頁面標題（各列表頁頂端） */
export function PageHeading({ title, lead, mark }: { title: string; lead?: ReactNode; mark: string }) {
  return (
    <header className="mb-10 flex flex-col gap-4 border-b border-foreground pb-8 md:mb-14">
      <h1 className="font-serif text-4xl font-bold tracking-[0.06em] md:text-6xl" data-mark={mark}>{title}</h1>
      {lead && <div className="max-w-2xl font-serif text-[15px] leading-[1.9] text-muted-foreground">{lead}</div>}
    </header>
  )
}

/**
 * 稿紙標題：把文字一字一格填進朱紅方格，由右往左直排。
 * 以「換行」分欄，例如「在鐘聲\n停下以前」→ 兩欄。
 */
export function ManuscriptTitle({ text, className = '', as: Tag = 'h1' }: { text: string; className?: string; as?: 'h1' | 'h2' | 'p' }) {
  const lines = String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 6)
  const longest = Math.max(3, ...lines.map((l) => Array.from(l).length))
  // 字級依最長一行自動縮放，長標題也不會撐破版面
  const sizeLg = Math.max(34, Math.min(76, Math.floor(540 / longest)))
  const sizeSm = Math.max(26, Math.min(46, Math.floor(320 / longest)))
  const style = { '--t-lg': `${sizeLg}px`, '--t-sm': `${sizeSm}px` } as CSSProperties

  return (
    <Tag
      style={style}
      className={`flex flex-col font-serif font-bold leading-[1.25] tracking-[0.04em] text-foreground [--t:var(--t-sm)] md:[--t:var(--t-lg)] ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} className="block" style={{ fontSize: 'var(--t)' }}>
          {line}
        </span>
      ))}
    </Tag>
  )
}

/** 期刊封面：有上傳圖片就用圖片，沒有就自動排一張稿紙文字封面 */
export function IssueCover({
  name,
  theme,
  image,
  className = '',
  large = false,
}: {
  name: string
  theme?: string
  image?: string
  className?: string
  large?: boolean
}) {
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-muted ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${name} 封面`} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute bottom-0 left-0 bg-background px-3 py-1.5 font-serif text-sm font-bold tracking-[0.15em]">{name}</span>
      </div>
    )
  }
  return (
    <div className={`relative flex flex-col justify-between overflow-hidden bg-secondary p-[9%] ${className}`}>
      <span className={`font-serif font-bold tracking-[0.1em] text-primary ${large ? 'text-base' : 'text-xs'}`}>東山文薈</span>
      {theme && <span className={`font-serif font-bold leading-snug ${large ? 'text-3xl' : 'text-lg md:text-xl'}`}>{theme}</span>}
      <span className={`font-serif text-muted-foreground ${large ? 'text-base' : 'text-xs'}`}>{name}</span>
    </div>
  )
}

/** 沒有圖片的文章卡片：稿紙底，直排顯示文體 */
export function WorkPlaceholder({ category, title }: { category: string; title: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary">
      <span className="font-serif text-xl font-bold tracking-[0.2em] text-foreground/35">{category}</span>
      <span className="sr-only">{title}</span>
    </div>
  )
}
