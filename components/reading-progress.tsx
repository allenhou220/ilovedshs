'use client'

import { useEffect, useState } from 'react'

// 頁面最上方的閱讀進度條：依照文章區塊捲動到哪裡計算
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = document.getElementById(targetId)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const passed = -rect.top
      const value = total <= 0 ? (rect.top <= 0 ? 100 : 0) : (passed / total) * 100
      setProgress(Math.max(0, Math.min(100, value)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [targetId])

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[3px]"
      role="progressbar"
      aria-label="閱讀進度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className="h-full bg-primary transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
    </div>
  )
}
