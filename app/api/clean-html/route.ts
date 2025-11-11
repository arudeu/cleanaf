import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import prettier from "prettier/standalone";
import parserHtml from "prettier/parser-html";

/**
 * 🧼 Clean and sanitize HTML input
 */
function cleanHtml(inputHtml: string, headers: string[] = []): string {
  if (!inputHtml) return "";

  const defaultHeaders = [
    "DESCRIPTION OF PROMOTION", "PROMOTIONAL PERIOD", "ELIGIBILITY",
    "ACTION REQUIRED", "CLAIMING PROMOTIONAL OFFER", "REGISTRATION PROCEDURES",
    "LIMITATIONS ON PARTICIPATION", "WAGERING REQUIREMENTS/EXCLUSIONS",
    "ORDER OF FUNDS USED FOR WAGERING", "ELIGIBLE GAMES",
    "RESTRICTIONS ON WITHDRAWALS", "CANCELLATION", "GAMBLING PROBLEM", "IMPORTANT TERMS",
  ];
  const allHeaders = [...new Set([...defaultHeaders, ...headers.map(h => h.toUpperCase())])];
  const headerPattern = new RegExp(`(<p>\\s*)(${allHeaders.join("|")})(\\s*<\\/p>)`, "gi");

  let cleaned = DOMPurify.sanitize(inputHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: ["class", "href", "src", "alt", "title", "align"],
  });

  // 🔄 Compact replacement list
  const replacements: [RegExp, string | ((...a: any[]) => string)][] = [
    [/&nbsp;|[ \u200B-\u200D\uFEFF\u2000-\u200A]/g, " "],
    [/\s{2,}/g, " "],
    [/\n\s*/g, ""],
    [/<colgroup>[\s\S]*?<\/colgroup>/gi, ""],
    [/\s(colspan|rowspan)=["']\d+["']/gi, ""],
    [/<t[dh]>\s*<p>(.*?)<\/p>\s*<\/t[dh]>/gi, "<td>$1</td>"],
    [/«/g, "&laquo;"], [/»/g, "&raquo;"], [/—/g, "&mdash;"], [/–/g, "&ndash;"],
    [/“/g, "&ldquo;"], [/”/g, "&rdquo;"], [/‘/g, "&lsquo;"], [/’/g, "&rsquo;"], [/…/g, "&hellip;"],
    [/\bteh\b/gi, "the"],
    [/\brewards\(s\)/gi, "reward(s)"],
    [/\bregulations\(s\)/gi, "regulation(s)"],
    [/<p>\s*<\/p>/gi, ""],
    [/<p>\s*<u>\s*<\/u>\s*<\/p>/gi, ""],
    [/<\/li>\s*<li>/gi, "</li><li>"],
    [/\sclass=["'].*?["']/gi, ""],
    [/(<br\s*\/?>\s*){2,}/gi, "<br/>"],
    [/^(<br\s*\/?>\s*)+|(\s*<br\s*\/?>)+$/gi, ""],
    [/<li>\s*<\/li>/gi, ""],
    [/<p>\s*(<strong>\s*)?(<u>\s*)?(<\/u>\s*)?(<\/strong>\s*)?<\/p>/gi, ""],
    [headerPattern, "$1<strong>$2</strong>$3"],
    // 🔹 Convert bullet symbols (●, ·, •) into list items
    [/<p>\s*[●•·o§·▪]\s*(.*?)\s*<\/p>/gi, "<li>$1</li>"],
    [/<p>\s*(\d+|[a-zA-Z]|i+|I+)\.\s+(.*?)\s*<\/p>/g, "<li>$2</li>"],
    [/<p>(&nbsp;){3,}\s*(.*?)\s*<\/p>/gi, "<li>$2</li>"],
    [/\.(&rdquo;|&rsquo;)<\/p>/gi, "$1.</p>"],
    // 🔹 Remove any instance of <br />
    [/<br\s*\/?>/gi, ""],
    // 🔹 Remove all italicized text
    [/<em>\s*([^<]+?)\s*<\/em>/gi, ""],
    // Add period at the end of every list item, if already present don't add
    [/<li>\s*([^<]+?)\s*<\/li>/gi, (match, p1) => {
      const trimmed = p1.trim();
      return `<li>${trimmed.endsWith(".") ? trimmed : trimmed + "."}</li>`;
    }],
    // remove empty parentheses
    [/\(\s*\)/g, ""],
    // if " ." exists, replace with "."
    [/\s+\.+/g, ". "],
    // if theres a ":" indent the next line
    [/:<\/p>\s*<p>/gi, ":<br/><blockquote>"],
    // close blockquote if next line starts with uppercase word and ends with period
    [/<br\/><blockquote>([\s\S]*?)<\/p>\s*<p>\s*([A-Z][^<]*?\.)/g, "<br/></blockquote><p>$2"],
    // add space after period if not present
    [/([a-zA-Z0-9])\.([A-Z])/g, "$1. $2"],
    // if there is a closing tag followed by an opening tag, remove it.
    [/(<\/(ul|ol)>)\s*(<(ul|ol)>)/gi, "$1$3"],
   
  ];

  for (const [pattern, replacement] of replacements) cleaned = cleaned.replace(pattern, replacement as any);

  return cleaned.trim();
}

export async function POST(req: Request) {
  try {
    const { html, headers } = await req.json();
    if (!html) return NextResponse.json({ error: "No HTML provided" }, { status: 400 });

    const cleaned = cleanHtml(html, headers);
    const formatted = await prettier.format(cleaned, { parser: "html", plugins: [parserHtml] });

    return NextResponse.json({ cleaned, formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to clean HTML" }, { status: 500 });
  }
}
