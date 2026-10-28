'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { WorkCard } from '@/components/work-card'
import { PageHeading } from '@/components/editorial'
import { Search, X, RotateCcw } from 'lucide-react'

// 每頁顯示 9 篇；篩選選項的預設值
const PAGE_SIZE = 9
const SOURCES = ['全部來源', '文薈成員創作', '學生投稿']
const DEFAULT_CATEGORIES = ['散文', '新詩', '小說', '採訪', '漫畫']

function WorksContent({ dbWorks }: { dbWorks: any[] }) {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const queryFromUrl = searchParams.get('q') || ''
  const focusSearch = searchParams.get('focus') === 'search'
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 伺服器端已經依照後台設定的順序排好，這裡不用再排序
  const sortedWorks = dbWorks

  // 下拉選單的選項：由現有文章自動整理（期數、文體），文體另外保留預設五種
  const uniqueIssues = useMemo(
    () => ['全部期數', ...Array.from(new Set(sortedWorks.map(work => work.issue || '第 1 期')))],
    [sortedWorks]
  )
  const sources = SOURCES
  const uniqueCategories = useMemo(
    () => ['全部類別', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...sortedWorks.map(work => work.category || '散文')]))],
    [sortedWorks]
  )

  // 目前的篩選條件與頁碼
  const [selectedIssue, setSelectedIssue] = useState('全部期數')
  const [selectedSource, setSelectedSource] = useState('全部來源')
  const [selectedCategory, setSelectedCategory] = useState('全部類別')
  const [searchQuery, setSearchQuery] = useState(queryFromUrl)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  // 從頁首的搜尋按鈕進來時，自動把游標放進搜尋框
  useEffect(() => {
    if (focusSearch) searchInputRef.current?.focus()
  }, [focusSearch])

  // 依四個條件（期數、來源、文體、關鍵字）過濾；關鍵字會比對標題、作者與全文
  const filteredWorks = sortedWorks.filter((work) => {
    const workCategory = work.category || '散文'
    const workIssue = work.issue || '第 1 期'
    const workSource = work.source_type || work.sourceType || '文薈成員創作'

    const matchCategory = selectedCategory === '全部類別' || workCategory === selectedCategory
    const matchIssue = selectedIssue === '全部期數' || workIssue === selectedIssue
    const matchSource = selectedSource === '全部來源' || workSource === selectedSource
    
    const lowercaseQuery = searchQuery.toLowerCase().trim()

    const matchSearch = 
      !lowercaseQuery ||
      work.title?.toLowerCase().includes(lowercaseQuery) || 
      work.author?.toLowerCase().includes(lowercaseQuery) || 
      (work.searchText || '').includes(lowercaseQuery)

    return matchCategory && matchIssue && matchSource && matchSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedIssue, selectedSource, searchQuery])

  const isFiltered = selectedIssue !== '全部期數' || selectedSource !== '全部來源' || selectedCategory !== '全部類別' || searchQuery !== ''

  const handleResetFilters = () => {
    setSelectedIssue('全部期數')
    setSelectedSource('全部來源')
    setSelectedCategory('全部類別')
    setSearchQuery('')
  }

  // 分頁：計算總頁數並切出目前這一頁的作品
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
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      {/* ===== 頂部標題區塊（手機端減輕巨量留白） ===== */}
      <PageHeading
        mark="作"
        title="作品典藏"
        lead="在散文裡辨認日常，在詩裡留下停頓，也在小說中走進另一種可能。這裡收藏我們對校園與成長的不同書寫。"
      />
      
      {/* ===== 雜誌風網格篩選列（手機端觸控高度加大至 44px+） ===== */}
      <div className="mb-12 grid grid-cols-1 items-end gap-y-6 border-b border-foreground/20 pb-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 md:mb-14">
        
        {/* 1. 刊物期數 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="filter-issue" className="font-serif text-xs tracking-[0.15em] text-muted-foreground">刊物期數</label>
          <select
            id="filter-issue"
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="h-11 w-full border-b border-border/80 bg-transparent pb-1 font-serif text-sm text-foreground outline-none cursor-pointer focus:border-foreground transition-colors"
          >
            {uniqueIssues.map((issue) => (
              <option key={issue} value={issue} className="bg-background text-foreground py-2">
                {issue}
              </option>
            ))}
          </select>
        </div>

        {/* 2. 文章來源 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="filter-source" className="font-serif text-xs tracking-[0.15em] text-muted-foreground">文章來源</label>
          <select
            id="filter-source"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="h-11 w-full border-b border-border/80 bg-transparent pb-1 font-serif text-sm text-foreground outline-none cursor-pointer focus:border-foreground transition-colors"
          >
            {sources.map((src) => (
              <option key={src} value={src} className="bg-background text-foreground py-2">
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* 3. 文體類別 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="filter-category" className="font-serif text-xs tracking-[0.15em] text-muted-foreground">文體類別</label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 w-full border-b border-border/80 bg-transparent pb-1 font-serif text-sm text-foreground outline-none cursor-pointer focus:border-foreground transition-colors"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-background text-foreground py-2">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. 關鍵字搜尋 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="filter-search" className="font-serif text-xs tracking-[0.15em] text-muted-foreground">關鍵字搜尋</label>
          <div className="relative flex items-center">
            <input
              id="filter-search"
              ref={searchInputRef}
              type="search"
              placeholder="搜尋標題、作者、內文..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full border-b border-border/80 bg-transparent pr-8 pb-1 font-serif text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-foreground transition-colors"
            />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-0 flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="清除搜尋內容"
              >
                <X className="size-4" />
              </button>
            ) : (
              <Search className="absolute right-0 size-4 text-muted-foreground/40 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* ===== 篩選結果回饋與重置按鈕 ===== */}
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4 font-serif text-sm tracking-[0.15em] text-muted-foreground">
        <span>共典藏 {filteredWorks.length} 篇作品</span>
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-primary hover:underline active:opacity-70 transition-opacity"
          >
            <RotateCcw className="size-3" /> 重置所有篩選
          </button>
        )}
      </div>

      {/* ===== 作品卡片區塊 ===== */}
      <section className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedWorks.map((work, index) => (
          <WorkCard key={work.id || index} work={work} />
        ))}
        {filteredWorks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="font-serif text-base text-muted-foreground tracking-widest mb-4">
              目前尚無符合條件的作品。
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-serif text-xs text-foreground hover:bg-muted/50"
              >
                <RotateCcw className="size-3" /> 重置搜尋條件
              </button>
            )}
          </div>
        )}
      </section>

      {/* ===== 分頁導覽（觸控熱區擴大） ===== */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 sm:gap-4 border-t border-border/60 pt-12 mt-16" aria-label="分頁導覽">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 font-serif text-sm tracking-[0.2em] text-muted-foreground hover:text-foreground active:bg-muted/40 disabled:opacity-30 transition-colors"
          >
            上一頁
          </button>

          <div className="flex items-center gap-1 sm:gap-2 font-serif text-sm">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`flex min-h-[44px] min-w-[44px] items-center justify-center font-serif text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-foreground text-background font-bold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 font-serif text-sm tracking-[0.2em] text-muted-foreground hover:text-foreground active:bg-muted/40 disabled:opacity-30 transition-colors"
          >
            下一頁
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