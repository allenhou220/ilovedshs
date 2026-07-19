'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 防止 SSR 渲染時出現內容不一致的錯誤
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-7 w-14" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      role="switch"
      aria-checked={isDark}
      aria-label="切換深淺模式"
      className={`group relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-border transition-colors duration-500 ease-out active:scale-95 ${isDark ? 'bg-foreground' : 'bg-muted'}`}
    >
      {/* 軌道兩側的小圖示，隨切換淡入淡出 */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`pointer-events-none absolute left-1.5 size-3.5 text-muted-foreground transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V23M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M1 12h2.25m13.5 0H23M4.22 19.78l1.59-1.59m12.38-12.38l1.59-1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`pointer-events-none absolute right-1.5 size-3.5 text-background/70 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>

      {/* 滑動的圓形把手，位移 + 輕微彈性 easing */}
      <span
        className={`relative inline-flex size-5 items-center justify-center rounded-full bg-background shadow-md transition-transform duration-500 ${isDark ? 'translate-x-8' : 'translate-x-1'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* 把手裡的圖示：交叉淡入 + 旋轉 */}
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          className={`absolute size-3 text-foreground transition-all duration-500 ${isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          className={`absolute size-3 text-primary transition-all duration-500 ${isDark ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V23M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M1 12h2.25m13.5 0H23M4.22 19.78l1.59-1.59m12.38-12.38l1.59-1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
        </svg>
      </span>
    </button>
  )
}