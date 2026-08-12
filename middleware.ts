import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 從登入時發出的 JWT 讀取目前使用者的狀態（含 role）
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 沒登入 → 一律導去登入頁
  if (!token) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // /admin/users（帳號管理）只有總管理員能進，其他人導回後台首頁
  if (req.nextUrl.pathname.startsWith("/admin/users") && (token as any).role !== "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

// 只有符合這個規則的路徑會經過上面的檢查，其他頁面（首頁、/works 等公開頁）不受影響
export const config = {
  matcher: ["/admin/:path*"],
};