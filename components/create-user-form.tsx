'use client'

import { useState } from 'react'
import { createUserAction } from '@/lib/actions'

function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export function CreateUserForm() {
  const [password, setPassword] = useState('')

  return (
    <form
      action={createUserAction}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'flex-end',
        marginBottom: '28px',
        padding: '16px',
        border: '1px solid #2a2a2a',
        borderRadius: '6px',
      }}
    >
      <div style={{ flex: '1 1 180px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaa' }}>Email</label>
        <input
          type="email"
          name="email"
          required
          style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: '1 1 160px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaa' }}>密碼</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="手動輸入或點右邊產生"
            style={{ flex: 1, padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', minWidth: 0 }}
          />
          <button
            type="button"
            onClick={() => setPassword(generateRandomPassword())}
            style={{ padding: '8px 10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            🎲 隨機產生
          </button>
        </div>
        {password && (
          <p style={{ fontSize: '12px', color: '#fbbf24', marginTop: '4px' }}>
            提交前記得複製這組密碼給對方，之後就看不到明碼了：<strong>{password}</strong>
          </p>
        )}
      </div>
      <div style={{ flex: '0 1 120px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#aaa' }}>身份</label>
        <select
          name="role"
          defaultValue="editor"
          style={{ width: '100%', padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
        >
          <option value="editor">編輯（老師/學生）</option>
          <option value="admin">總管理員</option>
        </select>
      </div>
      <button
        type="submit"
        style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        新增帳號
      </button>
    </form>
  )
}