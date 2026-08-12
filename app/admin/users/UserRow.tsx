"use client";

import { useTransition } from "react";
import { updateUserRoleAction, toggleUserNotificationAction, deleteUserAction } from "@/lib/actions";
import { Bell, BellOff, Trash2, Loader2 } from "lucide-react";

export default function UserRow({ user, isCurrentUser }: { user: any, isCurrentUser: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      updateUserRoleAction(user.id, e.target.value);
    });
  };

  const handleToggleNotify = () => {
    startTransition(() => {
      toggleUserNotificationAction(user.id, user.receive_notifications);
    });
  };

  const handleDelete = () => {
    if (confirm("確定要刪除此帳號嗎？")) {
      startTransition(() => {
        deleteUserAction(user.id);
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27272a] p-4 gap-4 transition-colors hover:bg-[#1f1f22]">
      
      {/* 左側：信箱與目前的角色標示 */}
      <div>
        <div className="font-bold text-white text-sm md:text-base">{user.email}</div>
        <div className="text-xs text-gray-500 mt-1">
          {user.role === 'admin' ? <span className="text-amber-500">總管理員</span> : '編輯'}
          {isCurrentUser && <span className="ml-2 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">你自己</span>}
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
              ? "bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20" 
              : "bg-gray-500/10 border-gray-500/50 text-gray-400 hover:bg-gray-500/20"
          }`}
        >
          {user.receive_notifications ? <Bell size={14} /> : <BellOff size={14} />}
          {user.receive_notifications ? "接收通知" : "拒絕通知"}
        </button>

        {/* 權限選單 */}
        <select
          value={user.role || 'editor'}
          onChange={handleRoleChange}
          disabled={isPending || isCurrentUser}
          className="bg-[#18181b] border border-[#27272a] text-white text-xs rounded px-2 py-1.5 cursor-pointer focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="editor">編輯 (老師/學生)</option>
          <option value="admin">總管理員</option>
        </select>

        {/* 刪除按鈕 */}
        {!isCurrentUser && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-900 text-red-500 rounded text-xs hover:bg-red-950 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : "刪除"}
          </button>
        )}
      </div>
    </div>
  );
}