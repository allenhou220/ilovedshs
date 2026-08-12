"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function SubmitEditor({ onChange }: { onChange: (html: string) => void }) {
  // 建立 BlockNote 編輯器實體
  const editor = useCreateBlockNote();

  return (
    <div className="min-h-[300px] rounded-md border border-[#333] bg-[#121212] py-4 cursor-text">
      <BlockNoteView
        editor={editor as any} // 💡 加上 as any 強制忽略套件版本造成的型別衝突
        theme="dark" // 維持深色模式
        onChange={async () => {
          // 當學生打字時，將編輯器內容即時轉換為 HTML 並往外傳
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html);
        }}
      />
    </div>
  );
}