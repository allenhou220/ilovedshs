'use client';

import { useEffect, useRef } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { uploadEditorImageAction } from '@/lib/actions';

export default function BlockNoteEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadEditorImageAction(formData);
      return res.url || "";
    }
  });

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

  const handleEditorChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  };

  return (
    <BlockNoteView 
      editor={editor} 
      theme="dark" 
      onChange={handleEditorChange}
    />
  );
}