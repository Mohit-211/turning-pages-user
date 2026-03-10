import { useState, useRef, useEffect } from "react";
import "./PdfViewer.scss";

// ─── A4 constants ─────────────────────────────────────────────────────────────
const A4_W      = 794;
const A4_H      = 1123;
const PAD_X     = 72;
const PAD_TOP   = 56;
const PAD_BOT   = 48;
const CONTENT_W = A4_W - PAD_X * 2;          // 650 px
const CONTENT_H = A4_H - PAD_TOP - PAD_BOT;  // 1019 px

// ─── Measure how tall an HTML string is at CONTENT_W ─────────────────────────
function measureHeight(html) {
  const probe = document.createElement("div");
  probe.style.cssText = `
    position:fixed; top:-99999px; left:0;
    width:${CONTENT_W}px;
    font-size:13.5px; line-height:1.8;
    visibility:hidden; pointer-events:none;
    word-break:break-word; overflow-wrap:break-word;
    padding:0; margin:0;
  `;
  probe.innerHTML = html;
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);
  return h;
}

// ─── Split ONE big paragraph text into lines that fit CONTENT_H ───────────────
// Uses binary-search on word count so we fill each page as much as possible.
function splitLargeElement(outerHTML, tag, attrs) {
  // extract plain text words
  const tmp = document.createElement("div");
  tmp.innerHTML = outerHTML;
  const text  = tmp.innerText || tmp.textContent || "";
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  let   i      = 0;

  while (i < words.length) {
    // Binary search: find max words that fit in CONTENT_H
    let lo = 1, hi = words.length - i, best = 1;
    while (lo <= hi) {
      const mid  = Math.floor((lo + hi) / 2);
      const test = words.slice(i, i + mid).join(" ");
      const html = `<${tag}${attrs}>${test}</${tag}>`;
      const h    = measureHeight(html);
      if (h <= CONTENT_H) { best = mid; lo = mid + 1; }
      else                 { hi  = mid - 1; }
    }
    const chunk = words.slice(i, i + best).join(" ");
    chunks.push(`<${tag}${attrs}>${chunk}</${tag}>`);
    i += best;
  }
  return chunks;
}

