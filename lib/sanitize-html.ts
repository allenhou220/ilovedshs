// HTML 安全過濾工具（不需安裝任何套件，伺服器端與瀏覽器端都能用）
//
// 原理：把輸入的 HTML 拆成「標籤」與「文字」，
// 只用白名單內的標籤與屬性「重新組出」一份新的 HTML，
// 其餘一律丟棄或轉成純文字，因此 <script>、onerror=、javascript: 連結等都無法通過。

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "del", "ins", "mark",
  "sub", "sup", "small", "span", "div", "blockquote", "pre", "code",
  "ul", "ol", "li", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "details", "summary",
]);

// 這些標籤連同「裡面的內容」一起整段刪除
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "noscript", "template",
  "textarea", "title", "xmp", "noembed", "noframes", "svg", "math",
  "select", "frameset", "plaintext", "applet", "head",
]);

const VOID_TAGS = new Set(["br", "hr", "img", "col"]);

const GLOBAL_ATTRS = new Set(["class", "style", "title", "dir", "lang", "align"]);

const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  ol: new Set(["start", "type"]),
  col: new Set(["span"]),
  colgroup: new Set(["span"]),
};

const TAG_RE =
  /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR_RE = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  colon: ":", tab: "\t", newline: "\n", sol: "/", lpar: "(", rpar: ")",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);?/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return "";
      try { return String.fromCodePoint(n); } catch { return ""; }
    }
    const v = NAMED_ENTITIES[code.toLowerCase()];
    return v !== undefined ? v : m;
  });
}

/** 把任意文字轉成可安全放進 HTML 的形式（給 Email、Word 匯出等用） */
export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeText(s: string): string {
  // 保留原本合法的 &xxx; 實體，其餘 & < > 轉義
  return s
    .replace(/&(?!(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function safeUrl(raw: string, tag: string): string | null {
  const decoded = decodeEntities(raw).trim();
  const compact = decoded.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase();
  const m = compact.match(/^([a-z][a-z0-9+.-]*):/);
  if (!m) return decoded; // 相對路徑，例如 /works/xxx、#top
  const scheme = m[1];
  if (scheme === "http" || scheme === "https") return decoded;
  if (tag === "a" && scheme === "mailto") return decoded;
  if (tag === "img" && /^data:image\/(png|jpe?g|gif|webp|avif);/.test(compact)) return decoded;
  return null;
}

function safeStyle(raw: string): string | null {
  const decoded = decodeEntities(raw);
  const compact = decoded.replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
  if (/url\(|expression|javascript:|vbscript:|@import|behavior|-moz-binding|\\/.test(compact)) return null;
  return decoded;
}

function buildTag(tag: string, attrs: string, selfClose: boolean): string {
  let out = "<" + tag;
  let hasTargetBlank = false;
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = ATTR_RE.exec(attrs)) !== null) {
    const name = m[1].toLowerCase();
    if (seen.has(name)) continue;
    seen.add(name);
    if (name.startsWith("on")) continue;
    const isData = /^data-[a-z0-9-]+$/.test(name);
    if (!isData && !GLOBAL_ATTRS.has(name) && !TAG_ATTRS[tag]?.has(name)) continue;

    const rawVal = m[2] ?? m[3] ?? m[4] ?? "";
    let val: string | null;
    if (name === "href" || name === "src") val = safeUrl(rawVal, tag);
    else if (name === "style") val = safeStyle(rawVal);
    else val = decodeEntities(rawVal);
    if (val === null) continue;

    if (name === "rel") continue; // 由下方統一加入
    if (name === "target") {
      if (val !== "_blank") continue;
      hasTargetBlank = true;
    }
    out += ` ${name}="${escapeHtml(val)}"`;
  }
  if (hasTargetBlank) out += ' rel="noopener noreferrer"';
  return out + (selfClose && VOID_TAGS.has(tag) ? " />" : ">");
}

/** 過濾使用者提供的 HTML，只留下安全的排版標籤 */
export function sanitizeHtml(input: unknown): string {
  const html = String(input ?? "");
  let out = "";
  let last = 0;
  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = TAG_RE.exec(html)) !== null) {
    out += escapeText(html.slice(last, m.index));
    last = TAG_RE.lastIndex;

    const isClose = m[1] === "/";
    const tag = m[2].toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      if (!isClose) {
        const closeRe = new RegExp(`</${tag}\\s*>`, "ig");
        closeRe.lastIndex = last;
        const c = closeRe.exec(html);
        last = c ? closeRe.lastIndex : html.length;
        TAG_RE.lastIndex = last;
      }
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) continue;

    if (isClose) {
      if (!VOID_TAGS.has(tag)) out += `</${tag}>`;
    } else {
      out += buildTag(tag, m[3] || "", m[4] === "/" || VOID_TAGS.has(tag));
    }
  }
  out += escapeText(html.slice(last));
  return out;
}
