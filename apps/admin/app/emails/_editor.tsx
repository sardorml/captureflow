"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  type BaseSelection,
  type TextFormatType,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  CODE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  type Transformer,
} from "@lexical/markdown";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  Button,
  Input,
  Popover,
  Separator,
  ToggleButton,
  Toolbar,
  Tooltip,
} from "@heroui/react";

// Only what renderCampaign's Markdown parser turns into email HTML.
const TRANSFORMERS: Transformer[] = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CODE,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  STRIKETHROUGH,
  INLINE_CODE,
  LINK,
];

const THEME = {
  paragraph: "mb-3 last:mb-0",
  heading: {
    h1: "mb-3 text-2xl font-semibold text-fg-strong",
    h2: "mb-3 text-xl font-semibold text-fg-strong",
    h3: "mb-2 text-lg font-semibold text-fg-strong",
  },
  quote: "mb-3 border-l-2 border-line-strong pl-3 text-fg-muted",
  list: {
    ul: "mb-3 list-disc pl-6",
    ol: "mb-3 list-decimal pl-6",
    listitem: "my-0.5",
    nested: { listitem: "list-none" },
  },
  link: "text-accent underline",
  code: "mb-3 block rounded-lg bg-canvas-2 p-3 font-mono text-sm",
  text: {
    bold: "font-semibold",
    italic: "italic",
    strikethrough: "line-through",
    code: "rounded bg-canvas-2 px-1 py-0.5 font-mono text-[0.9em]",
  },
};

type Block = "paragraph" | "h1" | "h2" | "quote" | "ul" | "ol";

