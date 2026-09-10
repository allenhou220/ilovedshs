import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Asterisk } from 'lucide-react'

export const metadata: Metadata = { 
  title: '關於文薈', 
  description: '東山學生文學誌《文薈》的創辦理念、核心精神與發行初衷。' 
}

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      {/* ===== Hero 主視覺區塊 ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="mb-12 border-b border-border/60 pb-6">
          <p className="font-display text-xs font-bold tracking-[0.3em] text-primary uppercase">
            ABOUT / 關於我們
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20 lg:items-center">
          <div>
            <h1 className="text-balance font-serif text-5xl font-light leading-[1.25] tracking-wide sm:text-6xl md:text-7xl text-foreground">
              文學不是遠方，<br />而是此刻的生活。
            </h1>
            <p className="mt-8 max-w-xl font-serif text-base md:text-lg leading-[2.1] text-muted-foreground font-light text-justify">
              東山文薈誕生於東山高中一群對文學懷抱熱忱的學生。在繁忙緊湊的課業之外，我們希望能為校園築起一座可以慢慢說話、也願意仔細聆聽的角落。
            </p>
          </div>

          {/* 校園意象圖片 */}
          <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border/40 bg-muted/30 shadow-sm">
            <img 
              src="/images/wenhui logo.png" 
              alt="東山校園走廊" 
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </section>

      {/* ===== 核心理念（3 欄極簡網格） ===== */}
      <section className="border-y border-border/60 bg-muted/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-16 flex items-end justify-between border-b border-border/60 pb-6">
            <div>
              <p className="mb-2 font-display text-xs font-bold tracking-[0.3em] text-primary uppercase">OUR VALUES</p>
              <h2 className="font-serif text-3xl font-light tracking-wide md:text-4xl">核心理念</h2>
            </div>
            <span className="font-display text-5xl md:text-6xl font-light text-muted-foreground/20 leading-none">03</span>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                num: '01',
                title: '紀錄青春',
                en: 'RECORD',
                desc: '把那些看似微小的日常、放學後的夕陽，與成長裡的迷惘，用真誠的文字與線條逐一定格。'
              },
              {
                num: '02',
                title: '傾聽聲音',
                en: 'LISTEN',
                desc: '不設限體裁與立場，讓每一種來自校園各個角落的獨特視角，都能在這裡找到共鳴與迴響。'
              },
              {
                num: '03',
                title: '給予留白',
                en: 'SPACE',
                desc: '在快速運轉的校園節奏中，提供一處能隨意沉澱、思考與純粹享受閱讀的文學空間。'
              }
            ].map((item) => (
              <div key={item.num} className="flex flex-col justify-between border border-border/60 bg-card p-8 transition-colors duration-500 hover:border-primary/50">
                <div className="flex items-start justify-between mb-10">
                  <span className="font-display text-xs font-bold tracking-widest text-primary">{item.num}</span>
                  <span className="font-display text-[10px] tracking-widest uppercase text-muted-foreground/50">{item.en}</span>
                </div>
                <div>
                  <h3 className="mb-4 font-serif text-2xl font-light text-foreground">{item.title}</h3>
                  <p className="font-serif text-xs leading-relaxed text-muted-foreground font-light text-justify">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 雜誌宣言長文區塊 ===== */}
      <section className="mx-auto max-w-4xl px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 font-display text-xs font-bold tracking-[0.3em] text-primary uppercase">MANIFESTO</p>
          <h2 className="mb-12 font-serif text-3xl md:text-4xl font-light tracking-wide">為什麼我們需要文薈？</h2>
        </div>
        
        <div className="space-y-8 font-serif text-base md:text-lg leading-[2.2] text-foreground/85 font-light text-justify">
          <p>
            文學不該只停留在考卷上的閱讀理解，或是課本裡的遠古經典。它應該是活生生的——是午後陣雨打在窗框上的聲音、是鐘聲響起時心底微小的悸動，也是青春裡那些尚未找到答案的迷惘。
          </p>
          <p>
            《東山文薈》由東山高中的學生自主發起與編輯。我們深信，每一個學生都有屬於自己的獨特視角與故事。透過散文、新詩、小說、採訪與漫畫，我們嘗試建立一個屬於我們的精神空間，紀錄這段無法重來的歲月。
          </p>
        </div>

        {/* 底部行動按鈕 */}
        <div className="mt-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link 
            href="/works" 
            className="group inline-flex items-center gap-3 border border-border px-8 py-3.5 font-serif text-xs tracking-[0.2em] text-foreground transition-colors duration-500 hover:bg-muted/50"
          >
            閱讀所有作品
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/submit" 
            className="group inline-flex items-center gap-3 bg-primary px-8 py-3.5 font-serif text-xs tracking-[0.2em] text-primary-foreground transition-colors duration-500 hover:bg-primary/90"
          >
            參與徵稿
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  )
}