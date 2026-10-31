'use client';

import { useEffect, useRef } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { uploadEditorImageAction } from '@/lib/actions';
import { compressImageFile } from '@/lib/compress-image';
import { useTheme } from 'next-themes';

export default function BlockNoteEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append('file', await compressImageFile(file)); // 內文插圖先壓縮再上傳
      const res = await uploadEditorImageAction(formData);
      if ("url" in res && res.url) return res.url;
      const message = "error" in res ? res.error : "圖片上傳失敗";
      alert(message);
      throw new Error(message);
    }
  });

  // 只在第一次載入時把既有 HTML 轉成編輯器內容，避免之後覆蓋使用者正在輸入的文字
  const initLoaded = useRef(false);

  useEffect(() => {
    async function loadInitialHTML() {
      if (initialContent && !initLoaded.current) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(initialContent);
          editor.replaceBlocks(editor.document, blocks);
          initLoaded.current = true;
        } catch (e) {
          console.error("載入舊文章內容失敗", e);
        }
      }
    }
    loadInitialHTML();
  }, [editor, initialContent]);

  // 內容變動時把編輯器內容轉成 HTML 回傳給外層表單
  const handleEditorChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  };

  return (
    <BlockNoteView 
      editor={editor} 
      theme={resolvedTheme === "dark" ? "dark" : "light"} 
      onChange={handleEditorChange}
    />
  );
}