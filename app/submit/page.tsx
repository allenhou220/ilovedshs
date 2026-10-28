import type { Metadata } from 'next'
import SubmitCTA from './SubmitCTA'
import { getSiteSettings, getSubmissionStatus } from "@/lib/queries"
import Link from "next/link"
import { ManuscriptTitle, SectionTitle, cnNumeral } from "@/components/editorial"

export const metadata: Metadata = { 
  title: '投稿說明', 
  description: '文薈學生文學誌徵稿類別、格式與投稿方式。' 
}

// 可投稿的文體說明
const types = [
  { title: '散文', text: '記錄日常的細碎微光，在真誠的文字裡辨認生活真實的筆觸。' },
  { title: '新詩', text: '用最凝練的句式，捕捉瞬間的意象、隱喻與呼吸節奏。' },
  { title: '小說', text: '構築虛構的世界，在情節推移中折射青春的複雜角落。' },
  { title: '採訪', text: '走進他人的故事，記錄每一次真誠對話裡的溫度與傾聽。' },
  { title: '漫畫', text: '以視覺與線條作為鏡頭，延伸圖文交織的流暢圖像敘述。' },
]

// 投稿須知
const RULES = [
  '作品須為本人原創，未曾公開發表或於其他刊物獲獎。',
  '來稿將由文薈編輯團隊進行審閱，作品刊登後會出現在「作品典藏」。',
  '漫畫類別因圖像檔案格式與解析度需求，請直接將作品檔與基本資料寄至文薈電子信箱。',
]

// 以台灣時間判斷截稿日是否已過，過期就不顯示
// 截稿日還沒過才顯示，過了就回傳 null
function upcomingDeadline(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' }) // YYYY-MM-DD
  return value >= today ? value.replace(/-/g, ' / ') : null
}

// 投稿頁：投稿關閉時顯示暫停說明，開放時顯示須知與投稿表單
export default async function SubmitPage() {
  const [isOpen, settings] = await Promise.all([getSubmissionStatus(), getSiteSettings()]);
  const deadline = upcomingDeadline(settings?.submission_deadline);

  if (!isOpen) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 px-5 py-24 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-[0.1em] md:text-5xl">目前暫停徵稿</h1>
        <p className="max-w-md font-serif text-base leading-[2] text-muted-foreground">
          本期徵稿已經結束。謝謝所有願意把故事交給我們的同學，下一期再見！
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/works" className="inline-flex min-h-12 items-center bg-foreground px-7 font-serif text-[15px] tracking-[0.1em] text-background transition-opacity hover:opacity-90">
            閱讀作品
          </Link>
          <Link href="/" className="inline-flex min-h-12 items-center border border-foreground px-7 font-serif text-[15px] tracking-[0.1em] transition-colors hover:bg-foreground hover:text-background">
            回到首頁
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flush-footer">
      {/* ===== 開篇 ===== */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <p className="font-serif text-sm font-bold tracking-[0.1em] text-primary">
            徵稿中
          </p>
          <ManuscriptTitle text={'把你的故事\n交給我們'} />
        </div>
        <div className="flex flex-col justify-end gap-8 lg:pb-2">
          <p className="max-w-xl font-serif text-[19px] leading-[2.15] text-foreground/90">
            無論是一場午後的雨、一段沒有說完的對話，或一個只存在於想像中的世界，都值得被仔細閱讀。
          </p>
          {deadline && (
            <div className="flex w-fit items-center gap-5 border-2 border-foreground px-6 py-4">
              <span className="font-serif text-sm font-bold tracking-[0.15em] text-primary">截稿</span>
              <span aria-hidden="true" className="h-8 w-px bg-foreground/30" />
              <span className="font-serif text-2xl font-bold tracking-[0.12em] tabular-nums">{deadline}</span>
            </div>
          )}
        </div>
      </section>

      {/* ===== 徵稿類別 ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-24">
        <SectionTitle no={1} title="徵稿類別" />
        <div className="grid gap-px border border-foreground/20 bg-foreground/20 grid-cols-2 lg:grid-cols-5">
          {types.map(({ title, text }) => (
            <article key={title} className="flex flex-col gap-3 bg-background p-5 md:p-7 last:col-span-2 lg:last:col-span-1">
              <span className="font-serif text-2xl font-bold">{title}</span>
              <p className="font-serif text-[14px] leading-[1.9] text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ===== 投稿須知 ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-24">
        <SectionTitle no={2} title="投稿須知" />
        <ol className="max-w-3xl">
          {RULES.map((item, i) => (
            <li key={item} className="flex gap-5 border-b border-foreground/20 py-5 font-serif text-[16px] leading-[1.9]">
              <span className="shrink-0 font-serif text-primary">{cnNumeral(i + 1)}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== 投稿表單 ===== */}
      <section className="bg-secondary py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SubmitCTA />
        </div>
      </section>
    </main>
  )
}
