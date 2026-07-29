'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteWorkAction, toggleFeaturedAction, moveWorkAction } from '@/lib/actions'

type AdminWork = {
  id: number
  title: string
  author: string
  category: string
  image_url?: string
  featured?: boolean
  sort_order?: number
}

export function AdminList({ works }: { works: AdminWork[] }) {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const uniqueCategories = Array.from(new Set(works.map((w) => w.category || '散文')))
  const categories = ['全部', ...uniqueCategories]

  // 依 sort_order 排序（後台列表要照排序顯示，才能正確判斷上下移動）
  const sorted = [...works].sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id))

  const filtered = sorted.filter((work) => {
    const matchCategory = activeCategory === '全部' || work.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchSearch =
      work.title?.toLowerCase().includes(q) || work.author?.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })

  // 只有「全部」分類、沒有搜尋時，才顯示上下移動箭頭
  // （篩選狀態下移動順序容易誤導，先隱藏比較安全）
  const canReorder = activeCategory === '全部' && searchQuery === ''

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
      {/* 分類按鈕 + 搜尋框 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                borderRadius: '4px',
                border: '1px solid #333',
                cursor: 'pointer',
                background: activeCategory === category ? '#2563eb' : 'transparent',
                color: activeCategory === category ? '#fff' : '#ccc',
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="搜尋標題、作者..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '4px',
            border: '1px solid #333',
            background: '#1a1a1a',
            color: '#fff',
            minWidth: '220px',
          }}
        />
      </div>

      {!canReorder && (
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
          切換到「全部」分類且清空搜尋框，才能調整文章順序
        </p>
      )}

      {/* 文章列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #2a2a2a', borderRadius: '6px', overflow: 'hidden' }}>
        {filtered.map((work, index) => (
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
              {/* 上下移動箭頭 */}
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
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {work.category || '散文'}・{work.author || '匿名'}
                </p>
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
        ))}
        {filtered.length === 0 && (
          <p style={{ padding: '32px', textAlign: 'center', color: '#666', fontSize: '14px' }}>沒有符合條件的文章</p>
        )}
      </div>
    </div>
  )
}