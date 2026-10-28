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
import * as locales from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();
  // 使用完整的繁體中文字典，只覆蓋輸入框提示文字
  // （若只給 placeholders，格式列會讀不到其他文字而當掉）
  const editor = useCreateBlockNote({
    dictionary: {
      ...locales.zhTW,
      placeholders: {
        ...locales.zhTW.placeholders,
        default: "請在此輸入作品內容...",
        emptyDocument: "請在此輸入作品內容...",
      },
    },
  });

  return (
    <div className="min-h-[300px] rounded-md border border-border bg-background py-4 cursor-text">
      <BlockNoteView
        editor={editor as any}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
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