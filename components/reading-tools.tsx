'use client'

import { useEffect, useState } from 'react'
import { Link2, Check, Share2 } from 'lucide-react'

// 字級選項
const SIZES = [
  { id: 's', label: '小字', px: 16, glyph: 'text-[13px]' },
  { id: 'm', label: '標準字級', px: 18, glyph: 'text-[16px]' },
  { id: 'l', label: '大字', px: 21, glyph: 'text-[19px]' },
] as const

type SizeId = (typeof SIZES)[number]['id']
type Layout = 'h' | 'v'
// 把讀者選的字級與排版記在瀏覽器，下次閱讀沿用
const STORAGE_KEY = 'wenhui-article-size'
const LAYOUT_KEY = 'wenhui-article-layout'

// 直排／橫排：切換內文容器的排版方式（直排時由右往左捲動）
// 切換橫排／直排：直接改文章容器的樣式
function applyLayout(layout: Layout, targetId: string) {
  const el = document.getElementById(targetId)
  if (!el) return
  el.classList.toggle('article-vertical', layout === 'v')
  if (layout === 'v') el.scrollLeft = el.scrollWidth // 從最右邊（開頭）開始讀
}

// 套用字級到文章容器
function applySize(id: SizeId) {
  const size = SIZES.find((s) => s.id === id) || SIZES[1]
  document.documentElement.style.setProperty('--article-size', `${size.px}px`)
}

// 文章工具列：調整字級（會記住偏好）、分享
export function ReadingTools({ title, targetId = 'article-text', allowVertical = true }: { title: string; targetId?: string; allowVertical?: boolean }) {
  const [size, setSize] = useState<SizeId>('m')
  const [layout, setLayout] = useState<Layout>('h')
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = window.localStorage.getItem(STORAGE_KEY)
    } catch {}
    const initial = (SIZES.some((s) => s.id === saved) ? saved : 'm') as SizeId
    setSize(initial)
    applySize(initial)
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    if (allowVertical) {
      let savedLayout: string | null = null
      try {
        savedLayout = window.localStorage.getItem(LAYOUT_KEY)
      } catch {}
      const initialLayout: Layout = savedLayout === 'v' ? 'v' : 'h'
      setLayout(initialLayout)
      applyLayout(initialLayout, targetId)
    }
  }, [allowVertical, targetId])

  const chooseLayout = (next: Layout) => {
    setLayout(next)
    applyLayout(next, targetId)
    try {
      window.localStorage.setItem(LAYOUT_KEY, next)
    } catch {}
  }

  const choose = (id: SizeId) => {
    setSize(id)
    applySize(id)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {}
  }

  const pageUrl = () => window.location.href

  // 複製文章連結；不支援剪貼簿時退而使用舊方式
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('請複製這個連結：', pageUrl())
    }
  }

  const openShare = (base: string) => {
    window.open(base + encodeURIComponent(pageUrl()), '_blank', 'noopener,noreferrer,width=600,height=560')
  }

  const iconButton = 'flex size-11 items-center justify-center text-foreground transition-colors hover:text-primary'
  const textButton = 'flex h-11 min-w-11 items-center justify-center px-1.5 font-sans text-xs font-semibold text-foreground transition-colors hover:text-primary'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-1.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      {allowVertical && (
        <div role="group" aria-label="排版方向" className="flex items-center gap-1">
          <span className="mr-1.5 font-serif text-xs tracking-[0.15em] text-muted-foreground">排版</span>
          {([['h', '橫排'], ['v', '直排']] as const).map(([id, label]) => {
            const active = layout === id
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => chooseLayout(id)}
                className={`flex h-11 items-center border px-3 font-serif text-sm tracking-[0.15em] transition-colors ${
                  active ? 'border-foreground bg-foreground text-background' : 'border-transparent text-foreground hover:border-border'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
      <div role="group" aria-label="字級" className="flex items-center gap-1">
        <span className="mr-1.5 font-serif text-xs tracking-[0.15em] text-muted-foreground">字級</span>
        {SIZES.map((s) => {
          const active = size === s.id
          return (
            <button
              key={s.id}
              type="button"
              aria-label={s.label}
              aria-pressed={active}
              onClick={() => choose(s.id)}
              className={`flex size-11 items-center justify-center border font-serif transition-colors ${s.glyph} ${
                active ? 'border-foreground bg-foreground text-background' : 'border-transparent text-foreground hover:border-border'
              }`}
            >
              A
            </button>
          )
        })}
      </div>
      </div>

      <div className="flex items-center gap-0.5">
        <span className="mr-1.5 font-serif text-xs tracking-[0.15em] text-muted-foreground">分享</span>
        {canNativeShare && (
          <button
            type="button"
            className={iconButton}
            aria-label="分享"
            onClick={() => navigator.share({ title, url: pageUrl() }).catch(() => {})}
          >
            <Share2 className="size-[18px]" strokeWidth={1.6} />
          </button>
        )}
        <button type="button" className={iconButton} aria-label={copied ? '已複製連結' : '複製連結'} onClick={copyLink}>
          {copied ? <Check className="size-[18px] text-primary" strokeWidth={2} /> : <Link2 className="size-[18px]" strokeWidth={1.6} />}
        </button>
        <button type="button" className={textButton} aria-label="分享到 LINE" onClick={() => openShare('https://social-plugins.line.me/lineit/share?url=')}>
          LINE
        </button>
        <button type="button" className={textButton} aria-label="分享到 Facebook" onClick={() => openShare('https://www.facebook.com/sharer/sharer.php?u=')}>
          FB
        </button>
        <span aria-live="polite" className="sr-only">{copied ? '已複製連結' : ''}</span>
      </div>
    </div>
  )
}
