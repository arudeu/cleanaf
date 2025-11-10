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

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira",
});

export default function TiptapToHtml() {
  const [html, setHtml] = useState("");
  const [formattedHtml, setFormattedHtml] = useState("");
  const [copied, setCopied] = useState(false);

  // To prevent feedback loop
  const isUpdatingFromTiptap = useRef(false);
  const isUpdatingFromCodeMirror = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `<h2>Welcome to <strong>clean.af</strong></h2>
    <p>Instant HTML beautification with Tiptap & CodeMirror.</p>
    <p>Type something in the WYSIWYG editor on the left, and see the cleaned and formatted HTML source code on the right.</p>
    <p>Features include:</p>
    <ul>
      <li>Real-time HTML sanitization</li>
      <li>Automatic formatting with Prettier</li>
      <li>Two-way synchronization between editors</li>
    </ul>
    <p>Enjoy a seamless editing experience!</p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingFromCodeMirror.current) return;
      isUpdatingFromTiptap.current = true;
      setHtml(editor.getHTML());
    },
  });

  function cleanHtml(inputHtml: string) {
    if (!inputHtml) return "";

    // Sanitize
    let cleaned = DOMPurify.sanitize(inputHtml, {
      USE_PROFILES: { html: true },
      ALLOWED_ATTR: ["class", "href", "src", "alt", "title", "align"],
    });

    // Cleanup and normalization
    cleaned = cleaned
      .replace(/\s{2,}/g, " ")
      .replace(/\n\s*/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/<colgroup>[\s\S]*?<\/colgroup>/gi, "")
      .replace(/\brewards\(s\)/gi, "reward(s)")
      .replace(/\bregulations\(s\)/gi, "regulation(s)")
      .replace(/\bteh\b/gi, "the")
      .replace(/\scolspan=["']\d+["']/gi, "")
      .replace(/\srowspan=["']\d+["']/gi, "")
      .replace(/<td>\s*<p>(.*?)<\/p>\s*<\/td>/gi, "<td>$1</td>")
      .replace(/<th>\s*<p>(.*?)<\/p>\s*<\/th>/gi, "<th>$1</th>")
      // replace ​with space
      .replace(/\u200B/g, " ")
      // replace  with space
      .replace(/\u2009/g, " ")

      // replace " " with space
      .replace(/\u200A/g, " ")
      // replace " " with space
      .replace(/\u2008/g, " ")
      // replace " " with space
      .replace(/\u2005/g, " ")
      // replace " " with space
      .replace(/\u2002/g, " ")
      // replace " " with space
      .replace(/\u2003/g, " ")
      // replace "  " with space
      .replace(/  /g, " ")
      // replace « with html entity
      .replace(/«/g, "&laquo;")
      // replace » with html entity
      .replace(/»/g, "&raquo;")
      // replace — with html entity
      .replace(/—/g, "&mdash;")
      // replace – with html entity
      .replace(/–/g, "&ndash;")
      // replace “ with html entity
      .replace(/“/g, "&ldquo;")
      // replace ” with html entity
      .replace(/”/g, "&rdquo;")
      // replace ‘ with html entity
      .replace(/‘/g, "&lsquo;")
      // replace ’ with html entity
      .replace(/’/g, "&rsquo;")
      // replace … with html entity
      .replace(/…/g, "&hellip;")
      // remove empty paragraphs
      .replace(/<p>\s*<\/p>/gi, "");

    return cleaned.trim();
  }

  // 🧠 When Tiptap changes → update CodeMirror
  useEffect(() => {
    if (!html.trim() || isUpdatingFromCodeMirror.current) return;

    const timeout = setTimeout(async () => {
      try {
        const cleaned = cleanHtml(html);
        const formatted = await prettier.format(cleaned, {
          parser: "html",
          plugins: [parserHtml],
        });
        isUpdatingFromTiptap.current = false;
        setFormattedHtml(formatted);
      } catch (err) {
        console.error("Formatting error:", err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [html]);

  // 💡 When CodeMirror changes → update Tiptap
  const handleCodeMirrorChange = async (value: string) => {
    if (isUpdatingFromTiptap.current) return;

    try {
      isUpdatingFromCodeMirror.current = true;
      const cleaned = cleanHtml(value);
      const formatted = await prettier.format(cleaned, {
        parser: "html",
        plugins: [parserHtml],
      });

      setFormattedHtml(formatted);
      setHtml(formatted);
      editor?.commands.setContent(formatted);
    } catch (err) {
      console.error("CodeMirror update error:", err);
    } finally {
      setTimeout(() => {
        isUpdatingFromCodeMirror.current = false;
      }, 100);
    }
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(formattedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!editor) return <div className="p-6">Loading editor...</div>;

  return (
    <div
      className={`min-h-screen bg-black p-6 flex justify-center items-start ${firaCode.variable} font-[var(--font-fira)]`}
    >
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-[1800px] h-[calc(100vh-3rem)]">
        {/* 📝 Tiptap WYSIWYG */}
        <section className="bg-white rounded-2xl shadow p-4 w-[45vw] flex flex-col h-full">
          <div className="flex justify-between mb-3 items-center">
            <h3 className="text-3xl font-semibold">clean.af</h3>
            <span className="text-sm text-slate-500">
              Rich text visual editor
            </span>
          </div>

          <MenuBar editor={editor} />

          {/* Tiptap editor fills remaining space */}
          <div className="border rounded p-3 flex-1 overflow-auto">
            <EditorContent editor={editor} className="h-full min-h-full" />
          </div>
        </section>

        {/* 💻 CodeMirror HTML */}
        <section className="bg-white rounded-2xl shadow p-4 w-[45vw] flex flex-col h-full">
          <div className="flex justify-between mb-3 items-center">
            <h3 className="text-lg font-semibold">HTML Source</h3>
            <button
              onClick={copyHtml}
              className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
            >
              {copied ? "Copied" : "Copy HTML"}
            </button>
          </div>

          {/* CodeMirror always fills full section height */}
          <div className="flex-1 overflow-scroll min-h-0">
            <div className="h-full min-h-full">
              <CodeMirror
                value={formattedHtml}
                height="100%"
                theme={monokai}
                extensions={[htmlLang()]}
                onChange={(value) => handleCodeMirrorChange(value)}
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
          </div>
        </section>
      </div>
    </div>
  );
}
