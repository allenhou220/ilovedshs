'use client'

import { useEffect, useState } from 'react'
import { WorkCard } from '@/components/work-card'

const PAGE_SIZE = 9

// 接收從 Server Component 傳來的資料庫文章
export default function WorksClient({ dbWorks }: { dbWorks: any[] }) {
  // 動態從資料庫文章中抓出所有不重複的分類，並加上「全部」
  const uniqueCategories = Array.from(new Set(dbWorks.map(work => work.category || '散文')))
  const categories = ['全部', ...uniqueCategories]

  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredWorks = dbWorks.filter((work) => {
    const workCategory = work.category || '散文'
    const matchCategory = activeCategory === '全部' || workCategory === activeCategory
    
    const lowercaseQuery = searchQuery.toLowerCase()
    const matchSearch = 
      work.title?.toLowerCase().includes(lowercaseQuery) || 
      work.author?.toLowerCase().includes(lowercaseQuery) || 
      // 改用資料庫的 content 欄位來進行內文搜尋
      work.content?.toLowerCase().includes(lowercaseQuery) || 
      false

    return matchCategory && matchSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE))
  const paginatedWorks = filteredWorks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border py-7">
        <nav className="flex flex-wrap gap-3" aria-label="作品分類">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as string)}
              className={`border px-5 py-2 text-sm transition-colors font-serif rounded-sm ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              {category as string}
            </button>
          ))}
        </nav>

        <div className="w-full md:w-64 shrink-0">
          <input
            type="text"
            placeholder="搜尋標題、作者、內文..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-border px-4 py-2 text-sm rounded-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-serif transition-colors"
          />
        </div>
      </div>
      
      <section className="grid gap-x-8 gap-y-16 py-14 md:grid-cols-2 lg:grid-cols-3">
        {paginatedWorks.map((work, index) => (
          // 使用資料庫的 id 當 key，如果沒有 id 就暫時用 index
          <WorkCard key={work.id || index} work={work} />
        ))}
        {filteredWorks.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground font-serif">
            目前尚無符合條件的作品
          </p>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 border-t border-border pt-10" aria-label="分頁導覽">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="border border-border px-4 py-2 text-sm font-serif rounded-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            上一頁
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`size-10 text-sm font-serif rounded-sm border transition-colors ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border border-border px-4 py-2 text-sm font-serif rounded-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            下一頁
          </button>
        </nav>
      )}
    </main>
  )
}