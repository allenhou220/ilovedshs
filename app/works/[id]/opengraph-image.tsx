import { ImageResponse } from "next/og";
import { sql } from "@vercel/postgres";
import { isPublicAuthor } from "@/lib/text";

// 作品分享預覽圖：貼到 LINE、FB、IG 限動時顯示的那張圖，依每篇作品自動產生（稿紙風格）
export const alt = "東山文薈 作品";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F4EFE6";
const INK = "#201C18";
const RED = "#AF3327";
const MUTED = "#6B6158";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// 和文章頁相同的找法：先用標題，找不到且是數字就用 id
async function findWork(param: string) {
  const key = safeDecode(param);
  const byTitle = await sql`SELECT title, author, category, issue, image_url FROM works WHERE title = ${key} ORDER BY id DESC LIMIT 1`;
  if (byTitle.rows[0]) return byTitle.rows[0];
  if (/^\d+$/.test(key)) {
    const byId = await sql`SELECT title, author, category, issue, image_url FROM works WHERE id = ${Number(key)}`;
    if (byId.rows[0]) return byId.rows[0];
  }
  return null;
}

// 中文字型：只向 Google Fonts 下載這張圖用得到的字（檔案很小）
async function loadFont(text: string, weight: 400 | 700) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error("找不到字型檔");
  const res = await fetch(match[1]);
  if (!res.ok) throw new Error("字型下載失敗");
  return res.arrayBuffer();
}

// 標題越長字越小，最長的標題也排得進去
function titleSize(title: string) {
  const n = Array.from(title).length;
  if (n <= 6) return 104;
  if (n <= 10) return 88;
  if (n <= 16) return 72;
  if (n <= 24) return 60;
  return 50;
}

export default async function Image({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params;
  const work = await findWork(id).catch(() => null);

  const title = String(work?.title || "東山文薈");
  const author = work ? (isPublicAuthor(work.author) ? String(work.author) : "匿名") : "";
  const category = String(work?.category || "");
  const issue = String(work?.issue || "");
  const image = typeof work?.image_url === "string" && /^https:\/\//.test(work.image_url) ? work.image_url : "";

  const label = ["東山文薈", issue].filter(Boolean).join("・");
  const byline = author ? `文／${author}` : "東山高中 學生文學刊物";
  const allText = [title, label, byline, category, "東山文薈", "ilovedshs.vercel.app"].join("");

  // 字型下載失敗時仍然產生圖片（改用內建字型），不讓分享預覽整個壞掉
  let fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] = [];
  try {
    const [bold, regular] = await Promise.all([loadFont(allText, 700), loadFont(allText, 400)]);
    fonts = [
      { name: "Serif", data: bold, weight: 700, style: "normal" },
      { name: "Serif", data: regular, weight: 400, style: "normal" },
    ];
  } catch (error) {
    console.error("分享預覽圖字型載入失敗:", error);
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, fontFamily: "Serif", color: INK }}>
        {/* 左：文字 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 64px 56px 72px" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: RED, letterSpacing: 4 }}>{label}</div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: titleSize(title), fontWeight: 700, lineHeight: 1.25, letterSpacing: 2 }}>{title}</div>
            <div style={{ display: "flex", width: 72, height: 4, background: RED, marginTop: 36, marginBottom: 28 }} />
            <div style={{ display: "flex", fontSize: 32, color: MUTED, letterSpacing: 4 }}>{byline}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {category ? (
              <div style={{ display: "flex", border: `2px solid ${RED}`, color: RED, fontSize: 26, fontWeight: 700, padding: "6px 18px", letterSpacing: 4 }}>
                {category}
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}
            <div style={{ display: "flex", fontSize: 22, color: MUTED, letterSpacing: 1 }}>ilovedshs.vercel.app</div>
          </div>
        </div>

        {/* 右：作品圖片（沒有圖片時是一條朱紅色邊） */}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" width={440} height={630} style={{ width: 440, height: 630, objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", width: 24, height: "100%", background: RED }} />
        )}
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
