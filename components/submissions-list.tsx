"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";

// 💡 1. 接收從外層 page.tsx 傳進來的 onDelete (Server Action)
function formatDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

export default function SubmissionsList({ 
  submissions,
  onDelete 
}: { 
  submissions: any[];
  onDelete?: (id: number | string) => Promise<void>; 
}) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const filtered = submissions.filter((sub) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const title = (sub.title || "").toLowerCase();
    const author = (sub.author_name || "").toLowerCase();
    const email = (sub.email || "").toLowerCase();
    const studentClass = (sub.class || "").toLowerCase();
    const seat = String(sub.seat_number || "");

    return (
      title.includes(q) ||
      author.includes(q) ||
      email.includes(q) ||
      studentClass.includes(q) ||
      seat.includes(q)
    );
  });

  const handleDelete = async (id: number | string) => {
    if (!confirm('確定要刪除這篇投稿嗎？此動作無法復原。')) return;
    
    setDeletingId(id);
    try {
      if (onDelete) {
        await onDelete(id);
      }
    } catch (err) {
      alert("刪除失敗，請稍後再試。");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋標題、作者姓名、信箱、班級或座號..."
          className="w-full rounded-md border border-[#27272a] bg-[#121212] py-2 pl-10 pr-4 text-sm text-white placeholder-[#71717a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-md border border-[#27272a] bg-[#121212]">
          <p className="text-lg text-[#71717a]">
            {search ? "找不到符合搜尋條件的稿件喔！" : "目前信箱空空的，沒有待審核的稿件喔！"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((sub) => {
            return (
              <div
                key={sub.id}
                className="flex flex-col justify-between gap-6 rounded-md border border-[#27272a] bg-[#121212] p-6 transition-colors hover:border-[#3f3f46] md:flex-row md:items-center"
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-sm bg-[#27272a] px-2 py-1 text-xs tracking-widest text-[#a1a1aa]">
                      {sub.category}
                    </span>
                    <span className="text-xs text-[#71717a]">{formatDate(sub.created_at)} 投稿</span>
                  </div>

                  <h2 className="mb-2 font-serif text-xl font-bold text-white">
                    {sub.title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                    <span className="text-primary">{sub.class} {sub.seat_number}號</span>
                    <span>・</span>
                    <span className="font-medium text-white">{sub.author_name}</span>
                    <span>・</span>
                    <span className="text-xs">{sub.email}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col md:flex-row items-center gap-3">
                  {/* 💡 2. 刪除按鈕 */}
                  <button
                    type="button"
                    disabled={deletingId === sub.id}
                    onClick={() => handleDelete(sub.id)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 active:opacity-70 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="size-4" />
                    {deletingId === sub.id ? '刪除中...' : '刪除稿件'}
                  </button>

                  <Link
                    href={`/admin/submissions/${sub.id}`}
                    className="inline-block rounded-sm bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-200"
                  >
                    進入審核 👉
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}