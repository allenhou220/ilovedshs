'use client'

import { useState } from 'react'
import { changePasswordAction } from '@/lib/actions'

export function ChangePasswordForm() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)
    let result: { error?: string; success?: boolean } | undefined
    try {
      result = await changePasswordAction(formData)
    } catch {
      result = { error: '系統發生錯誤，請重新登入後再試' }
    }
    setPending(false)
    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else if (result?.success) {
      setMessage({ type: 'success', text: '密碼修改成功' })
      const form = document.getElementById('change-password-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <form
      id="change-password-form"
      action={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}
    >
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>目前密碼</label>
        <input
          type="password"
          name="currentPassword"
          required
          style={{ width: '100%', padding: '9px 10px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>新密碼（至少 8 個字元）</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          style={{ width: '100%', padding: '9px 10px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      {message && (
        <p style={{ fontSize: '13px', color: message.type === 'error' ? 'hsl(var(--destructive))' : 'hsl(142 45% 36%)' }}>{message.text}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        style={{ padding: '10px', background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}
      >
        {pending ? '更新中...' : '更新密碼'}
      </button>
    </form>
  )
}