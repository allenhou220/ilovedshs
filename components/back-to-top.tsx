'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // 監聽滾動事件
  useEffect(() => {
    const toggleVisibility = () => {
      // 當網頁向下滑動超過 500px 時才顯示按鈕
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // 節流處理 (簡單版)：避免頻繁觸發影響效能
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(toggleVisibility, 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  // 平滑滾動到頂部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // 💡 CSS 與原生 JS 雙重保證平滑滾動
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="回到最上方"
      /* 💡 包含 iOS 底部安全距離 (safe-area-inset-bottom) 防誤觸 */
      className={`fixed right-5 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 flex size-11 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground shadow-sm backdrop-blur-md transition-all duration-500 hover:bg-muted hover:text-foreground active:scale-90 md:right-8 md:size-12 md:bottom-8
        ${isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'}
      `}
    >
      <ArrowUp className="size-5" strokeWidth={1.5} />
    </button>
  )
}