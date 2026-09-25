"use client";

import { useCreateBlockNote, useBlockNoteEditor } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { 
  FormattingToolbarController,
  FormattingToolbar,
  BlockTypeSelect,
  BasicTextStyleButton,
  blockTypeSelectItems
} from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// 💡 自訂選單：只保留「內文」與「標題」，徹底排除所有 List 與 Quote
function CustomBlockTypeSelect() {
  const editor = useBlockNoteEditor();
  
  const filteredItems = blockTypeSelectItems(editor.dictionary).filter((item) => {
    const type = (item.type || "").toLowerCase();
    const name = (item.name || "").toLowerCase();

    if (type.includes("list") || name.includes("list")) return false;
    if (type.includes("quote") || name.includes("quote")) return false;

    return true;
  });

  return <BlockTypeSelect items={filteredItems} />;
}

export default function SubmitEditor({ onChange }: { onChange: (html: string) => void }) {
  // 💡 不需引用 locales，直接覆蓋預設 Placeholder 內容
  const editor = useCreateBlockNote({
    dictionary: {
      placeholders: {
        default: "請在此輸入作品內容...",
      },
    } as any,
  });

  return (
    <div className="min-h-[300px] rounded-md border border-[#333] bg-[#121212] py-4 cursor-text">
      <BlockNoteView
        editor={editor as any}
        theme="dark"
        slashMenu={false}        // 1. 禁用斜線選單 (/)
        sideMenu={false}         // 2. 禁用左側 [+] 拖曳把手
        formattingToolbar={false} // 3. 停用預設格式列
        onChange={async () => {
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html);
        }}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <CustomBlockTypeSelect key="customBlockTypeSelect" />
              <BasicTextStyleButton basicTextStyle="bold" key="bold" />
              <BasicTextStyleButton basicTextStyle="italic" key="italic" />
              <BasicTextStyleButton basicTextStyle="underline" key="underline" />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>
    </div>
  );
}