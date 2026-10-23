'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// 頁面發生錯誤（例如資料庫暫時連不上）時顯示，而不是整頁空白
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 px-5 py-24 text-center">
      <h1 className="font-serif text-4xl font-bold leading-[1.4] tracking-[0.12em] md:text-5xl">頁面暫時無法顯示</h1>
      <p className="max-w-md font-serif text-base leading-[2] text-muted-foreground">
        可能是網路或伺服器忙碌中，請稍後再試一次。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center bg-foreground px-6 font-serif text-sm tracking-[0.2em] text-background transition-opacity hover:opacity-90"
        >
          重新載入
        </button>
        <Link href="/" className="inline-flex min-h-12 items-center border border-foreground px-6 font-serif text-sm tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background">
          回到首頁
        </Link>
      </div>
    </main>
  )
}