function ToolButton({
  label,
  isSelected,
  isDisabled,
  onPress,
  children,
}: {
  label: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip delay={400}>
      <ToggleButton
        aria-label={label}
        isIconOnly
        size="sm"
        variant="ghost"
        isSelected={!!isSelected}
        isDisabled={isDisabled}
        onChange={onPress}
      >
        {children}
      </ToggleButton>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
}

function LinkButton({ active }: { active: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState<BaseSelection | null>(null);

  const apply = (next: string | null) => {
    editor.update(() => {
      if (saved) $setSelection(saved.clone());
    });
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, next);
    setOpen(false);
  };

  return (
    <Popover
      isOpen={open}
      onOpenChange={(next) => {
        if (next) {
          editor.getEditorState().read(() => {
            setSaved($getSelection()?.clone() ?? null);
            const selection = $getSelection();
            const node = $isRangeSelection(selection)
              ? $findMatchingParent(selection.anchor.getNode(), $isLinkNode)
              : null;
            setUrl($isLinkNode(node) ? node.getURL() : "https://");
          });
        }
        setOpen(next);
      }}
    >
      <ToggleButton
        aria-label="Link"
        isIconOnly
        size="sm"
        variant="ghost"
        isSelected={active}
      >
        <Link2 size={16} />
      </ToggleButton>
      <Popover.Content placement="bottom start" className="w-80">
        <Popover.Dialog>
          <form
            className="flex flex-col gap-2 p-1"
            onSubmit={(event) => {
              event.preventDefault();
              apply(url.trim() || null);
            }}
          >
            <Input
              aria-label="Link URL"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://captureflow.dev"
            />
            <div className="flex justify-end gap-2">
              {active && (
                <Button size="sm" variant="ghost" onPress={() => apply(null)}>
                  Remove
                </Button>
              )}
              <Button size="sm" variant="primary" type="submit">
                Apply
              </Button>
            </div>
          </form>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState<Set<TextFormatType>>(new Set());
  const [block, setBlock] = useState<Block>("paragraph");
  const [isLink, setIsLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sync = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    setFormats(
      new Set(
        (["bold", "italic", "strikethrough", "code"] as const).filter((f) =>
          selection.hasFormat(f),
        ),
      ),
    );
    const anchor = selection.anchor.getNode();
    setIsLink(!!$findMatchingParent(anchor, $isLinkNode));
    const top =
      anchor.getKey() === "root" ? anchor : anchor.getTopLevelElementOrThrow();
    const list = $getNearestNodeOfType(anchor, ListNode);
    if (list && $isListNode(list)) {
      setBlock(list.getListType() === "number" ? "ol" : "ul");
    } else if ($isHeadingNode(top)) {
      setBlock(top.getTag() === "h1" ? "h1" : "h2");
    } else if ($isQuoteNode(top)) {
      setBlock("quote");
    } else {
      setBlock("paragraph");
    }
  }, []);

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) =>
        editorState.read(sync),
      ),
    [editor, sync],
  );
  useEffect(() => {
    const offs = [
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          sync();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (v) => {
          setCanUndo(v);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (v) => {
          setCanRedo(v);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    ];
    return () => offs.forEach((off) => off());
  }, [editor, sync]);

  const format = (f: TextFormatType) =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, f);

  const setBlockType = (next: Block) => {
    if (next === "ul" || next === "ol") {
      editor.dispatchCommand(
        block === next
          ? REMOVE_LIST_COMMAND
          : next === "ul"
            ? INSERT_UNORDERED_LIST_COMMAND
            : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const target = block === next ? "paragraph" : next;
      $setBlocksType(selection, () =>
        target === "paragraph"
          ? $createParagraphNode()
          : target === "quote"
            ? $createQuoteNode()
            : $createHeadingNode(target),
      );
    });
  };

  return (
    <Toolbar
      aria-label="Formatting"
      className="border-line flex w-full flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
    >
      <ToolButton
        label="Undo"
        isDisabled={!canUndo}
        onPress={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 size={16} />
      </ToolButton>
      <ToolButton
        label="Redo"
        isDisabled={!canRedo}
        onPress={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 size={16} />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolButton
        label="Heading"
        isSelected={block === "h1"}
        onPress={() => setBlockType("h1")}
      >
        <Heading1 size={16} />
      </ToolButton>
      <ToolButton
        label="Subheading"
        isSelected={block === "h2"}
        onPress={() => setBlockType("h2")}
      >
        <Heading2 size={16} />
      </ToolButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolButton
        label="Bold"
        isSelected={formats.has("bold")}
        onPress={() => format("bold")}
      >
        <Bold size={16} />
      </ToolButton>
      <ToolButton
        label="Italic"
        isSelected={formats.has("italic")}
        onPress={() => format("italic")}
      >
        <Italic size={16} />
      </ToolButton>
      <ToolButton
        label="Strikethrough"
        isSelected={formats.has("strikethrough")}
        onPress={() => format("strikethrough")}
      >
        <Strikethrough size={16} />
      </ToolButton>
      <ToolButton
        label="Inline code"
        isSelected={formats.has("code")}
        onPress={() => format("code")}
      >
        <Code size={16} />
      </ToolButton>
      <LinkButton active={isLink} />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <ToolButton
        label="Bulleted list"
        isSelected={block === "ul"}
        onPress={() => setBlockType("ul")}
      >
        <List size={16} />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        isSelected={block === "ol"}
        onPress={() => setBlockType("ol")}
      >
        <ListOrdered size={16} />
      </ToolButton>
      <ToolButton
        label="Quote"
        isSelected={block === "quote"}
        onPress={() => setBlockType("quote")}
      >
        <Quote size={16} />
      </ToolButton>
    </Toolbar>
  );
}

/*
 * Rich text in, Markdown out: the stored body stays the Markdown that
 * renderCampaign and the mailer already understand, so drafts written before
 * this editor still open and send unchanged.
 */
export function EmailEditor({
  initialMarkdown,
  onChange,
}: {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
}) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "email-body",
        theme: THEME,
        nodes: [
          HeadingNode,
          QuoteNode,
          ListNode,
          ListItemNode,
          LinkNode,
          CodeNode,
        ],
        editorState: () =>
          $convertFromMarkdownString(initialMarkdown, TRANSFORMERS),
        onError: (error) => {
          throw error;
        },
      }}
    >
      <div className="border-line bg-field focus-within:border-line-strong overflow-hidden rounded-xl border">
        <EditorToolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label="Message"
                className="text-fg min-h-72 px-4 py-3 text-[15px] leading-relaxed outline-none"
              />
            }
            placeholder={
              <div className="text-fg-subtle pointer-events-none absolute top-3 left-4 text-[15px]">
                Write your update. Type # for a heading, - for a list.
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin
        ignoreSelectionChange
        onChange={(state) =>
          state.read(() => onChange($convertToMarkdownString(TRANSFORMERS)))
        }
      />
    </LexicalComposer>
  );
}
