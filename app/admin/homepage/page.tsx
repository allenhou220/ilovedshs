import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";
import HomepageForm from "./HomepageForm";

export const dynamic = "force-dynamic";

export default async function HomepageSettings() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <Link
        href="/admin"
        className="mb-8 inline-flex min-h-11 items-center font-serif text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        ← 返回後台
      </Link>

      <header className="mb-10 flex flex-col gap-3 border-b border-foreground pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-[0.04em] md:text-4xl">首頁設定</h1>
      </header>

      <HomepageForm
        initial={{
          issueInfo: settings?.issue_info || "",
          issueYear: settings?.issue_year || "",
          heroTitle: settings?.hero_title || "",
          heroSubtitle: settings?.hero_subtitle || "",
          heroImage: settings?.hero_image_url || "",
          submissionDeadline: settings?.submission_deadline || "",
        }}
      />
    </main>
  );
}
