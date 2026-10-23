import type { Metadata } from 'next'
import Link from 'next/link'
import { ManuscriptTitle, SectionTitle } from '@/components/editorial'

export const metadata: Metadata = {
  title: '關於文薈',
  description: '東山學生文學誌《文薈》的創辦理念、核心精神與發行初衷。',
}

const VALUES = [
  { title: '紀錄青春', desc: '把那些看似微小的日常、放學後的夕陽，與成長裡的迷惘，用真誠的文字與線條逐一定格。' },
  { title: '傾聽聲音', desc: '不設限體裁與立場，讓每一種來自校園各個角落的獨特視角，都能在這裡找到共鳴與迴響。' },
  { title: '給予留白', desc: '在快速運轉的校園節奏中，提供一處能隨意沉澱、思考與純粹享受閱讀的文學空間。' },
]

export default function AboutPage() {
  return (
    <main>
      {/* ===== 開篇 ===== */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <p className="font-serif text-sm font-bold tracking-[0.1em] text-primary">
            關於文薈
          </p>
          <ManuscriptTitle text={'文學不是遠方\n而是此刻的生活'} />
        </div>

        <div className="flex flex-col justify-end gap-8 lg:pb-2">
          <p className="max-w-xl font-serif text-[19px] leading-[2.15] text-foreground/90">
            東山文薈誕生於東山高中一群對文學懷抱熱忱的學生。在繁忙緊湊的課業之外，我們希望能為校園築起一座可以慢慢說話、也願意仔細聆聽的角落。
          </p>
          <div className="flex w-full max-w-md items-center gap-6 border-t border-foreground/30 pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/wenhui logo.png" alt="東山文薈標誌" className="size-24 object-contain" />
            <p className="font-serif text-sm leading-[1.9] tracking-[0.1em] text-muted-foreground">
              東山高中學生自主發起、編輯與發行的文學誌。
            </p>
          </div>
        </div>
      </section>

      {/* ===== 核心理念 ===== */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <SectionTitle title="核心理念" />
          <div className="grid gap-px bg-foreground/20 md:grid-cols-3">
            {VALUES.map((item, i) => (
              <div key={item.title} className="flex flex-col gap-8 bg-background p-8 md:p-10">
                <span className="font-serif text-sm font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif text-2xl font-bold tracking-[0.12em]">{item.title}</h3>
                  <p className="font-serif text-[15px] leading-[2] text-foreground/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 宣言 ===== */}
      <section className="mx-auto max-w-3xl px-5 py-24 md:px-8 md:py-28">
        <h2 className="mb-12 text-center font-serif text-3xl font-bold tracking-[0.1em] md:text-4xl">為什麼我們需要文薈？</h2>
        <div className="flex flex-col gap-[0.8em] font-serif text-[18px] leading-[2.2] text-foreground/90 [&_p]:indent-[2em]">
          <p>
            文學不該只停留在考卷上的閱讀理解，或是課本裡的遠古經典。它應該是活生生的——是午後陣雨打在窗框上的聲音、是鐘聲響起時心底微小的悸動，也是青春裡那些尚未找到答案的迷惘。
          </p>
          <p>
            《東山文薈》由東山高中的學生自主發起與編輯。我們深信，每一個學生都有屬於自己的獨特視角與故事。透過散文、新詩、小說、採訪與漫畫，我們嘗試建立一個屬於我們的精神空間，紀錄這段無法重來的歲月。
          </p>
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/works"
            className="inline-flex min-h-12 items-center gap-3 border border-foreground px-7 font-serif text-[15px] tracking-[0.1em] transition-colors hover:bg-foreground hover:text-background"
          >
            閱讀所有作品
          </Link>
          <Link
            href="/submit"
            className="inline-flex min-h-12 items-center gap-3 bg-primary px-7 font-serif text-[15px] tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            參與徵稿 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