// ─── Main paginator ───────────────────────────────────────────────────────────
function paginateHTML(rawHTML) {
  // 1. Parse into real DOM nodes
  const container = document.createElement("div");
  container.innerHTML = rawHTML;

  // 2. Flatten children; if there's only ONE child that contains everything,
  //    try to split it by sentences then re-wrap.
  let children = Array.from(container.children);

  if (children.length === 0) {
    // Pure text — wrap in paragraphs by sentence
    const text = container.innerText || container.textContent || "";
    const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
    container.innerHTML = sentences.map(s => `<p>${s.trim()}</p>`).join("");
    children = Array.from(container.children);
  } else if (children.length === 1) {
    // Single block — break its text content into sentence-based <p> tags
    const el   = children[0];
    const tag  = el.tagName.toLowerCase();
    // Only expand generic block tags, not headings/tables/figures
    if (/^(p|div|section|article)$/.test(tag)) {
      const text = el.innerText || el.textContent || "";
      // Split on sentence endings
      const sentences = text
        .replace(/([.!?])\s+([A-Z"'])/g, "$1\n\n$2")
        .split(/\n\n+/)
        .map(s => s.trim())
        .filter(Boolean);

      if (sentences.length > 1) {
        container.innerHTML = sentences.map(s => `<p>${s}</p>`).join("");
        children = Array.from(container.children);
      }
    }
  }

  // 3. Paginate by measuring each element
  const pages  = [];   // array of HTML strings
  let   page   = [];   // current page's elements (outerHTML strings)
  let   pageH  = 0;

  children.forEach(el => {
    const elHTML = el.outerHTML;
    const tag    = el.tagName.toLowerCase();
    const attrs  = el.getAttributeNames()
      .map(a => ` ${a}="${el.getAttribute(a)}"`)
      .join("");
    const h      = measureHeight(elHTML);

    if (h <= 0) return; // empty node

    // Element too tall for one page → split by words
    if (h > CONTENT_H) {
      // flush current page
      if (page.length) { pages.push(page.join("")); page = []; pageH = 0; }
      const chunks = splitLargeElement(elHTML, tag || "p", attrs);
      chunks.forEach(chunk => pages.push(chunk));
      return;
    }

    // Does it fit on the current page?
    if (pageH + h > CONTENT_H && page.length > 0) {
      pages.push(page.join(""));
      page  = [];
      pageH = 0;
    }

    page.push(elHTML);
    pageH += h;
  });

  if (page.length) pages.push(page.join(""));
  return pages.length ? pages : [rawHTML];
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PdfViewer({ htmlContent, title = "Document", onClose }) {
  const [pages,  setPages]  = useState([]);
  const [zoom,   setZoom]   = useState(1.0);
  const [status, setStatus] = useState("idle");
  const pageRefs = useRef([]);

  useEffect(() => {
    if (!htmlContent?.trim()) { setStatus("empty"); return; }

    setStatus("rendering");
    setPages([]);

    // Defer so "rendering" state paints before we do heavy DOM work
    const id = setTimeout(() => {
      try {
        const built = paginateHTML(htmlContent);
        setPages(built);
        setStatus("ready");
      } catch (err) {
        console.error("PdfViewer error:", err);
        setPages([htmlContent]);
        setStatus("ready");
      }
    }, 80);

    return () => clearTimeout(id);
  }, [htmlContent]);

  const scrollTo  = i => pageRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const zoomIn    = () => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)));
  const zoomOut   = () => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(1)));
  const zoomReset = () => setZoom(1.0);
  const total     = pages.length;

  return (
    <div className="pdv">

      {/* ══ HEADER ════════════════════════════════════════════════════ */}
      <header className="pdv__header">
        <div className="pdv__hl">
          {onClose && (
            <button className="pdv__back" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
          )}
          <div className="pdv__hdiv" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="pdv__doc-name">{title}</span>
        </div>

        <div className="pdv__hc">
          {status === "ready" && (
            <span className="pdv__badge">{total} {total === 1 ? "page" : "pages"}</span>
          )}
        </div>

        {/* <div className="pdv__hr">
          <button className="pdv__print-btn" onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="6" y="14" width="12" height="8" rx="1"
                stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Print
          </button>
        </div> */}
      </header>

      {/* ══ TOOLBAR ═══════════════════════════════════════════════════ */}
      {status === "ready" && (
        <div className="pdv__toolbar">
          <div className="pdv__jumps">
            {pages.map((_, i) => (
              <button key={i} className="pdv__jump" onClick={() => scrollTo(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="pdv__tb-sep" />
          <div className="pdv__zoom-row">
            <button className="pdv__tb-btn" onClick={zoomOut} disabled={zoom <= 0.4}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35M8 11h6" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="pdv__zoom-val" onClick={zoomReset}>{Math.round(zoom * 100)}%</button>
            <button className="pdv__tb-btn" onClick={zoomIn} disabled={zoom >= 1.5}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ══ CANVAS ════════════════════════════════════════════════════ */}
      <main className="pdv__canvas">

        {status === "rendering" && (
          <div className="pdv__loading">
            <div className="pdv__spinner"><span/><span/><span/></div>
            <p>Laying out pages…</p>
          </div>
        )}

        {status === "empty" && (
          <div className="pdv__empty">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <p>Nothing to preview yet.</p>
          </div>
        )}

        {status === "ready" && (
          <div
            className="pdv__stack"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            {pages.map((html, i) => (
              <div
                key={i}
                className="pdv__page-wrap"
                ref={el => (pageRefs.current[i] = el)}
              >
                <div className="pdv__shadow" />
                <div className="pdv__page" style={{ width: A4_W, minHeight: A4_H }}>

                  {/* Running head */}
                  <div className="pdv__rhead">
                    <span className="pdv__rhead-label">{title.toUpperCase()}</span>
                    <span className="pdv__rhead-rule" />
                  </div>

                  {/* Content — preserves all CKEditor HTML/styles */}
                  <div
                    className="pdv__body"
                    style={{ padding: `0 ${PAD_X}px`, height: CONTENT_H, overflow: "hidden" }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />

                  {/* Folio */}
                  <div className="pdv__folio">
                    <span className="pdv__folio-rule" />
                    <span className="pdv__folio-num">{i + 1}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/*
══════════════════════════════════════════════════════
  HOW TO CONNECT TO CKEDITOR
══════════════════════════════════════════════════════

  import { useState } from 'react';
  import { CKEditor }  from '@ckeditor/ckeditor5-react';
  import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
  import PdfViewer     from './PdfViewer';

  export default function App() {
    const [html, setHtml] = useState('');
    const [mode, setMode] = useState('edit');

    return (
      <>
        <nav>
          <button onClick={() => setMode(m => m === 'edit' ? 'preview' : 'edit')}>
            {mode === 'edit' ? '👁 Preview' : '✏️ Edit'}
          </button>
        </nav>

        {mode === 'edit' ? (
          <CKEditor
            editor={ClassicEditor}
            data={html}
            onChange={(_, ed) => setHtml(ed.getData())}
          />
        ) : (
          <PdfViewer
            htmlContent={html}
            title="Document Title"
            onClose={() => setMode('edit')}
          />
        )}
      </>
    );
  }

══════════════════════════════════════════════════════
*/