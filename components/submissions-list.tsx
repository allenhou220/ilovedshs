"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteSubmissionAction, rejectSubmissionAction } from "@/lib/actions";
import { Trash2, Search, Download, CheckSquare, Square, X, PenLine, Ban } from "lucide-react";

interface SubmissionsListProps {
  submissions: any[];
  isAdmin?: boolean;
}

// 投稿列表：搜尋、標記「本期未收錄」、刪除；總管理員還能勾選多篇匯出成 Word
export default function SubmissionsList({ 
  submissions, 
  isAdmin = false 
}: SubmissionsListProps) {
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // 搜尋：比對標題、作者、信箱與班級
  const filteredSubmissions = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    return (
      (sub.title || "").toLowerCase().includes(term) ||
      (sub.author_name || sub.author || "").toLowerCase().includes(term) ||
      (sub.email || "").toLowerCase().includes(term) ||
      (sub.class || "").toLowerCase().includes(term)
    );
  });

  // 匯出模式：先進入勾選狀態，選好文章後再一次下載
  const handleStartExportMode = () => {
    setIsExportMode(true);
    setSelectedIds([]);
  };

  const handleCancelExportMode = () => {
    setIsExportMode(false);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 徹底刪除：會先跳出確認視窗，刪除後同步取消勾選
  const handleDelete = (id: number) => {
    if (confirm("確定刪除這份稿件？刪除後無法復原。")) {
      startTransition(async () => {
        try {
          await deleteSubmissionAction(id);
          setSelectedIds((prev) => prev.filter((item) => item !== id));
        } catch {
          alert("刪除失敗，請重新整理後再試");
        }
      });
    }
  };

  // 本期未收錄：從待審清單移除，但保留投稿紀錄
  const handleReject = (id: number, title: string) => {
    if (!confirm(`將《${title}》標記為未收錄？`)) return;
    startTransition(async () => {
      try {
        await rejectSubmissionAction(id);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } catch {
        alert("操作失敗，請重新整理後再試");
      }
    });
  };

  // 匯出：把勾選的稿件 id 交給匯出 API，瀏覽器會直接下載壓縮檔
  const handleConfirmExport = () => {
    if (selectedIds.length === 0) {
      alert("請先勾選要匯出的稿件");
      return;
    }
    const url = `/api/export-submissions-word?ids=${selectedIds.join(",")}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-8">
      {/* 頁面標題與右上方唯一匯出控制區 */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/60 pb-8 gap-6">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl text-foreground">
            投稿審核
          </h1>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-baseline mb-1">
            <span className="font-serif text-4xl sm:text-5xl font-light text-primary">
              {submissions.length}
            </span>
            <span className="ml-2 font-serif text-xs tracking-wider text-muted-foreground">
              篇待審核
            </span>
          </div>

          {/* 僅限總管理員（isAdmin）顯示右上角控制按鈕 */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {!isExportMode ? (
                <button
                  onClick={handleStartExportMode}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-serif text-xs tracking-wider rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Download size={14} />
                  匯出
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelExportMode}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted text-muted-foreground hover:text-foreground font-serif text-xs rounded-md transition-colors"
                  >
                    <X size={14} />
                    取消
                  </button>
                  <button
                    onClick={handleConfirmExport}
                    disabled={selectedIds.length === 0}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-serif text-xs tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Download size={14} />
                    確認匯出 ({selectedIds.length})
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 搜尋列與全選開關 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/80">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋標題、作者、信箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border/80 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 匯出模式下僅保留「全選」按鈕 */}
        {isAdmin && isExportMode && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center gap-2 text-xs font-serif text-muted-foreground hover:text-foreground transition-colors"
            >
              {selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} />
              )}
              全選 ({selectedIds.length}/{filteredSubmissions.length})
            </button>
          </div>
        )}
      </div>

      {/* 稿件列表 */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-xl">
          <p className="font-serif text-sm text-muted-foreground">目前尚無符合條件的投稿稿件。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const date = item.created_at ? new Date(item.created_at).toLocaleDateString("zh-TW") : "";
            const author = item.author_name || item.author || "匿名";
            const classInfo = item.class ? `${item.class} ${item.seat_number || ""}號` : "未提供";

            return (
              <div
                key={item.id}
                onClick={() => isExportMode && handleToggleSelect(item.id)}
                className={`p-5 rounded-xl border transition-all ${
                  isExportMode ? "cursor-pointer" : ""
                } ${
                  isExportMode && isSelected
                    ? "bg-primary/5 border-primary/50 shadow-sm"
                    : "bg-card border-border/70 hover:border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* 點擊匯出後顯示的勾選框 */}
                  {isAdmin && isExportMode && (
                    <div className="mt-1 text-muted-foreground shrink-0">
                      {isSelected ? (
                        <CheckSquare size={20} className="text-primary" />
                      ) : (
                        <Square size={20} />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="px-2 py-0.5 bg-muted rounded text-[11px] font-medium">
                        {item.category || "散文"}
                      </span>
                      <span>投稿時間：{date}</span>
                      {item.is_anonymous && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          （匿名）
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-serif font-semibold text-foreground truncate">
                      {item.title || "無標題"}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1">
                      <b>作者：</b>{author} ｜ <b>班級座號：</b>{classInfo} ｜ <b>信箱：</b>{item.email}
                    </p>

                    <div className="mt-3 text-sm text-foreground/80 font-serif line-clamp-2 bg-muted/30 p-3 rounded-md border border-border/40">
                      {item.content?.replace(/<[^>]*>/g, "") || "（無內文）"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/submissions/${item.id}`}
                      className="inline-flex min-h-9 items-center gap-1.5 bg-foreground px-3 text-xs text-background transition-opacity hover:opacity-90"
                    >
                      <PenLine size={14} />
                      審核／發布
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleReject(item.id, item.title || "無標題")}
                      disabled={isPending}
                      className="inline-flex min-h-9 items-center gap-1.5 border border-border px-3 text-xs text-foreground transition-colors hover:border-foreground disabled:opacity-50"
                    >
                      <Ban size={14} />
                      未收錄
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="inline-flex min-h-9 items-center gap-1.5 px-3 text-xs text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}