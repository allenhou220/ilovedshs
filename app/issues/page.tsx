import type { Metadata } from 'next'
import Link from 'next/link'
import { getIssues } from '@/lib/queries'
import { issueHref } from '@/lib/text'
import { IssueCover, PageHeading } from '@/components/editorial'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '期刊',
  description: '東山文薈歷期刊物目錄。',
}

// 期刊總覽頁：列出所有期數與封面
export default async function IssuesPage() {
  const issues = await getIssues()

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <PageHeading mark="刊" title="歷期刊物" lead="每一期都是一段時間的切片。翻開任何一期，看看那時的我們在寫些什麼。" />

      {issues.length === 0 ? (
        <p className="py-20 text-center font-serif text-muted-foreground">目前還沒有設定期數的作品。</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 md:gap-x-10 lg:grid-cols-4">
          {issues.map((issue) => (
            <Link key={issue.name} href={issueHref(issue.name)} className="group flex flex-col gap-4">
              <IssueCover
                name={issue.name}
                theme={issue.theme}
                image={issue.cover_image_url}
                className="aspect-[3/4] transition-transform duration-500 group-hover:-translate-y-1.5"
              />
              <div className="flex flex-col gap-1">
                {issue.theme && (
                  <span className="font-serif text-lg font-bold tracking-[0.12em] transition-colors group-hover:text-primary">{issue.theme}</span>
                )}
                <span className="font-serif text-sm tracking-[0.15em] text-muted-foreground">
                  {issue.count} 篇作品{issue.authorCount > 0 ? `・${issue.authorCount} 位作者` : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
