'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteWorkAction, toggleFeaturedAction, moveWorkAction } from '@/lib/actions'
import { RotateCcw } from 'lucide-react'

type AdminWork = {
  id: number
  title: string
  author: string
  category: string
  issue?: string
  source_type?: string
  sourceType?: string
  image_url?: string
  featured?: boolean
  sort_order?: number
}

export function AdminList({ works }: { works: AdminWork[] }) {
  // 多重篩選條件狀態
  const [selectedIssue, setSelectedIssue] = useState('全部')
  const [selectedSource, setSelectedSource] = useState('全部')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  // 1. 動態擷取選單選項
  const uniqueIssues = ['全部', ...Array.from(new Set(works.map((w) => w.issue || '第 1 期')))]
  const sources = ['全部', '文薈成員創作', '學生投稿']
  const uniqueCategories = ['全部', ...Array.from(new Set(works.map((w) => w.category || '散文')))]

  // 2. 依 sort_order 排序
  const sorted = [...works].sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id))

  // 3. 多重交集過濾邏輯
  const filtered = sorted.filter((work) => {
    const currentSource = work.source_type || work.sourceType || '文薈成員創作'
    const currentIssue = work.issue || '第 1 期'

    const matchIssue = selectedIssue === '全部' || currentIssue === selectedIssue
    const matchSource = selectedSource === '全部' || currentSource === selectedSource
    const matchCategory = selectedCategory === '全部' || work.category === selectedCategory

    const q = searchQuery.toLowerCase().trim()
    const matchSearch =
      !q ||
      work.title?.toLowerCase().includes(q) ||
      work.author?.toLowerCase().includes(q)

    return matchIssue && matchSource && matchCategory && matchSearch
  })

  // 檢查是否正在篩選中
  const isFiltered =
    selectedIssue !== '全部' ||
    selectedSource !== '全部' ||
    selectedCategory !== '全部' ||
    searchQuery !== ''

  // 一鍵重置所有篩選
  const resetFilters = () => {
    setSelectedIssue('全部')
    setSelectedSource('全部')
    setSelectedCategory('全部')
    setSearchQuery('')
  }

  // 只有在未進行任何篩選時，才開放上下排序功能
  const canReorder = !isFiltered

  async function handleDelete(id: number, title: string) {
    if (!confirm(`確定要刪除「${title}」嗎？這個動作無法復原。`)) return
    setDeletingId(id)
    try {
      await deleteWorkAction(id)
    } finally {
      setDeletingId(null)
    }
  }

  function handleToggleFeatured(id: number, current: boolean) {
    startTransition(() => {
      toggleFeaturedAction(id, !current)
    })
  }

  function handleMove(id: number, direction: 'up' | 'down') {
    startTransition(() => {
      moveWorkAction(id, direction)
    })
  }

  return (
    <div>
      {/* 電商風格多重篩選控制列 */}
      <div
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          
          {/* 1. 期數篩選 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>刊物期數</label>
            <select
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {uniqueIssues.map((issue) => (
                <option key={issue} value={issue}>
                  {issue === '全部' ? '全部期數' : issue}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 來源篩選 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>文章來源</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src === '全部' ? '全部來源' : src}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 文體分類篩選 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>文體類別</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === '全部' ? '全部類別' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* 4. 關鍵字搜尋 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>關鍵字搜尋</label>
            <input
              type="text"
              placeholder="搜尋標題、作者名稱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #3f3f46',
                background: '#09090b',
                color: '#fff',
              }}
            />
          </div>

          {/* 5. 重置條件按鈕 */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              style={{
                alignSelf: 'flex-end',
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={12} /> 清除篩選
            </button>
          )}
        </div>
      </div>

      {!canReorder && (
        <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '10px' }}>
          💡 目前處於多重篩選狀態；若要調整文章上下順序，請先點擊「清除篩選」。
        </p>
      )}

      {/* 文章列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #2a2a2a', borderRadius: '6px', overflow: 'hidden' }}>
        {filtered.map((work, index) => {
          const currentSource = work.source_type || work.sourceType || '文薈成員創作'
          const currentIssue = work.issue || '第 1 期'

          return (
            <div
              key={work.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '14px 16px',
                borderBottom: '1px solid #2a2a2a',
                opacity: isPending ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {canReorder && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      onClick={() => handleMove(work.id, 'up')}
                      disabled={index === 0 || isPending}
                      style={{
                        border: '1px solid #333',
                        background: 'transparent',
                        color: index === 0 ? '#444' : '#ccc',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        borderRadius: '3px',
                        fontSize: '11px',
                        padding: '1px 6px',
                      }}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMove(work.id, 'down')}
                      disabled={index === filtered.length - 1 || isPending}
                      style={{
                        border: '1px solid #333',
                        background: 'transparent',
                        color: index === filtered.length - 1 ? '#444' : '#ccc',
                        cursor: index === filtered.length - 1 ? 'not-allowed' : 'pointer',
                        borderRadius: '3px',
                        fontSize: '11px',
                        padding: '1px 6px',
                      }}
                    >
                      ▼
                    </button>
                  </div>
                )}

                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '4px',
                    background: '#1a1a1a',
                    flexShrink: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#666',
                  }}
                >
                  {work.image_url ? (
                    <img src={work.image_url} alt={work.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '無圖'
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {work.title}
                    {work.featured && (
                      <span style={{ fontSize: '11px', background: '#b45309', color: '#fff', padding: '1px 6px', borderRadius: '3px' }}>精選</span>
                    )}
                  </p>
                  
                  <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ background: '#27272a', color: '#a1a1aa', padding: '1px 6px', borderRadius: '3px', fontSize: '11px' }}>
                      {currentIssue}
                    </span>
                    <span style={{ 
                      background: currentSource === '學生投稿' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                      color: currentSource === '學生投稿' ? '#fde047' : '#93c5fd', 
                      padding: '1px 6px', 
                      borderRadius: '3px', 
                      fontSize: '11px' 
                    }}>
                      {currentSource}
                    </span>
                    <span>{work.category || '散文'}</span>
                    <span>・</span>
                    <span>{work.author || '匿名'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleToggleFeatured(work.id, !!work.featured)}
                  disabled={isPending}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    border: work.featured ? '1px solid #b45309' : '1px solid #333',
                    borderRadius: '4px',
                    background: 'transparent',
                    color: work.featured ? '#fbbf24' : '#ccc',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {work.featured ? '取消精選' : '設為精選'}
                </button>
                <Link
                  href={`/admin/edit/${work.id}`}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  編輯
                </Link>
                <button
                  onClick={() => handleDelete(work.id, work.title)}
                  disabled={deletingId === work.id}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    border: '1px solid #7f1d1d',
                    borderRadius: '4px',
                    background: 'transparent',
                    color: '#f87171',
                    cursor: deletingId === work.id ? 'not-allowed' : 'pointer',
                    opacity: deletingId === work.id ? 0.5 : 1,
                  }}
                >
                  {deletingId === work.id ? '刪除中...' : '刪除'}
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p style={{ padding: '32px', textAlign: 'center', color: '#666', fontSize: '14px' }}>沒有符合條件的文章</p>
        )}
      </div>
    </div>
  )
}