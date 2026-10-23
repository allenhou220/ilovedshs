import { sql } from "@vercel/postgres"
import Link from 'next/link'
import { WorkCard } from '@/components/work-card'
import LoginModal from '@/components/login-modal'
import { IssueCover, ManuscriptTitle, SectionTitle } from '@/components/editorial'
import { getIssue, getIssues, getSiteSettings, getSubmissionStatus, toSummary } from "@/lib/queries"
import { issueHref, workHref } from "@/lib/text"

export const dynamic = 'force-dynamic'

function upcomingDeadline(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
  if (value < today) return null
  const [, m, d] = value.split('-').map(Number)
  return `${m} 月 ${d} 日`
}

export default async function Page() {
  let works: any[] = []
  let settings: any = null
  let issues: Awaited<ReturnType<typeof getIssues>> = []
  let isSubmissionOpen = true
  let categoryCounts: Record<string, number> = {}

  try {
    // 首頁只需要「精選 1 篇 + 最新 3 篇」，而且只取前段內文做摘要
    const [worksResult, siteSettings, issueList, open, cats] = await Promise.all([
      sql`
        SELECT id, title, author, category, issue, source_type, image_url, featured,
               LEFT(content, 3000) AS content
        FROM works
        WHERE featured = true OR id IN (
          SELECT id FROM works ORDER BY sort_order ASC NULLS LAST, id DESC LIMIT 4
        )
        ORDER BY sort_order ASC NULLS LAST, id DESC
      `,
      getSiteSettings(),
      getIssues(),
      getSubmissionStatus(),
      sql`SELECT COALESCE(category, '散文') AS category, COUNT(*)::int AS count FROM works GROUP BY 1`,
    ])
    works = worksResult.rows
    settings = siteSettings
    issues = issueList
    isSubmissionOpen = open
    categoryCounts = Object.fromEntries(cats.rows.map((r: any) => [r.category, r.count]))
  } catch (error) {
    console.error("讀取資料庫失敗:", error)
  }

  if (works.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="font-serif tracking-widest text-muted-foreground">目前還沒有發布任何文章，請先到後台新增。</p>
        <div className="mt-8">
          <LoginModal />
        </div>
      </main>
    )
  }

  const rawFeatured = works.find((w) => w.featured) || works[0]
  const featuredWork = toSummary(rawFeatured, 260)
  const latestWorks = works.filter((w) => w.id !== rawFeatured.id).slice(0, 3).map((w) => toSummary(w, 110))

  // 本期目錄：最新一期的作品
  const currentIssue = issues[0]
  const currentIssueDetail = currentIssue ? await getIssue(currentIssue.name).catch(() => null) : null
  const toc = currentIssueDetail ? currentIssueDetail.grouped.flatMap((g) => g.items).slice(0, 10) : []

  const heroTitle: string = settings?.hero_title || '在鐘聲\n停下以前'
  const issueInfo: string = settings?.issue_info || currentIssue?.name || ''
  const issueYear: string = settings?.issue_year || ''
  const deadline = upcomingDeadline(settings?.submission_deadline)

  return (
    <main className="flush-footer">
      {/* ================= 本期專題 ================= */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <p className="font-serif text-sm font-bold tracking-[0.1em] text-primary">
              {[issueInfo || '本期專題', issueYear].filter(Boolean).join('　')}
            </p>
            <ManuscriptTitle text={heroTitle} />
            <div className="flex max-w-[26rem] flex-col gap-6">
              <p className="font-serif text-[17px] leading-[2.05] text-foreground/85">
                {settings?.hero_subtitle || '我們以文字留住放學後的光、雨季裡的窗，以及那些還來不及說出口的青春。'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={workHref(featuredWork)}
                  className="inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-serif text-[15px] tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  閱讀首選 <span aria-hidden="true">→</span>
                </Link>
                {currentIssue && (
                  <Link
                    href={issueHref(currentIssue.name)}
                    className="inline-flex min-h-12 items-center gap-3 border border-foreground px-6 font-serif text-[15px] tracking-[0.1em] transition-colors hover:bg-foreground hover:text-background"
                  >
                    本期目錄
                  </Link>
                )}
              </div>
            </div>
          </div>

          <figure className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings?.hero_image_url || "/images/hero-library.png"}
                alt={settings?.cover_story_title || '本期封面'}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <figcaption className="flex items-baseline justify-between gap-4 font-serif text-sm tracking-[0.15em] text-muted-foreground">
              <span>{settings?.cover_story_title || '本期封面'}</span>
              {currentIssue && <span>收錄 {currentIssue.count} 篇作品</span>}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= 本期目錄 ================= */}
      {toc.length > 0 && currentIssue && (
        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-24">
          <div>
            <SectionTitle title="本期目錄" sub={currentIssue.name} link={{ href: issueHref(currentIssue.name), label: '完整期刊' }} />
            <ol className="grid gap-x-16 md:grid-cols-2">
              {toc.map((item, i) => (
                <li key={item.id} className="border-b border-foreground/20">
                  <Link href={workHref(item)} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-4">
                    <span className="font-serif text-base text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-serif text-[1.2rem] font-bold tracking-[0.06em] transition-colors group-hover:text-primary">{item.title}</span>
                      <span className="font-serif text-xs tracking-[0.1em] text-muted-foreground">
                        {item.category}・{item.readLabel}
                      </span>
                    </span>
                    <span className="font-serif text-sm tracking-[0.2em] text-foreground/80">{item.author}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ================= 編輯精選 ================= */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-24">
        <SectionTitle title="編輯精選" />
        <WorkCard work={featuredWork} featured />
      </section>

      {/* ================= 最新作品 ================= */}
      {latestWorks.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-24">
          <SectionTitle title="最新作品" link={{ href: '/works', label: '所有作品' }} />
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-3">
            {latestWorks.map((work) => <WorkCard key={work.id} work={work} />)}
          </div>
        </section>
      )}

      {/* ================= 期刊 ================= */}
      {issues.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-24">
          <SectionTitle title="期刊" link={{ href: '/issues', label: '歷期刊物' }} />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {issues.slice(0, 4).map((issue) => (
              <Link key={issue.name} href={issueHref(issue.name)} className="group flex flex-col gap-3">
                <IssueCover
                  name={issue.name}
                  theme={issue.theme}
                  image={issue.cover_image_url}
                  className="aspect-[3/4] transition-transform duration-500 group-hover:-translate-y-1.5"
                />
                <span className="font-serif text-sm tracking-[0.15em] text-muted-foreground">
                  {issue.theme ? `${issue.theme}・` : ''}{issue.count} 篇
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= 投稿 ================= */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1fr_auto] md:items-end md:px-8 md:py-20">
          <div className="flex flex-col gap-5">
            <p className="font-serif text-sm font-bold tracking-[0.1em] text-primary-foreground/80">
              {isSubmissionOpen ? '徵稿中' : '暫停徵稿'}
              {isSubmissionOpen && deadline && <span className="ml-3 font-normal">截稿：{deadline}</span>}
            </p>
            <h2 className="font-serif text-4xl font-bold leading-[1.35] tracking-[0.04em] md:text-5xl">
              {isSubmissionOpen ? <>把你的故事，<br className="md:hidden" />交給我們。</> : <>下一期，<br className="md:hidden" />再見。</>}
            </h2>
            <p className="max-w-xl font-serif text-[15px] leading-[2] text-primary-foreground/85">
              散文、新詩、小說、採訪，用學校信箱就能直接投稿。每一篇都會被編輯仔細讀過。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isSubmissionOpen && (
              <Link href="/submit" className="inline-flex min-h-[52px] items-center gap-3 bg-primary-foreground px-8 font-serif text-[15px] font-bold tracking-[0.12em] text-primary transition-opacity hover:opacity-90">
                我要投稿 <span aria-hidden="true">→</span>
              </Link>
            )}
            <Link href="/about" className="inline-flex min-h-[52px] items-center border border-primary-foreground px-8 font-serif text-[15px] tracking-[0.12em] transition-colors hover:bg-primary-foreground hover:text-primary">
              認識文薈
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
