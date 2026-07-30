import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let work = null;

  try {
    const { rows } = await sql`SELECT * FROM works WHERE id = ${id}`;
    if (rows.length > 0) {
      work = rows[0];
    }
  } catch (error) {
    console.error("讀取文章詳細失敗:", error);
  }

  if (!work) {
    notFound();
  }

  const isPoetry = work.category === '新詩';
  const displayImage = work.image_url || work.image;

  return (
    <main>
      <style>{`
        .custom-article-content,
        .custom-article-content * {
          font-family: var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif) !important;
          font-variant-numeric: lining-nums tabular-nums !important;
          font-feature-settings: "lnum" 1, "tnum" 1 !important;
        }
        .custom-article-content h1,
        .custom-article-content h2,
        .custom-article-content h3 {
          font-family: var(--font-serif, Georgia, serif) !important;
        }
        .custom-article-content p:empty::before {
          content: "\\00A0"; 
        }
      `}</style>

      <article>
        <header className="mx-auto max-w-5xl px-5 pb-10 pt-16 text-center md:px-8 md:pb-14 md:pt-24">
          <Link
            href="/works"
            className="mb-12 inline-flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> 返回作品總覽
          </Link>

          <p className="mb-6 text-sm tracking-[0.25em] text-primary">
            {work.category || '散文'}
          </p>

          <h1 className="text-balance font-serif text-5xl font-black leading-tight md:text-7xl">
            {work.title}
          </h1>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <span className="font-medium text-foreground">{work.author || '匿名'}</span>
          </div>
        </header>

        {displayImage && (
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-muted">
              <img
                src={displayImage}
                alt={work.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className={`mx-auto px-5 py-16 md:py-24 ${isPoetry ? 'max-w-2xl text-center' : 'max-w-3xl'}`}>
          <div 
            className="
              custom-article-content
              text-lg leading-[2.15] md:text-xl text-foreground text-justify
              /* 💡 這裡將標題字級全面放大：H1 變成 text-5xl (原本是 4xl) */
              [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-black [&_h1]:mt-12 [&_h1]:mb-6
              [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-5
              [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-4
              [&_p]:mb-6 [&_p]:leading-relaxed
              [&_img]:mx-auto [&_img]:my-8 [&_img]:rounded-md [&_img]:max-w-full [&_img]:h-auto
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
            "
            dangerouslySetInnerHTML={{ __html: work.content || '' }}
          />

          <aside className="mt-20 border-y border-border py-8 text-center md:text-left">
            <p className="mb-3 text-xs tracking-[0.2em] text-primary">ABOUT THE AUTHOR</p>
            <p className="font-serif text-xl font-bold">{work.author || '匿名'}</p>
          </aside>
        </div>
      </article>

      <div className="border-t border-border py-12 text-center">
        <Link
          href="/works"
          className="inline-block border border-border px-8 py-3 text-sm font-serif rounded-sm transition-colors hover:bg-muted"
        >
          返回所有作品列表
        </Link>
      </div>
    </main>
  );
}