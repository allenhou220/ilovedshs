'use client'

import { useState } from 'react'
import { saveIssueAction } from '@/lib/actions'

type Issue = {
  name: string
  count: number
  theme: string
  editor_note: string
  editors: string
  cover_image_url: string
}

const inputClass =
  'w-full border border-input bg-background px-3.5 py-2.5 font-serif text-sm text-foreground transition-colors focus:border-foreground'
const labelClass = 'flex flex-col gap-2 font-serif text-xs tracking-[0.12em] text-muted-foreground'

export function IssueForm({ issue }: { issue: Issue }) {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preview, setPreview] = useState(issue.cover_image_url)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)
    try {
      const result = await saveIssueAction(formData)
      setMessage('error' in result ? { type: 'error', text: result.error } : { type: 'success', text: '已儲存' })
    } catch {
      setMessage({ type: 'error', text: '儲存失敗，請重新整理後再試' })
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-6 border border-border bg-card p-5 md:grid-cols-[160px_1fr] md:p-6">
      <input type="hidden" name="name" value={issue.name} />
      <input type="hidden" name="existingImage" value={issue.cover_image_url} />

      {/* 封面 */}
      <div className="flex flex-col gap-3">
        <div className="aspect-[3/4] w-full overflow-hidden border border-border">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={`${issue.name} 封面`} className="h-full w-full object-cover" />
          ) : (
            <div className="placeholder-hatch flex h-full w-full items-center justify-center font-serif text-xs text-muted-foreground">尚無封面</div>
          )}
        </div>
        <label className="cursor-pointer border border-border px-3 py-2 text-center font-serif text-xs transition-colors hover:border-foreground">
          更換封面
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setPreview(URL.createObjectURL(file))
            }}
          />
        </label>
      </div>

      {/* 文字資料 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl tracking-[0.1em]">{issue.name}</h2>
          <span className="font-sans text-xs text-muted-foreground">{issue.count} 篇作品</span>
        </div>
        <label className={labelClass}>
          本期主題
          <input name="theme" defaultValue={issue.theme} maxLength={100} placeholder="例如：在鐘聲停下以前" className={inputClass} />
        </label>
        <label className={labelClass}>
          卷首語
          <textarea name="editorNote" defaultValue={issue.editor_note} rows={5} maxLength={3000} placeholder="介紹本期主題與收錄作品……" className={`${inputClass} leading-[1.9]`} />
        </label>
        <label className={labelClass}>
          編輯名單
          <input name="editors" defaultValue={issue.editors} maxLength={200} placeholder="例如：主編／王小明　美編／林小華" className={inputClass} />
        </label>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 bg-foreground px-6 font-serif text-sm tracking-[0.2em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? '儲存中...' : '儲存'}
          </button>
          {message && (
            <span role="status" className={`font-serif text-sm ${message.type === 'error' ? 'text-destructive' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </form>
  )
}
