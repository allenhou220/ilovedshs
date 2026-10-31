"use client";

import { Component, useMemo, type ReactNode } from "react";
import { useCreateBlockNote, useBlockNoteEditor } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  FormattingToolbarController,
  FormattingToolbar,
  BlockTypeSelect,
  BasicTextStyleButton,
  blockTypeSelectItems,
} from "@blocknote/react";
import * as locales from "@blocknote/core/locales";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";

// 精簡版的區塊類型選單，只保留投稿需要的「內文」與「標題」，排除清單與引用
function CustomBlockTypeSelect() {
  const editor = useBlockNoteEditor();

  // 選項只算一次，避免每次重新渲染（例如圈選文字時）都產生新的陣列
  const items = useMemo(
    () =>
      blockTypeSelectItems(editor.dictionary).filter((item) => {
        const type = (item.type || "").toLowerCase();
        const name = (item.name || "").toLowerCase();
        return !(type.includes("list") || type.includes("quote") || name.includes("list") || name.includes("quote"));
      }),
    [editor]
  );

  return <BlockTypeSelect items={items} />;
}

// 錯誤保護：萬一某個格式按鈕出錯，只讓格式列退回簡化版，不會讓整個投稿表單崩潰
class ToolbarBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("格式列發生錯誤，已改用簡化版:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// 格式列定義在元件外面：每次輸入不會被當成「新元件」而整個重建
function SubmitFormattingToolbar() {
  return (
    <ToolbarBoundary
      fallback={
        <FormattingToolbar>
          <BasicTextStyleButton basicTextStyle="bold" key="bold" />
          <BasicTextStyleButton basicTextStyle="italic" key="italic" />
        </FormattingToolbar>
      }
    >
      <FormattingToolbar>
        <CustomBlockTypeSelect key="customBlockTypeSelect" />
        <BasicTextStyleButton basicTextStyle="bold" key="bold" />
        <BasicTextStyleButton basicTextStyle="italic" key="italic" />
        <BasicTextStyleButton basicTextStyle="underline" key="underline" />
      </FormattingToolbar>
    </ToolbarBoundary>
  );
}

// 投稿用的文字編輯器（BlockNote，繁體中文介面），內容變動時以 HTML（送出用）和區塊資料（草稿用）回傳
// initialBlocks：有草稿時用來還原上次寫到的內容
export default function SubmitEditor({
  onChange,
  initialBlocks,
}: {
  onChange: (html: string, blocks: unknown[]) => void;
  initialBlocks?: unknown[];
}) {
  const { resolvedTheme } = useTheme();
  // 使用完整的繁體中文字典，只覆蓋輸入框提示文字
  // （若只給 placeholders，格式列會讀不到其他文字而當掉）
  const editor = useCreateBlockNote({
    // 草稿的區塊資料只在格式正確時使用，否則從空白開始
    initialContent:
      Array.isArray(initialBlocks) && initialBlocks.length > 0 && initialBlocks.every((b) => b && typeof b === "object" && "type" in (b as object))
        ? (initialBlocks as any)
        : undefined,
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
    <div className="min-h-[300px] cursor-text rounded-md border border-border bg-background py-4">
      <BlockNoteView
        editor={editor as any}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        slashMenu={false} // 禁用斜線選單 (/)
        sideMenu={false} // 禁用左側 [+] 拖曳把手
        formattingToolbar={false} // 停用預設格式列，改用下面自訂的
        onChange={async () => {
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html, editor.document as unknown[]);
        }}
      >
        <FormattingToolbarController formattingToolbar={SubmitFormattingToolbar} />
      </BlockNoteView>
    </div>
  );
}
