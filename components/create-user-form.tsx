'use client'

import { useRef, useState } from 'react'
import { createUserAction } from '@/lib/actions'

// 產生隨機密碼（用瀏覽器的安全亂數，並避開容易混淆的字元）
function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, (v) => chars[v % chars.length]).join('')
}

const inputClass =
  'w-full rounded-md border border-border/80 bg-background/60 px-3.5 py-2.5 font-serif text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30'
const labelClass =
  'block font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2'

// 新增帳號表單：會顯示「信箱重複」「密碼太短」等錯誤，不再無聲失敗
export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)
    try {
      const result = await createUserAction(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: `已建立帳號 ${formData.get('email')}` })
        formRef.current?.reset()
        setPassword('')
      }
    } catch {
      setMessage({ type: 'error', text: '系統發生錯誤，請重新整理後再試' })
    } finally {
      setPending(false)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <div className="md:col-span-5">
        <label className={labelClass}>Email 帳號</label>
        <input type="email" name="email" required placeholder="name@example.com" className={inputClass} />
      </div>

      <div className="md:col-span-3">
        <label className={labelClass}>預設密碼（至少 8 字）</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            name="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="手動輸入"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setPassword(generateRandomPassword())}
            title="產生隨機密碼"
            className="shrink-0 rounded-md border border-border/80 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            隨機
          </button>
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={labelClass}>身分權限</label>
        <select name="role" defaultValue="editor" className={`${inputClass} cursor-pointer`}>
          <option value="editor" className="bg-background text-foreground">編輯</option>
          <option value="admin" className="bg-background text-foreground">總管理員</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-primary py-2.5 px-4 font-serif text-xs tracking-wider text-primary-foreground font-medium transition-colors hover:bg-primary/90 shadow-sm disabled:opacity-60"
        >
          {pending ? '建立中...' : '新增帳號'}
        </button>
      </div>

      {password && (
        <p className="md:col-span-12 text-xs text-amber-600 dark:text-amber-400">
          建立後請把密碼告訴對方：<strong className="font-mono">{password}</strong>
        </p>
      )}
      {message && (
        <p className={`md:col-span-12 text-xs ${message.type === 'error' ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}
