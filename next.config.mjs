// ===== 安全標頭 =====
// 告訴瀏覽器：這個網站只能從哪些地方載入程式、樣式、字型、圖片，
// 也不允許被別的網站用框架嵌入（防止點擊劫持）。
const isDev = process.env.NODE_ENV !== 'production'

const csp = [
  "default-src 'self'",
  // Next.js 需要內嵌程式；開發模式另外需要 eval。vercel.live 是 Vercel 預覽網址上的意見回饋工具列
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://vercel.live`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
  "font-src 'self' data: https://fonts.gstatic.com https://vercel.live https://assets.vercel.com",
  // 作品圖片可能來自圖片空間或其他 https 網站
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  // 圖片、影片直接上傳到 Vercel Blob 時會連到這些網址
  `connect-src 'self' https://vercel.com https://*.vercel.com https://*.vercel-storage.com https://vercel.live wss://ws-us3.pusher.com${isDev ? ' ws: http://localhost:*' : ''}`,
  "frame-src https://vercel.live",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }]),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 💡 關鍵新增：放寬 Server Action 表單資料上限至 10MB
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // 全站套用安全標頭
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
