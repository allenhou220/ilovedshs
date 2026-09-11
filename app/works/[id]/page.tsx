import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 💡 1. 這裡的 id 現在其實接到的會是「文章標題」
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // 將網址編碼轉換回原本的中文字
  const decodedTitle = decodeURIComponent(id); 
  
  try {
    // 💡 改用 title 去資料庫搜尋
    const { rows } = await sql`SELECT title, author, content, image_url FROM works WHERE title = ${decodedTitle}`;
    if (rows.length > 0) {
      const work = rows[0];
      const cleanDesc = (work.content || '').replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 100);
      const displayImage = work.image_url;
      return {
        title: work.title,
        description: cleanDesc || `${work.author || '匿名'} 的作品`,
        openGraph: {
          title: `${work.title}｜東山文薈`,
          description: cleanDesc,
          images: displayImage ? [{ url: displayImage }] : [],
        },
      };
    }
  } catch (error) {
    console.error("生成 Metadata 失敗:", error);
  }
  return { title: '作品詳情｜東山文薈' };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 將網址編碼轉換回原本的中文字
  const decodedTitle = decodeURIComponent(id);

  let work = null;

  try {
    // 💡 2. 改用 title 去資料庫搜尋對應的文章
    const { rows } = await sql`SELECT * FROM works WHERE title = ${decodedTitle}`;
    if (rows.length > 0) {
      work = rows[0];
    }
  } catch (error) {
    console.error("讀取文章詳細失敗:", error);
  }

  if (!work) {
    notFound();
  }

  const isComic = work.category === '漫畫';
  const isPoetry = work.category === '新詩';
  const displayImage = work.image_url;

  const comicImages: string[] = [];
  if (isComic && work.content) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = imgRegex.exec(work.content)) !== null) {
      comicImages.push(match[1]);
    }
  }

  const cleanContent = (work.content || '')
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '') 
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')     
    .replace(/<p>\s*<\/p>/gi, '');             

  return (
    <main className="min-h-screen bg-background text-foreground pb-[calc(6rem+env(safe-area-inset-bottom))]">
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

          <h1 className="text-balance font-serif text-3xl font-light leading-tight tracking-wide sm:text-5xl md:text-6xl text-foreground">
            {work.title}
          </h1>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <span className="font-medium text-foreground/80">{work.author || '匿名'}</span>
          </div>
        </header>

        {displayImage && !isComic && (
          <div className="mx-auto max-w-5xl px-5 md:px-8 mb-12">
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-muted">
              <img src={displayImage} alt={work.title} className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        {isComic ? (
          <section className="mx-auto max-w-3xl px-0 md:px-4">
            <div className="flex flex-col items-center bg-black/90 p-0 md:rounded-md md:border md:border-border/40 overflow-hidden shadow-2xl">
              {comicImages.length > 0 ? (
                comicImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`${work.title} - 第 ${index + 1} 頁`}
                    className="w-full h-auto block object-contain select-none"
                    loading="lazy"
                  />
                ))
              ) : (
                <div 
                  className="w-full [&_img]:w-full [&_img]:h-auto [&_img]:block"
                  dangerouslySetInnerHTML={{ __html: cleanContent }}
                />
              )}
            </div>
            <aside className="mt-16 mx-5 border-y border-border py-8 text-center md:text-left">
              <p className="mb-3 text-xs tracking-[0.2em] text-primary">ABOUT THE AUTHOR</p>
              <p className="font-serif text-xl font-bold">{work.author || '匿名'}</p>
            </aside>
          </section>
        ) : (
          <div className={`mx-auto px-5 py-16 md:py-24 ${isPoetry ? 'max-w-2xl text-center' : 'max-w-3xl'}`}>
            <div 
              className="
                custom-article-content
                text-lg leading-[2.15] md:text-xl text-foreground text-justify
                [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-light [&_h1]:mt-12 [&_h1]:mb-6
                [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-normal [&_h2]:mt-10 [&_h2]:mb-5
                [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-normal [&_h3]:mt-8 [&_h3]:mb-4
                [&_p]:!m-0 
                [&_img]:mx-auto [&_img]:my-8 [&_img]:rounded-md [&_img]:max-w-full [&_img]:h-auto
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
              "
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
            <aside className="mt-20 border-y border-border py-8 text-center md:text-left">
              <p className="mb-3 text-xs tracking-[0.2em] text-primary">ABOUT THE AUTHOR</p>
              <p className="font-serif text-xl font-bold">{work.author || '匿名'}</p>
            </aside>
          </div>
        )}
      </article>

      <div className="border-t border-border py-12 text-center mt-16">
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