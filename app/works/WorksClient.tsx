'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { WorkCard } from '@/components/work-card'

const PAGE_SIZE = 9

function stripHtml(html: string = '') {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function WorksContent({ dbWorks }: { dbWorks: any[] }) {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')

  const sortedWorks = [...dbWorks].sort((a, b) => {
    const orderA = a.sort_order ?? 999999;
    const orderB = b.sort_order ?? 999999;
    if (orderA !== orderB) return orderA - orderB;
    return (b.id || 0) - (a.id || 0);
  });

  const uniqueIssues = ['全部期數', ...Array.from(new Set(sortedWorks.map(work => work.issue || '第 1 期')))]
  const sources = ['全部來源', '文薈成員創作', '學生投稿']
  
  const defaultCategories = ['散文', '新詩', '小說', '採訪', '漫畫']
  const dbCategories = sortedWorks.map(work => work.category || '散文')
  const uniqueCategories = ['全部類別', ...Array.from(new Set([...defaultCategories, ...dbCategories]))]

  const [selectedIssue, setSelectedIssue] = useState('全部期數')
  const [selectedSource, setSelectedSource] = useState('全部來源')
  const [selectedCategory, setSelectedCategory] = useState('全部類別')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  const filteredWorks = sortedWorks.filter((work) => {
    const workCategory = work.category || '散文'
    const workIssue = work.issue || '第 1 期'
    const workSource = work.source_type || work.sourceType || '文薈成員創作'

    const matchCategory = selectedCategory === '全部類別' || workCategory === selectedCategory
    const matchIssue = selectedIssue === '全部期數' || workIssue === selectedIssue
    const matchSource = selectedSource === '全部來源' || workSource === selectedSource
    
    const cleanContent = stripHtml(work.content || '')
    const lowercaseQuery = searchQuery.toLowerCase().trim()

    const matchSearch = 
      !lowercaseQuery ||
      work.title?.toLowerCase().includes(lowercaseQuery) || 
      work.author?.toLowerCase().includes(lowercaseQuery) || 
      cleanContent.toLowerCase().includes(lowercaseQuery)

    return matchCategory && matchIssue && matchSource && matchSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedIssue, selectedSource, searchQuery])

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
    <main className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      {/* ===== 頂部標題區塊 ===== */}
      <header className="grid gap-10 border-b border-border pb-16 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-muted-foreground">ARCHIVE / 作品典藏</p>
          <h1 className="text-balance font-serif text-5xl font-normal leading-[1.2] tracking-wide md:text-6xl">所有作品</h1>
        </div>
        <p className="max-w-lg text-pretty text-base leading-loose text-muted-foreground font-serif font-light">
          在散文裡辨認日常，在詩裡留下停頓，也在小說中走進另一種可能。這裡收藏我們對校園與成長的不同書寫。
        </p>
      </header>
      
      {/* ===== 雜誌風網格篩選列 ===== */}
      <div className="mt-12 mb-20 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 items-end">
        
        {/* 1. 刊物期數 */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">刊物期數</label>
          <select
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="w-full border-b border-border bg-transparent pb-2 text-sm font-serif text-foreground outline-none cursor-pointer hover:border-foreground transition-colors"
          >
            {uniqueIssues.map((issue) => (
              <option key={issue} value={issue} className="bg-background text-foreground">
                {issue}
              </option>
            ))}
          </select>
        </div>

        {/* 2. 文章來源 */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">文章來源</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full border-b border-border bg-transparent pb-2 text-sm font-serif text-foreground outline-none cursor-pointer hover:border-foreground transition-colors"
          >
            {sources.map((src) => (
              <option key={src} value={src} className="bg-background text-foreground">
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* 3. 文體類別 */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">文體類別</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border-b border-border bg-transparent pb-2 text-sm font-serif text-foreground outline-none cursor-pointer hover:border-foreground transition-colors"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-background text-foreground">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. 關鍵字搜尋 */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">關鍵字搜尋</label>
          <input
            type="text"
            placeholder="搜尋標題、作者、內文..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-b border-border bg-transparent pb-2 text-sm font-serif text-foreground outline-none placeholder:text-muted-foreground/40 hover:border-foreground focus:border-foreground transition-colors"
          />
        </div>
      </div>
      
      {/* ===== 作品卡片區塊 ===== */}
      <section className="grid gap-x-12 gap-y-24 py-8 md:grid-cols-2 lg:grid-cols-3">
        {paginatedWorks.map((work, index) => (
          <WorkCard 
            key={work.id || index} 
            work={{
              ...work,
              content: stripHtml(work.content || '')
            }} 
          />
        ))}
        {filteredWorks.length === 0 && (
          <p className="col-span-full py-24 text-center font-serif text-lg text-muted-foreground tracking-widest">
            目前尚無符合條件的作品。
          </p>
        )}
      </section>

      {/* ===== 分頁導覽 ===== */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-6 border-t border-border pt-16 mt-16" aria-label="分頁導覽">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Prev
          </button>

          <div className="flex items-center gap-4 font-serif text-sm">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative px-1 transition-colors ${
                  currentPage === page
                    ? 'text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:bg-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {page < 10 ? `0${page}` : page}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  )
}

export default function WorksClient({ dbWorks }: { dbWorks: any[] }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-32 text-center font-serif text-muted-foreground">載入作品庫...</div>}>
      <WorksContent dbWorks={dbWorks} />
    </Suspense>
  )
}