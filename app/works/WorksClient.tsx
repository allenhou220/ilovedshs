'use client'

import { useEffect, useState } from 'react'
import { WorkCard } from '@/components/work-card'
import { RotateCcw } from 'lucide-react'

const PAGE_SIZE = 9

// 💡 純文字過濾工具：避免搜尋到內文 HTML 標籤
function stripHtml(html: string = '') {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function WorksClient({ dbWorks }: { dbWorks: any[] }) {
  // 依 sort_order 排序
  const sortedWorks = [...dbWorks].sort((a, b) => {
    const orderA = a.sort_order ?? 999999;
    const orderB = b.sort_order ?? 999999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return (b.id || 0) - (a.id || 0);
  });

  // 動態擷取篩選選單的選項
  const uniqueIssues = ['全部期數', ...Array.from(new Set(sortedWorks.map(work => work.issue || '第 1 期')))]
  const sources = ['全部來源', '文薈成員創作', '學生投稿']
  const uniqueCategories = ['全部類別', ...Array.from(new Set(sortedWorks.map(work => work.category || '散文')))]

  // 💡 電商式獨立篩選狀態
  const [selectedIssue, setSelectedIssue] = useState('全部期數')
  const [selectedSource, setSelectedSource] = useState('全部來源')
  const [selectedCategory, setSelectedCategory] = useState('全部類別')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 進行多重交集過濾
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

  // 判斷是否處於篩選狀態
  const isFiltered =
    selectedIssue !== '全部期數' ||
    selectedSource !== '全部來源' ||
    selectedCategory !== '全部類別' ||
    searchQuery !== ''

  // 一鍵重置所有篩選
  const resetFilters = () => {
    setSelectedIssue('全部期數')
    setSelectedSource('全部來源')
    setSelectedCategory('全部類別')
    setSearchQuery('')
  }

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
      
      {/* 💡 電商風格獨立多重篩選列 */}
      <div className="my-8 rounded-lg border border-border bg-card/50 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-end gap-4">
          
          {/* 1. 刊物期數 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif text-muted-foreground">刊物期數</label>
            <select
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm font-serif text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {uniqueIssues.map((issue) => (
                <option key={issue} value={issue}>
                  {issue}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 文章來源 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif text-muted-foreground">文章來源</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm font-serif text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 文體類別 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-serif text-muted-foreground">文體類別</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm font-serif text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. 關鍵字搜尋 */}
          <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <label className="text-xs font-serif text-muted-foreground">關鍵字搜尋</label>
            <input
              type="text"
              placeholder="搜尋標題、作者、內文..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-4 py-2 text-sm font-serif text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 5. 清除篩選按鈕 */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-serif text-destructive transition-colors hover:bg-destructive/20"
            >
              <RotateCcw className="size-3.5" /> 清除篩選
            </button>
          )}
        </div>
      </div>
      
      <section className="grid gap-x-8 gap-y-16 py-8 md:grid-cols-2 lg:grid-cols-3">
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
          <p className="col-span-full py-16 text-center font-serif text-lg text-muted-foreground">
            目前尚無符合條件的作品
          </p>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 border-t border-border pt-10" aria-label="分頁導覽">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-sm border border-border px-4 py-2 font-serif text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            上一頁
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`size-10 rounded-sm border font-serif text-sm transition-colors ${
                currentPage === page
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-sm border border-border px-4 py-2 font-serif text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            下一頁
          </button>
        </nav>
      )}
    </main>
  )
}