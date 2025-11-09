"use client";

interface MenuBarProps {
  editor: any;
}

export default function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 border-b pb-2">
      {/* Headings */}
      {[1, 2, 3, 4, 5, 6].map((level) => (
        <button
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("heading", { level })
              ? "bg-blue-500 text-white"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          H{level}
        </button>
      ))}

      {/* Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 text-sm rounded ${
          editor.isActive("bold")
            ? "bg-blue-500 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        <b>B</b>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 text-sm italic rounded ${
          editor.isActive("italic")
            ? "bg-blue-500 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        I
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 text-sm underline rounded ${
          editor.isActive("underline")
            ? "bg-blue-500 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        U
      </button>

      {/* Alignment */}
      {["left", "center", "right"].map((align) => (
        <button
          key={align}
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          className={`px-2 py-1 text-sm capitalize rounded ${
            editor.isActive({ textAlign: align })
              ? "bg-blue-500 text-white"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          {align}
        </button>
      ))}

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 text-sm rounded ${
          editor.isActive("bulletList")
            ? "bg-blue-500 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 text-sm rounded ${
          editor.isActive("orderedList")
            ? "bg-blue-500 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        1. List
      </button>

      {/* Table Controls */}
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
      >
        Insert Table
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
      >
        +Row
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
      >
        +Col
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="px-2 py-1 text-sm bg-red-100 hover:bg-red-200 rounded text-red-600"
      >
        Delete Table
      </button>
    </div>
  );
}
