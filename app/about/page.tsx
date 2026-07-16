import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: '關於文薈', description: '認識文薈理念與團隊。' }

export default function AboutPage() {
  return <main>
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="mb-5 text-xs tracking-[0.22em] text-primary">ABOUT / 關於我們</p>
      <h1 className="max-w-5xl text-balance font-serif text-6xl font-black leading-[1.15] md:text-8xl">文學不是遠方，<br />而是此刻的生活。</h1>
      <div className="mt-14 grid gap-10 md:grid-cols-[1.4fr_0.8fr] md:items-end">
        <div className="relative aspect-[16/10] overflow-hidden"><Image src="/images/campus-corridor.png" alt="午後安靜的校園走廊" fill className="object-cover" sizes="(min-width: 768px) 65vw, 100vw" /></div>
        <p className="border-t border-foreground pt-5 text-pretty text-lg leading-loose text-muted-foreground">文薈誕生於東山一群對文學有熱忱的學生。我們希望在課業之外，給東山學生一個可以慢慢說話、也願意仔細聆聽的地方。</p>
      </div>
    </section>
    <section className="bg-foreground py-20 text-background md:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-3 md:px-8">
        {[['01','閱讀','讓每篇作品被認真對待。編輯不只是修正文字，更是理解作者想說的話。'],['02','書寫','鼓勵真實而有個性的聲音。題材可以很小，只要那是你真正看見的世界。'],['03','相遇','讓不同年級、不同經驗的人在文字裡相遇，交換觀看校園與成長的方式。']].map(([n,t,d]) => <div key={n} className="flex flex-col gap-5 border-t border-background/30 pt-5"><span className="text-xs tracking-widest text-background/50">{n} / OUR VALUE</span><h2 className="font-serif text-4xl font-bold">{t}</h2><p className="text-sm leading-loose text-background/65">{d}</p></div>)}
      </div>
    </section>
    <section className="mx-auto max-w-5xl px-5 py-24 text-center md:px-8 md:py-32"><p className="mb-5 text-xs tracking-[0.22em] text-primary">JOIN THE STORY</p><h2 className="text-balance font-serif text-4xl font-bold md:text-6xl">下一篇故事，也許由你書寫。</h2><Link href="/submit" className="mt-10 inline-flex items-center gap-3 bg-primary px-7 py-4 text-sm tracking-wider text-primary-foreground">查看投稿方式 <ArrowRight className="size-4" /></Link></section>
  </main>
}
