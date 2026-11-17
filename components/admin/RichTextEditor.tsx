"use client";

import React, { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuList,
  LuListOrdered,
  LuLink,
  LuUnlink,
  LuUndo2,
  LuRedo2,
  LuRemoveFormatting,
  LuCheck,
} from "react-icons/lu";

/** WYSIWYG editor for short rich text (the resume summary). Outputs HTML. */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false, // SSR-safe
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rich min-h-[160px] px-3.5 py-3 text-sm leading-relaxed text-zinc-900 focus:outline-none",
        "aria-label": placeholder || "Rich text editor",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML(), editor.getText()),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
      {editor ? <Toolbar editor={editor} /> : <div className="h-[41px] border-b border-zinc-100 bg-zinc-50/70" />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const chain = () => editor.chain().focus();

  const openLink = () => {
    setUrl((editor.getAttributes("link").href as string) || "");
    setLinkOpen(true);
  };
  const applyLink = (e?: React.FormEvent) => {
    e?.preventDefault();
    const href = url.trim();
    if (!href) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: /^(https?:|mailto:)/i.test(href) ? href : `https://${href}` }).run();
    setLinkOpen(false);
  };

  return (
    <div className="relative border-b border-zinc-100 bg-zinc-50/70">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1.5">
        <Tool label="Bold (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}><LuBold size={15} /></Tool>
        <Tool label="Italic (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}><LuItalic size={15} /></Tool>
        <Tool label="Underline (Ctrl+U)" active={state.underline} onClick={() => chain().toggleUnderline().run()}><LuUnderline size={15} /></Tool>
        <Tool label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}><LuStrikethrough size={15} /></Tool>
        <Divider />
        <Tool label="Bulleted list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><LuList size={15} /></Tool>
        <Tool label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><LuListOrdered size={15} /></Tool>
        <Divider />
        <Tool label="Add link" active={state.link} onClick={openLink}><LuLink size={15} /></Tool>
        {state.link && <Tool label="Remove link" onClick={() => chain().extendMarkRange("link").unsetLink().run()}><LuUnlink size={15} /></Tool>}
        <Tool label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}><LuRemoveFormatting size={15} /></Tool>
        <div className="ml-auto flex">
          <Tool label="Undo (Ctrl+Z)" disabled={!state.canUndo} onClick={() => chain().undo().run()}><LuUndo2 size={15} /></Tool>
          <Tool label="Redo (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => chain().redo().run()}><LuRedo2 size={15} /></Tool>
        </div>
      </div>

      {linkOpen && (
        <form onSubmit={applyLink} className="flex items-center gap-2 border-t border-zinc-100 bg-white px-2 py-2">
          <LuLink size={14} className="ml-1 shrink-0 text-zinc-400" />
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setLinkOpen(false)}
            placeholder="https://…  (leave empty to remove)"
            className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs focus:border-brand-500 focus:outline-none"
          />
          <button type="submit" className="flex h-8 items-center gap-1 rounded-md bg-zinc-900 px-2.5 text-xs font-medium text-white">
            <LuCheck size={13} /> Apply
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="h-8 rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-100">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition disabled:opacity-30 ${
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-zinc-200" />;
