"use client";

import { useTransition } from "react";
import { updateUserRoleAction, toggleUserNotificationAction, deleteUserAction } from "@/lib/actions";
import { Bell, BellOff, Trash2, Loader2 } from "lucide-react";

export default function UserRow({ user, isCurrentUser }: { user: any, isCurrentUser: boolean }) {
  const [isPending, startTransition] = useTransition();

  // 操作失敗時跳出提示，不再無聲失敗
  const run = (task: () => Promise<unknown>, failMessage: string) => {
    startTransition(async () => {
      try {
        await task();
      } catch {
        alert(failMessage);
      }
    });
  };

  // 變更權限、開關通知、刪除帳號；實際的權限檢查都在伺服器端，前端按鈕只是介面
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    run(() => updateUserRoleAction(user.id, role), "修改權限失敗，請重新整理後再試");
  };

  const handleToggleNotify = () => {
    run(() => toggleUserNotificationAction(user.id, !!user.receive_notifications), "切換通知失敗，請重新整理後再試");
  };

  const handleDelete = () => {
    if (confirm("確定要刪除此帳號嗎？")) {
      run(() => deleteUserAction(user.id), "刪除帳號失敗，請重新整理後再試");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border p-4 gap-4 transition-colors hover:bg-card">
      
      {/* 左側：信箱與目前的角色標示 */}
      <div>
        <div className="font-bold text-foreground text-sm md:text-base">{user.email}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {user.role === 'admin' ? <span className="text-primary">總管理員</span> : '編輯'}
          {isCurrentUser && <span className="ml-2 bg-secondary text-foreground px-1.5 py-0.5 rounded">你自己</span>}
        </div>
      </div>

      {/* 右側：通知開關、權限選單、刪除按鈕 */}
      <div className="flex items-center gap-3">
        
        {/* 通知開關 */}
        <button
          onClick={handleToggleNotify}
          disabled={isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors border ${
            user.receive_notifications 
              ? "bg-emerald-600/10 border-emerald-700/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20" 
              : "bg-secondary border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {user.receive_notifications ? <Bell size={14} /> : <BellOff size={14} />}
          {user.receive_notifications ? "通知開啟" : "通知關閉"}
        </button>

        {/* 權限選單 */}
        <select
          value={user.role || 'editor'}
          onChange={handleRoleChange}
          disabled={isPending || isCurrentUser}
          className="bg-card border border-border text-foreground text-xs rounded px-2 py-1.5 cursor-pointer focus:outline-none focus:border-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="editor">編輯</option>
          <option value="admin">總管理員</option>
        </select>

        {/* 刪除按鈕 */}
        {!isCurrentUser && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/50 text-destructive rounded text-xs hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : "刪除"}
          </button>
        )}
      </div>
    </div>
  );
}