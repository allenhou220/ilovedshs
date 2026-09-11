'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

const links = [
  { href: '/works', label: '作品典藏' },
  { href: '/about', label: '關於文薈' },
  { href: '/submit', label: '我想投稿' },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  // 💡 防鎖死滾動：當手機選單開啟時，禁止背景網頁繼續滑動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
      {/* 頂部 BETA 公告列 */}
      <div className="border-b border-border/30 bg-muted/20 py-2 text-center px-4">
        <p className="font-serif text-[11px] tracking-[0.18em] text-muted-foreground/80 leading-relaxed">
          <span className="mr-1.5 font-mono text-[10px] font-semibold text-primary uppercase">[ BETA ]</span>
          網站目前仍在架設測試中，內容與功能持續更新完善
        </p>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 md:px-8">
        
        {/* LOGO 區塊 */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 active:opacity-80 transition-opacity" 
          aria-label="東山文薈首頁"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative size-8 md:size-10 overflow-hidden transition-transform duration-500 group-hover:-rotate-3 grayscale-[15%] group-hover:grayscale-0">
            <Image 
              src="/images/dshslogo.jpg" 
              alt="文薈 Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg md:text-xl font-normal tracking-[0.2em] text-foreground">
              東山文薈
            </span>
            <span className="mt-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              DSHS WENHUI
            </span>
          </span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
          {/* 電腦版導覽列 */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="主要導覽">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="relative pb-1 text-xs font-serif tracking-[0.2em] text-muted-foreground hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* 深淺色主題切換開關 */}
          <div className="opacity-80 transition-opacity hover:opacity-100">
            <ModeToggle />
          </div>
          
          {/* 💡 手機版漢堡選單按鈕（觸控熱區加大至 44px x 44px） */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden active:bg-muted/50 transition-colors"
            aria-label={isOpen ? "關閉選單" : "開啟選單"}
          >
            {isOpen ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* 💡 手機專屬抽屜選單（Full-screen Drawer） */}
      {isOpen && (
        <div className="fixed inset-0 top-[89px] z-50 flex flex-col bg-background/98 backdrop-blur-xl md:hidden animate-in fade-in duration-200">
          <nav className="flex flex-col px-6 pt-4 pb-12" aria-label="行動版導覽">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="flex min-h-[56px] items-center justify-between border-b border-border/40 font-serif text-base tracking-[0.25em] text-foreground active:bg-muted/30 transition-colors px-2"
              >
                <span>{link.label}</span>
                <span className="font-mono text-xs text-muted-foreground/60">→</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}