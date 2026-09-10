import type { Metadata } from 'next'
import { FileText, PenLine, BookOpen, Mic, Palette } from 'lucide-react'
import SubmitCTA from './SubmitCTA'
import { getSubmissionStatus } from "@/lib/actions"
import Link from "next/link"

export const metadata: Metadata = { 
  title: '投稿說明', 
  description: '文薈學生文學誌徵稿類別、格式與投稿方式。' 
}

const types = [
  { icon: PenLine, title: '散文', text: '記錄日常的細碎微光，在真誠的文字裡辨認生活真實的筆觸。' },
  { icon: FileText, title: '新詩', text: '用最凝練的句式，捕捉瞬間的意象、隱喻與呼吸節奏。' },
  { icon: BookOpen, title: '小說', text: '構築虛構的世界，在情節推移中折射青春的複雜角落。' },
  { icon: Mic, title: '採訪', text: '走進他人的故事，記錄每一次真誠對話裡的溫度與傾聽。' },
  { icon: Palette, title: '漫畫', text: '以視覺與線條作為鏡頭，延伸圖文交織的流暢圖像敘述。' },
]

export default async function SubmitPage() {
  const isOpen = await getSubmissionStatus();

  if (!isOpen) {
    return (
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-5 py-16 md:px-8">
        <div className="max-w-2xl text-center">
          <p className="mb-5 font-mono text-xs tracking-[0.22em] text-primary">SUBMISSIONS CLOSED / 暫停徵稿</p>
          <h1 className="mb-6 font-serif text-5xl font-black leading-[1.1] md:text-7xl text-foreground">
            目前暫不開放投稿
          </h1>
          <p className="mb-10 font-serif text-lg leading-loose text-muted-foreground font-light">
            本期文薈徵稿已順利結束或暫停收件。感謝所有願意把故事交給我們的同學，請密切留意後續的發行公告！
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 font-serif text-sm font-medium tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            返回首頁
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground">
      {/* ===== 頂部標題區塊 ===== */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 border-b border-border pb-14 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="mb-5 font-mono text-xs tracking-[0.22em] text-primary">OPEN CALL / 春季徵稿</p>
            <h1 className="text-balance font-serif text-6xl font-black leading-[1.1] md:text-8xl">
              把你的故事<br />交給我們
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-lg leading-loose text-muted-foreground font-serif font-light">
              無論是一場午後的雨、一段沒有說完的對話，或一個只存在於想像中的世界，都值得被仔細閱讀。
            </p>
            
            <div className="flex flex-col gap-1 border-l-2 border-primary pl-4 py-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                DEADLINE / 截稿日期
              </span>
              <span className="font-mono text-2xl font-bold tracking-widest text-foreground tabular-nums">
                2026 / 05 / 31
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 徵稿類別區塊（平分 5 欄、無字數標示） ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {types.map(({ icon: Icon, title, text }, i) => (
            <article 
              key={title} 
              className="group flex min-h-[220px] flex-col justify-between border border-border bg-card p-6 md:p-8 transition-transform duration-500 ease-out hover:-translate-y-2"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-primary opacity-80 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                <span className="font-mono text-xs tracking-widest text-muted-foreground/70">0{i + 1}</span>
              </div>
              <div>
                <h2 className="mb-3 font-serif text-2xl md:text-3xl font-light text-foreground">{title}</h2>
                <p className="font-serif text-xs leading-relaxed text-muted-foreground font-light">{text}</p>
              </div>
            </article>
          ))}
        </div>
        
        {/* ===== 投稿須知 ===== */}
        <div className="mt-24 grid gap-12 border-t border-border pt-16 md:grid-cols-[0.7fr_1.3fr]">
          <h2 className="font-serif text-4xl font-light">投稿須知</h2>
          <ol className="flex flex-col">
            {[
              '作品須為本人原創，未曾公開發表或於其他刊物獲獎。',
              '來稿將由文薈編輯團隊進行審閱，審核結果將透過電子郵件通知。',
              '漫畫類別因圖像檔案格式與解析度需求，請直接將作品檔與基本資料寄至文薈電子信箱。'
            ].map((item, i) => (
              <li key={item} className="flex gap-6 border-b border-border/50 py-5 font-serif text-sm leading-relaxed text-foreground/90 first:pt-0">
                <span className="font-mono text-xs font-normal tracking-widest text-primary">0{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== 投稿表單 CTA 區塊 ===== */}
      <section className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SubmitCTA />
        </div>
      </section>
    </main>
  )
}