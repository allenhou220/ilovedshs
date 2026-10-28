import { sql } from "@vercel/postgres";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReadingProgress } from '@/components/reading-progress';
import { ReadingTools } from '@/components/reading-tools';
import { getRelatedWorks } from '@/lib/queries';
import { Seal, WorkPlaceholder } from '@/components/editorial';
import type { Metadata } from 'next';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { authorHref, isPublicAuthor, issueHref, makeExcerpt, readingStats, workHref } from '@/lib/text';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 網址裡的參數可能已經被解碼過，標題含有「%」時再解碼一次會出錯，所以要包一層保護
function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// 以標題找文章；若找不到且網址是數字，再以 id 找（相容舊的 /works/12 連結）
async function findWork(param: string) {
  const key = safeDecode(param);
  const byTitle = await sql`SELECT * FROM works WHERE title = ${key} ORDER BY id DESC LIMIT 1`;
  if (byTitle.rows[0]) return byTitle.rows[0];

  if (/^\d+$/.test(key)) {
    const byId = await sql`SELECT * FROM works WHERE id = ${Number(key)}`;
    if (byId.rows[0]) return byId.rows[0];
  }
  return null;
}

// 分享用的頁面資訊：瀏覽器分頁標題、搜尋結果與社群分享時顯示的摘要和圖片
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const work = await findWork(id);
    if (work) {
      const cleanDesc = makeExcerpt(work.content || '', 100);
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

// 文章頁：讀取文章、判斷文體（漫畫、新詩有各自的排版），再輸出標題區、內文、作者、上下篇與延伸閱讀
export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let work: any = null;
  let prevWork: any = null;
  let nextWork: any = null;

  try {
    // 1. 讀取當前文章內容
    work = await findWork(id);

    // 2. 撈取所有作品的 id 與標題，使用與總覽頁一模一樣的排序規則
    if (work) {
      const { rows: allWorks } = await sql`
        SELECT id, title FROM works
        ORDER BY sort_order ASC NULLS LAST, id DESC
      `;

      // 3. 計算當前文章的前後關係（用 id 比對，避免同名文章搞混）
      const currentIndex = allWorks.findIndex((w) => w.id === work.id);
      if (currentIndex > 0) {
        prevWork = allWorks[currentIndex - 1]; // 上一篇
      }
      if (currentIndex !== -1 && currentIndex < allWorks.length - 1) {
        nextWork = allWorks[currentIndex + 1]; // 下一篇
      }
    }
  } catch (error) {
    console.error("讀取文章詳細失敗:", error);
  }

  if (!work) {
    notFound();
  }

  const isComic = work.category === '漫畫';
  const isPoetry = work.category === '新詩';
  const isStudent = (work.source_type || '') === '學生投稿';
  const author: string = work.author || '匿名';
  const displayImage = work.image_url;

  // 先過濾掉危險的 HTML（script、onerror 等），再拿來顯示
  const safeContent = sanitizeHtml(work.content || '');
  const stats = readingStats(safeContent, work.category);

  // 漫畫：把內文裡的圖片網址一張張取出，逐頁顯示
  const comicImages: string[] = [];
  if (isComic && safeContent) {
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    let match;
    while ((match = imgRegex.exec(safeContent)) !== null) {
      comicImages.push(match[1]);
    }
  }

  // 清掉編輯器產生的空白段落，避免內文出現多餘的空行
  const cleanContent = safeContent
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '')
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '');

  // 延伸閱讀，以及這位作者的作品總數（匿名不計算）
  const related = await getRelatedWorks({ id: work.id, author, category: work.category, issue: work.issue });
  const authorWorkCount = isPublicAuthor(author)
    ? Number((await sql`SELECT COUNT(*)::int AS n FROM works WHERE author = ${author}`).rows[0]?.n || 0)
    : 0;

  const issueLabel = isStudent ? '學生投稿' : work.issue || '';

  return (
    <main className="pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <ReadingProgress targetId="article-body" />

      <article>
        {/* ===== 標題區 ===== */}
        <header className="border-b-2 border-foreground">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-5 pb-12 pt-12 text-center md:px-8 md:pb-16 md:pt-20">
            <nav aria-label="麵包屑" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-serif text-[13px] tracking-[0.1em] text-muted-foreground">
              <Link href="/works" className="transition-colors hover:text-primary">作品</Link>
              <span aria-hidden="true">／</span>
              <Link href={`/works?category=${encodeURIComponent(work.category || '散文')}`} className="font-bold text-primary">
                {work.category || '散文'}
              </Link>
              {issueLabel && (
                <>
                  <span aria-hidden="true">／</span>
                  {work.issue && !isStudent ? (
                    <Link href={issueHref(work.issue)} className="transition-colors hover:text-primary">{issueLabel}</Link>
                  ) : (
                    <span>{issueLabel}</span>
                  )}
                </>
              )}
            </nav>

            <h1 className="text-balance font-serif text-4xl font-bold leading-[1.4] tracking-[0.12em] sm:text-5xl md:text-[3.6rem]">
              {work.title}
            </h1>

            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-foreground/40" />
              {isPublicAuthor(author) ? (
                <Link href={authorHref(author)} className="font-serif text-lg tracking-[0.12em] transition-colors hover:text-primary">
                  {author}
                </Link>
              ) : (
                <span className="font-serif text-lg tracking-[0.12em] text-muted-foreground">匿名</span>
              )}
              <span aria-hidden="true" className="h-px w-10 bg-foreground/40" />
            </div>

            <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-serif text-[13px] tracking-[0.2em] text-muted-foreground">
              {isComic ? (
                <span>共 {stats.pages || comicImages.length} 頁</span>
              ) : (
                <>
                  <span>閱讀約 {stats.minutes} 分鐘</span>
                  <span aria-hidden="true">・</span>
                  <span>{stats.chars.toLocaleString('zh-TW')} 字</span>
                </>
              )}
            </p>
          </div>
        </header>

        {/* 文章主圖（漫畫的圖片就是內文，所以不重複顯示） */}
        {displayImage && !isComic && (
          <div className="mx-auto max-w-5xl px-5 pt-12 md:px-8 md:pt-16">
            <div className="relative aspect-video w-full overflow-hidden border border-foreground/15 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayImage} alt={work.title} className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        <div id="article-body" className="pt-10 md:pt-14">
          {!isComic && (
            <div className="mx-auto max-w-3xl px-5 md:px-8">
              <ReadingTools title={work.title} />
            </div>
          )}

          {isComic ? (
            // 漫畫：圖片由上而下排列；萬一抓不到圖片網址，就直接顯示原本的內文
            <section className="mx-auto max-w-3xl px-0 md:px-4">
              <div className="flex flex-col items-center overflow-hidden border-2 border-foreground bg-foreground">
                {comicImages.length > 0 ? (
                  comicImages.map((src, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={index}
                      src={src}
                      alt={`${work.title} - 第 ${index + 1} 頁`}
                      className="block h-auto w-full select-none object-contain"
                      loading="lazy"
                    />
                  ))
                ) : (
                  <div
                    className="w-full [&_img]:block [&_img]:h-auto [&_img]:w-full"
                    dangerouslySetInnerHTML={{ __html: cleanContent }}
                  />
                )}
              </div>
            </section>
          ) : (
            // 小說、散文、新詩：新詩較窄且置中；內文的樣式用 [&_p] 這類寫法統一套用到編輯器產生的標籤上
            <div className={`mx-auto px-5 py-12 md:px-8 md:py-16 ${isPoetry ? 'max-w-2xl' : 'max-w-[42rem]'}`}>
              <div
                id="article-text"
                className={`
                  article-body font-serif leading-[2.15] tracking-[0.04em] text-foreground ${isPoetry ? 'text-center' : 'text-justify [&_p]:indent-[2em] [&_p+p]:!mt-[0.7em]'}
                  [&_h1]:mb-6 [&_h1]:mt-12 [&_h1]:text-[1.6em] [&_h1]:font-bold
                  [&_h2]:mb-5 [&_h2]:mt-10 [&_h2]:text-[1.35em] [&_h2]:font-bold
                  [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:text-[1.15em] [&_h3]:font-bold
                  [&_p]:!m-0
                  [&_img]:mx-auto [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full
                  [&_blockquote]:my-8 [&_blockquote]:border-y [&_blockquote]:border-primary/40 [&_blockquote]:py-4 [&_blockquote]:text-center [&_blockquote]:text-[1.1em] [&_blockquote]:text-primary
                  [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6
                  [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6
                  [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4
                `}
                dangerouslySetInnerHTML={{ __html: cleanContent }}
              />
              <p className="mt-16 flex justify-center" aria-hidden="true">
                <Seal size="sm">完</Seal>
              </p>
            </div>
          )}

          {/* ===== 關於作者 ===== */}
          <aside className="mx-auto max-w-3xl px-5 py-8 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-5 border-y-2 border-foreground py-6">
              <div className="flex items-center gap-4">
                <Seal size="lg">{Array.from(author)[0] || '匿'}</Seal>
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-xs tracking-[0.12em] text-muted-foreground">作者</span>
                  <span className="font-serif text-2xl font-bold tracking-[0.2em]">{author}</span>
                  {authorWorkCount > 0 && (
                    <span className="font-serif text-sm text-muted-foreground">在文薈發表過 {authorWorkCount} 篇作品</span>
                  )}
                </div>
              </div>
              {isPublicAuthor(author) && authorWorkCount > 1 && (
                <Link
                  href={authorHref(author)}
                  className="inline-flex min-h-11 items-center border border-foreground px-5 font-serif text-sm tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
                >
                  更多作品 →
                </Link>
              )}
            </div>
          </aside>
        </div>
      </article>

      {/* ===== 上一篇 / 下一篇 ===== */}
      {(prevWork || nextWork) && (
        <nav aria-label="上下篇" className="mx-auto mt-10 grid max-w-5xl gap-4 px-5 md:grid-cols-2 md:px-8">
          {prevWork ? (
            <Link href={workHref(prevWork)} className="group flex flex-col gap-2 border border-foreground/25 p-6 transition-colors hover:border-foreground">
              <span className="font-serif text-xs tracking-[0.12em] text-muted-foreground">← 上一篇</span>
              <span className="line-clamp-1 font-serif text-lg font-bold tracking-[0.06em] transition-colors group-hover:text-primary">{prevWork.title}</span>
            </Link>
          ) : <span />}
          {nextWork && (
            <Link href={workHref(nextWork)} className="group flex flex-col gap-2 border border-foreground/25 p-6 text-right transition-colors hover:border-foreground">
              <span className="font-serif text-xs tracking-[0.12em] text-muted-foreground">下一篇 →</span>
              <span className="line-clamp-1 font-serif text-lg font-bold tracking-[0.06em] transition-colors group-hover:text-primary">{nextWork.title}</span>
            </Link>
          )}
        </nav>
      )}

      {/* ===== 相關文章 ===== */}
      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-5 md:px-8">
          <div className="mb-10 flex items-end justify-between border-b-2 border-foreground pb-4">
            <h2 className="font-serif text-[1.7rem] font-bold tracking-[0.18em]">延伸閱讀</h2>
            <Link href="/works" className="font-serif text-sm tracking-[0.18em] text-primary">所有作品 →</Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={workHref(r)} className="group flex flex-col gap-3">
                <div className="aspect-[3/2] overflow-hidden border border-foreground/15">
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  ) : (
                    <WorkPlaceholder category={r.category} title={r.title} />
                  )}
                </div>
                <span className="font-serif text-[13px] tracking-[0.2em] text-primary">{r.reason}</span>
                <span className="font-serif text-xl font-bold leading-[1.45] tracking-[0.05em] transition-colors group-hover:text-primary">{r.title}</span>
                <span className="font-serif text-sm tracking-[0.15em] text-muted-foreground">文／{r.author}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
