'use client'

import { useState } from 'react'
import { WorkCard } from '@/components/work-card'
import { categories, works } from '@/lib/works'

export default function WorkPage() {
  // 預設選擇「全部」
  const [activeCategory, setActiveCategory] = useState('全部')
  // 儲存搜尋關鍵字的狀態
  const [searchQuery, setSearchQuery] = useState('')

  // 根據點選的分類與搜尋關鍵字雙重過濾作品
  const filteredWorks = works.filter((work) => {
    // 1. 檢查分類是否符合
    const matchCategory = activeCategory === '全部' || work.category === activeCategory
    
    // 2. 多欄位關鍵字搜尋（轉成小寫比對，避免大小寫差異）
    const lowercaseQuery = searchQuery.toLowerCase()
    
    const matchSearch = 
      // 比對標題
      work.title?.toLowerCase().includes(lowercaseQuery) || 
      // 比對作者
      work.author?.toLowerCase().includes(lowercaseQuery) || 
      // 比對簡介
      work.description?.toLowerCase().includes(lowercaseQuery) || 
      false

    // 必須同時符合分類與關鍵字
    return matchCategory && matchSearch
  })

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <header className="grid gap-8 border-b border-foreground pb-12 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="mb-4 text-xs tracking-[0.22em] text-primary">ARCHIVE / 作品典藏</p>
          <h1 className="text-balance font-serif text-5xl font-black leading-tight md:text-7xl">所有作品</h1>
        </div>
        <p className="max-w-lg text-pretty font-serif text-lg leading-loose text-muted-foreground md:text-xl">
          在散文裡辨認日常，在詩裡留下停頓，也在小說中走進另一種可能。這裡收藏我們對校園與成長的不同書寫。
        </p>
      </header>
      
      {/* 分類按鈕選單與搜尋框區塊 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border py-7">
        
        {/* 分類按鈕 */}
        <nav className="flex flex-wrap gap-3" aria-label="作品分類">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`border px-5 py-2 text-sm transition-colors font-serif rounded-sm ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* 搜尋輸入框（支援標題、作者） */}
        <div className="w-full md:w-64 shrink-0">
          <input
            type="text"
            placeholder="搜尋標題、作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-border px-4 py-2 text-sm rounded-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-serif transition-colors"
          />
        </div>
      </div>
      
      {/* 作品九宮格列表 */}
      <section className="grid gap-x-8 gap-y-16 py-14 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorks.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
        {filteredWorks.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground font-serif">
            目前尚無符合條件的作品
          </p>
        )}
      </section>
    </main>
  )
}