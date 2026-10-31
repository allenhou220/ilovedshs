import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { getIssues } from "@/lib/queries";
import { issueHref } from "@/lib/text";
import { IssueForm } from "./IssueForm";

export const dynamic = "force-dynamic";

// 期刊管理頁：列出各期並可編輯封面、主題與簡介
export default async function AdminIssuesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const issues = await getIssues();

  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground sm:px-8 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 font-serif text-xs tracking-widest text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft size={15} /> 返回後台
        </Link>

        <header className="mb-10 border-b border-foreground pb-8">
          <h1 className="font-serif text-3xl font-light tracking-[0.12em] sm:text-4xl">期刊管理</h1>
        </header>

        {issues.length === 0 ? (
          <p className="py-16 text-center font-serif text-muted-foreground">
            尚無期數。文章填寫期數後會出現在這裡。
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
