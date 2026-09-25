import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response("未登入或無權限存取", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    let rows: any[] = [];

    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (ids.length > 0) {
        // 💡 加上 as any 轉型，解決 @vercel/postgres 範本字面值不接收純 string[] 的型別警告
        const result = await sql`
          SELECT * FROM submissions 
          WHERE id::text = ANY(${ids as any})
          ORDER BY created_at DESC
        `;
        rows = result.rows;
      }
    } else {
      const result = await sql`
        SELECT * FROM submissions 
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `;
      rows = result.rows;
    }

    if (rows.length === 0) {
      return new Response("沒有可匯出的稿件", { status: 400 });
    }

    const zip = new JSZip();
    const today = new Date().toISOString().split('T')[0];

    // 為每篇文章產生獨立的 Word (.doc) 檔並加入 ZIP 檔案中
    rows.forEach((row: any) => {
      const date = row.created_at ? new Date(row.created_at).toLocaleDateString('zh-TW') : '未提供日期';
      const author = row.author_name || row.author || '匿名';
      const classInfo = row.class ? `${row.class} ${row.seat_number || ''}號` : '未提供';
      const category = row.category || '未分類';
      const title = row.title || '無標題';

      let cleanContent = (row.content || '<p>（無內容）</p>')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\s*on\w+=\s*["'][^"']*["']/gi, '')
        .replace(/<img([^>]*)>/gi, (match: string, p1: string) => {
          return `<img ${p1} style="max-width: 100%; height: auto; display: block; margin: 12pt auto;" />`;
        });

      const singleWordDoc = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${title}</title>
          <style>
            @page {
              size: A4;
              margin: 2.54cm;
            }
            body { font-family: "PMingLiU", "新細明體", "Noto Serif TC", serif; padding: 20pt; }
            p { margin-bottom: 10pt; text-align: justify; line-height: 1.8; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 20pt;">
            <p style="font-size: 10pt; color: #666; margin-bottom: 4pt;">${category} ｜ 投稿時間：${date}</p>
            <h1 style="font-size: 20pt; font-family: 'PMingLiU', 'Noto Serif TC', serif; margin: 0 0 8pt 0; font-weight: bold;">
              ${title}
            </h1>
            <p style="font-size: 11pt; color: #333; margin: 0;">
              <b>作者：</b>${author} ｜ <b>班級座號：</b>${classInfo}
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 20pt;" />
          <div style="font-size: 12pt; line-height: 1.8; font-family: 'PMingLiU', 'Noto Serif TC', serif;">
            ${cleanContent}
          </div>
        </body>
        </html>
      `;

      // 過濾檔名中的特殊不合法字元
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_");
      const safeAuthor = author.replace(/[\\/:*?"<>|]/g, "_");
      const safeClass = (row.class || "未提供班級").replace(/[\\/:*?"<>|]/g, "_");
      const fileName = `${safeClass}_${row.seat_number || 0}號_${safeAuthor}_《${safeTitle}》.doc`;

      zip.file(fileName, singleWordDoc);
    });

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    const zipFilename = `東山文薈_學生投稿稿件包_${today}.zip`;
    const encodedFilename = encodeURIComponent(zipFilename);

    return new Response(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error: any) {
    console.error("Word 打包匯出失敗詳細原因:", error);
    return new Response(`匯出發生錯誤: ${error?.message || error}`, { status: 500 });
  }
}