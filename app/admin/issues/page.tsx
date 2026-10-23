import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { getIssues } from "@/lib/queries";
import { issueHref } from "@/lib/text";
import { IssueForm } from "./IssueForm";

export const dynamic = "force-dynamic";

export default async function AdminIssuesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const issues = await getIssues();

  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground sm:px-8 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft size={15} /> 返回後台總覽
        </Link>

        <header className="mb-10 border-b border-foreground pb-8">
          <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Issues ／ 期刊管理</p>
          <h1 className="font-serif text-3xl font-light tracking-[0.12em] sm:text-4xl">期刊管理</h1>
          <p className="mt-3 max-w-2xl font-serif text-sm leading-[1.9] text-muted-foreground">
            期數清單來自每篇文章的「期數」欄位。只要有文章設定了新的期數，這裡就會自動出現，再補上主題、卷首語與封面即可。沒有上傳封面時，會自動使用該期的精選文章圖片。
          </p>
        </header>

        {issues.length === 0 ? (
          <p className="py-16 text-center font-serif text-muted-foreground">
            還沒有任何文章設定期數。請先到「文章上架管理」編輯文章並填寫期數。
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {issues.map((issue) => (
              <div key={issue.name} className="flex flex-col gap-2">
                <IssueForm issue={issue} />
                <Link href={issueHref(issue.name)} className="self-end font-serif text-xs tracking-[0.1em] text-primary">
                  查看前台期刊頁 →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
