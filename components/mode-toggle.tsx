'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-7 w-14" />

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? 'light' : 'dark'

    if (!document.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme)
      })
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 850, // 💡 放慢全站圓形波浪擴散速度：從 500ms 延長至 850ms
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      )
    })
  }

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="切換深淺模式"
      style={{ viewTransitionName: 'none' }}
      className={`group relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border border-border/80 transition-colors duration-700 focus:outline-none active:scale-95 ${
        isDark ? 'bg-foreground' : 'bg-muted'
      }`}
    >
      {/* 太陽背景圖示 */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`pointer-events-none absolute left-1.5 size-3.5 text-muted-foreground transition-opacity duration-700 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V23M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M1 12h2.25m13.5 0H23M4.22 19.78l1.59-1.59m12.38-12.38l1.59-1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
      </svg>

      {/* 月亮背景圖示 */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`pointer-events-none absolute right-1.5 size-3.5 text-background/70 transition-opacity duration-700 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>

      {/* 💡 放慢拉桿滑動速度：採用 duration-700 與平緩彈性曲線 */}
      <span
        className={`relative inline-flex size-5 items-center justify-center rounded-full bg-background shadow-md transition-transform duration-700 ${
          isDark ? 'translate-x-8' : 'translate-x-1'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.2, 0.64, 1)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          className={`absolute size-3 text-foreground transition-all duration-700 ${isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          className={`absolute size-3 text-primary transition-all duration-700 ${isDark ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V23M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M1 12h2.25m13.5 0H23M4.22 19.78l1.59-1.59m12.38-12.38l1.59-1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
        </svg>
      </span>
    </button>
  )
}