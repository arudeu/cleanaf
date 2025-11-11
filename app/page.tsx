"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { Fira_Code } from "next/font/google";
import prettier from "prettier/standalone";
import parserHtml from "prettier/parser-html";
import DOMPurify from "dompurify";
import MenuBar from "@/components/ui/menuBar";

// ✅ Font setup
const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira",
});

export default function TiptapToHtml() {
  /** 🔹 State management */
  const [html, setHtml] = useState(""); // Raw HTML from Tiptap
  const [formattedHtml, setFormattedHtml] = useState(""); // Clean + formatted HTML for CodeMirror
  const [copied, setCopied] = useState(false); // Clipboard copy feedback

  /** 🔹 Refs to prevent infinite loop between editors */
  const isUpdatingFromTiptap = useRef(false);
  const isUpdatingFromCodeMirror = useRef(false);

  /** 🧠 Initialize Tiptap editor */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start typing..." }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `
      <h2>Welcome to <strong>clean.af</strong></h2>
      <p>Instant HTML beautification with Tiptap & CodeMirror.</p>
      <ul>
        <li>Real-time HTML sanitization</li>
        <li>Automatic formatting with Prettier</li>
        <li>Two-way synchronization between editors</li>
      </ul>
      <p>Enjoy a seamless editing experience!</p>
    `,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingFromCodeMirror.current) return; // avoid feedback loop
      isUpdatingFromTiptap.current = true;
      setHtml(editor.getHTML());
    },
  });

  /**
   * 🧼 Sanitize and normalize HTML
   * Removes unwanted attributes, spacing, and formatting errors.
   */
  const cleanHtmlApi = async (html: string) => {
  const res = await fetch("/api/clean-html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });
  const data = await res.json();
  return data.formatted || html;
};


  /** 🔄 When Tiptap updates → sync to CodeMirror */
  useEffect(() => {
    if (!html.trim() || isUpdatingFromCodeMirror.current) return;

    const timeout = setTimeout(async () => {
      try {
        const cleaned = cleanHtmlApi(html);
        const formatted = await prettier.format(await cleaned, {
          parser: "html",
          plugins: [parserHtml],
        });

        setFormattedHtml(formatted);
      } catch (err) {
        console.error("Formatting error:", err);
      } finally {
        isUpdatingFromTiptap.current = false;
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [html]);

  /** 🔄 When CodeMirror updates → sync back to Tiptap */
  const handleCodeMirrorChange = async (value: string) => {
    if (isUpdatingFromTiptap.current) return;

    try {
      isUpdatingFromCodeMirror.current = true;

      const cleaned = cleanHtmlApi(html);
        const formatted = await prettier.format(await cleaned, {
          parser: "html",
          plugins: [parserHtml],
        });

      setFormattedHtml(formatted);
      setHtml(formatted);
      editor?.commands.setContent(formatted);
    } catch (err) {
      console.error("CodeMirror update error:", err);
    } finally {
      // Small delay to prevent flicker
      setTimeout(() => {
        isUpdatingFromCodeMirror.current = false;
      }, 100);
    }
  };

  /** 📋 Copy HTML to clipboard */
  const copyHtml = () => {
    navigator.clipboard.writeText(formattedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!editor) return <div className="p-6 text-white">Loading editor...</div>;

  /** 🎨 Layout */
  return (
    <div
      className={`min-h-screen bg-black p-6 flex justify-center items-start ${firaCode.variable} font-[var(--font-fira)]`}
    >
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-[1800px] h-[calc(100vh-3rem)]">
        {/* 📝 Tiptap Section */}
        <section className="bg-white rounded-2xl shadow p-4 w-[45vw] flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between mb-3 items-center">
            <h3 className="text-3xl font-semibold">
              clean.af
              <sup className="text-[10px] ms-1 px-2 py-1 text-white rounded-full bg-slate-900">
                beta
              </sup>
            </h3>
            <span className="text-sm text-slate-500">
              Rich text visual editor
            </span>
          </div>

          <MenuBar editor={editor} />

          {/* Editor */}
          <div className="border rounded p-3 flex-1 overflow-auto">
            <EditorContent editor={editor} className="h-full min-h-full" />
          </div>
        </section>

        {/* 💻 CodeMirror Section */}
        <section className="bg-white rounded-2xl shadow p-4 w-[45vw] flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between mb-3 items-center">
            <h3 className="text-lg font-semibold">HTML Source</h3>
            <button
              onClick={copyHtml}
              className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              {copied ? "Copied" : "Copy HTML"}
            </button>
          </div>

          {/* CodeMirror Editor */}
          <div className="flex-1 overflow-scroll min-h-0">
            <CodeMirror
              value={formattedHtml}
              height="100%"
              theme={monokai}
              extensions={[htmlLang()]}
              onChange={handleCodeMirrorChange}
              basicSetup={{
                lineNumbers: true,
                autocompletion: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                lintKeymap: true,
                closeBracketsKeymap: true,
              }}
              style={{ fontSize: "16px" }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
