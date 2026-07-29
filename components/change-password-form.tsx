'use client'

import { useState } from 'react'
import { changePasswordAction } from '@/lib/actions'

export function ChangePasswordForm() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setMessage(null)
    const result = await changePasswordAction(formData)
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
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaa' }}>目前密碼</label>
        <input
          type="password"
          name="currentPassword"
          required
          style={{ width: '100%', padding: '9px 10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaa' }}>新密碼（至少 6 個字元）</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={6}
          style={{ width: '100%', padding: '9px 10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      {message && (
        <p style={{ fontSize: '13px', color: message.type === 'error' ? '#f87171' : '#4ade80' }}>{message.text}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}
      >
        {pending ? '更新中...' : '更新密碼'}
      </button>
    </form>
  )
}