import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 首頁封面影片：由瀏覽器直接傳到 Blob（不經過伺服器，所以不受 4.5MB 限制）
// 這支 API 只負責「發上傳許可」，而且只發給已登入後台的人
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("未登入或無權限上傳");
        // 限定資料夾與副檔名，檔案類型與大小也由 Blob 在上傳時檢查
        if (!/^hero\/[\w.-]+\.(mp4|webm|mov)$/i.test(pathname)) throw new Error("檔名不符合規定");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      // 上傳完成後的回呼：目前不需要額外處理
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "上傳失敗" }, { status: 400 });
  }
}
