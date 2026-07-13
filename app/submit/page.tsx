import type { Metadata } from 'next'
import { ArrowUpRight, FileText, Mail, PenLine } from 'lucide-react'

export const metadata: Metadata = { title: '投稿說明', description: '文薈學生文學誌徵稿類別、格式與投稿方式。' }

const types = [
  { icon: PenLine, title: '散文', limit: '1,500–3,500 字', text: '很散文。' },
  { icon: FileText, title: '新詩', limit: '40 行以內', text: '很詩。' },
  { icon: FileText, title: '小說', limit: '3,000–8,000 字', text: '很小說。' },
]

export default function SubmitPage() {
  return <main>
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="grid gap-10 border-b border-foreground pb-14 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div><p className="mb-5 text-xs tracking-[0.22em] text-primary">OPEN CALL / 春季徵稿</p><h1 className="text-balance font-serif text-6xl font-black leading-[1.1] md:text-8xl">把你的故事<br />交給我們</h1></div>
        <div className="flex flex-col gap-4"><p className="text-lg leading-loose text-muted-foreground">文薈第n期沒有在徵稿。無論是一場午後的雨、一段沒有說完的對話，或一個只存在於想像中的世界，我們都期待讀見。</p><p className="font-serif text-2xl font-bold text-primary">截稿日期・2077年 13月 32日</p></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
      <div className="grid gap-5 md:grid-cols-3">{types.map(({icon:Icon,title,limit,text},i) => <article key={title} className="flex min-h-64 flex-col justify-between border border-border bg-card p-7"><div className="flex items-center justify-between"><Icon className="size-6 text-primary" /><span className="text-xs text-muted-foreground">0{i+1}</span></div><div><h2 className="font-serif text-3xl font-bold">{title}</h2><p className="mt-2 text-sm font-medium text-primary">{limit}</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p></div></article>)}</div>
      <div className="mt-16 grid gap-12 md:grid-cols-[0.7fr_1.3fr]">
        <h2 className="font-serif text-4xl font-bold">投稿須知</h2>
        <ol className="flex flex-col">{['作品須為本人創作。','請使用可編輯文件格式，內文以 12 級字、1.5 倍行距排版。問主編這對嗎 idk','檔名請標示「類別＿班級＿姓名＿作品名稱」。','來稿將由文薈文邊審閱，結果以電子郵件通知。'].map((item,i) => <li key={item} className="flex gap-6 border-t border-border py-5 text-sm leading-relaxed"><span className="font-serif text-primary">0{i+1}</span><span>{item}</span></li>)}</ol>
      </div>
    </section>
    <section className="bg-primary py-16 text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 md:flex-row md:items-center md:px-8"><div><p className="mb-2 text-xs tracking-[0.2em] text-primary-foreground/60">READY TO SUBMIT?</p><h2 className="font-serif text-3xl font-bold md:text-4xl">準備好讓作品被看見了嗎？</h2></div><a href="mailto:wenhui@example.edu.tw?subject=文薈第28期投稿" className="inline-flex items-center gap-3 bg-background px-6 py-4 text-sm font-medium tracking-wider text-foreground"><Mail className="size-4" /> 寄出投稿郵件 <ArrowUpRight className="size-4" /></a></div></section>
  </main>
}
