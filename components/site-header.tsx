'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

const links = [
  { href: '/works', label: '作品' },
  { href: '/issues', label: '期刊' },
  { href: '/authors', label: '作者' },
  { href: '/about', label: '關於' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function SiteHeader() {
  const pathname = usePathname() || '/'
  const [isOpen, setIsOpen] = useState(false)

  // 切換頁面時自動關閉手機選單
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // 手機選單開啟時，禁止背景網頁滾動
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 md:h-[76px] md:px-8">
        {/* 刊名 */}
        <Link href="/" className="group flex items-center gap-3" aria-label="東山文薈首頁">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dshslogo.jpg"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            className="size-11 object-contain mix-blend-multiply transition-transform duration-500 group-hover:-rotate-3 dark:invert dark:mix-blend-screen md:size-12"
          />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[22px] font-black tracking-[0.28em] text-foreground">東山文薈</span>
            <span className="mt-1.5 hidden font-sans text-[10px] tracking-[0.32em] text-muted-foreground sm:block">東山高中・學生文學誌</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-8">
          {/* 電腦版導覽 */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="主要導覽">
            {links.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-2 font-serif text-[15px] tracking-[0.12em] transition-colors hover:text-primary ${
                    active ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {link.label}
                  {active && <span aria-hidden="true" className="absolute -bottom-[22px] left-0 right-[0.3em] h-[3px] bg-primary" />}
                </Link>
              )
            })}
            <Link
              href="/submit"
              className="inline-flex min-h-10 items-center border border-foreground px-4 font-serif text-sm tracking-[0.1em] transition-colors hover:bg-foreground hover:text-background"
            >
              投稿
            </Link>
          </nav>

          <div className="flex items-center">
            <Link
              href="/works?focus=search"
              aria-label="搜尋作品"
              className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="size-[18px]" strokeWidth={1.6} />
            </Link>
            <div className="px-1 opacity-80 transition-opacity hover:opacity-100">
              <ModeToggle />
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex size-11 items-center justify-center text-foreground md:hidden"
              aria-label={isOpen ? '關閉選單' : '開啟選單'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* 手機選單 */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 h-[100dvh] border-t border-border bg-background md:hidden">
            <nav className="flex flex-col px-6 pb-20 pt-2" aria-label="行動版導覽">
              {[...links, { href: '/submit', label: '投稿' }].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? 'page' : undefined}
                  className="flex min-h-[60px] items-center justify-between border-b border-border font-serif text-lg tracking-[0.15em] text-foreground aria-[current=page]:text-primary"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="text-sm text-muted-foreground">→</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
