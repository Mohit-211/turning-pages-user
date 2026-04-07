import React, { useRef, useState, useEffect, useCallback } from "react";
import { Send, Image as ImageIcon, Download, X, ChevronDown, MessageCircle } from "lucide-react";
import "./BookHeader.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// ─── All supported page sizes (at 96 dpi) ─────────────────────────────────────
export const PAGE_SIZES = {
  A3: {
    label: "A3",
    w: 1123,
    h: 1587,
    desc: "11.7 × 16.5 in",
    icon: "tall"
  },
  A4: {
    label: "A4",
    w: 794,
    h: 1123,
    desc: "8.27 × 11.7 in",
    icon: "tall"
  },
  A5: {
    label: "A5",
    w: 559,
    h: 794,
    desc: "5.83 × 8.27 in",
    icon: "tall"
  },
  LETTER: {
    label: "Letter / Journal",
    w: 816,
    h: 1056,
    desc: "8.5 × 11 in",
    icon: "tall"
  },
  LEGAL: {
    label: "Legal",
    w: 816,
    h: 1344,
    desc: "8.5 × 14 in",
    icon: "tall"
  },
  B5: {
    label: "B5",
    w: 665,
    h: 945,
    desc: "6.93 × 9.84 in",
    icon: "tall"
  },
  HALFLETTER: {
    label: "Half Letter",
    w: 528,
    h: 816,
    desc: "5.5 × 8.5 in",
    icon: "tall"
  },
  TRADE: {
    label: "Traditional",
    w: 576,
    h: 864,
    desc: "6 × 9 in",
    icon: "tall"
  },
  POCKET: {
    label: "Pocket Book",
    w: 432,
    h: 648,
    desc: "4.25 × 6.5 in",
    icon: "tall"
  },
  SQUARE: {
    label: "Square",
    w: 756,
    h: 756,
    desc: "7.87 × 7.87 in",
    icon: "square"
  }
};
function getLayout(sizeKey) {
  const s = PAGE_SIZES[sizeKey];
  return {
    ...s,
    contentW: s.w - 86 - 58,   // inside(86) + outside(58)
    contentH: s.h - 72 - 96,   // top(72) + bottom(96)
    fontSize: Math.max(10, Math.round(s.w * 0.017)),
  };
}
function measureHeight(html, width, fontSize) {
  const probe = document.createElement("div");
  probe.style.cssText = `
    position:fixed; top:-99999px; left:0;
    width:${width}px; font-size:${fontSize}px;
    line-height:1.8; visibility:hidden;
    pointer-events:none; word-break:break-word;
    overflow-wrap:break-word; padding:0; margin:0;
  `;
  probe.innerHTML = html;
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);
  return h;
}
function splitLargeElement(outerHTML, tag, attrs, layout) {
  const tmp = document.createElement("div");
  tmp.innerHTML = outerHTML;
  const text = tmp.innerText || tmp.textContent || "";
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    let lo = 1, hi = words.length - i, best = 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const test = words.slice(i, i + mid).join(" ");
      const h = measureHeight(`<${tag}${attrs}>${test}</${tag}>`, layout.contentW, layout.fontSize);
      if (h <= layout.contentH) { best = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    chunks.push(`<${tag}${attrs}>${words.slice(i, i + best).join(" ")}</${tag}>`);
    i += best;
  }
  return chunks;
}
function paginateHTML(rawHTML, layout) {
  const container = document.createElement("div");
  container.innerHTML = rawHTML;
  let children = Array.from(container.children);
  if (children.length <= 1) {
    const src = children.length === 1 ? children[0] : container;
    const tag = (src.tagName || "div").toLowerCase();
    if (/^(p|div|section|article)$/.test(tag)) {
      const text = src.innerText || src.textContent || "";
      const sents = text
        .replace(/([.!?])\s+([A-Z"'])/g, "$1\n\n$2")
        .split(/\n\n+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (sents.length > 1) {
        container.innerHTML = sents.map(s => `<p>${s}</p>`).join("");
        children = Array.from(container.children);
      }
    }
  }
  const pages = [];
  let page = [];
  let pageH = 0;
  children.forEach(el => {
    const elHTML = el.outerHTML;
    const tag = el.tagName.toLowerCase();
    const attrs = el.getAttributeNames().map(a => ` ${a}="${el.getAttribute(a)}"`).join("");
    const h = measureHeight(elHTML, layout.contentW, layout.fontSize);
    if (h <= 0) return;
    if (h > layout.contentH) {
      if (page.length) { pages.push(page.join("")); page = []; pageH = 0; }
      splitLargeElement(elHTML, tag || "p", attrs, layout).forEach(c => pages.push(c));
      return;
    }
    if (pageH + h > layout.contentH && page.length > 0) {
      pages.push(page.join(""));
      page = [];
      pageH = 0;
    }
    page.push(elHTML);
    pageH += h;
  });
  if (page.length) pages.push(page.join(""));
  return pages.length ? pages : [rawHTML];
}
function hasValidContent(html) {
  if (!html) return false;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return !!text && !text.includes("coming soon");
}
// ─── Size Selector Dropdown ───────────────────────────────────────────────────
function SizeDropdown({ current, onSelect, onClose }) {
  const standard = ["A3", "A4", "A5", "LETTER", "LEGAL", "B5", "HALFLETTER"];
  const books = ["TRADE", "POCKET", "SQUARE"];
  return (
    <div className="bh-size-dropdown" onClick={e => e.stopPropagation()}>
      <div className="bh-size-dropdown__head">
        <span>Select Page Size</span>
        <button onClick={onClose}><X size={13} /></button>
      </div>
      <div className="bh-size-dropdown__group">
        <p className="bh-size-dropdown__label">Standard</p>
        <div className="bh-size-dropdown__grid">
          {standard.map(k => (
            <SizeCard key={k} sizeKey={k} active={k === current} onSelect={() => { onSelect(k); onClose(); }} />
          ))}
        </div>
      </div>
      <div className="bh-size-dropdown__group">
        <p className="bh-size-dropdown__label">Books &amp; Special</p>
        <div className="bh-size-dropdown__grid">
          {books.map(k => (
            <SizeCard key={k} sizeKey={k} active={k === current} onSelect={() => { onSelect(k); onClose(); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
function SizeCard({ sizeKey, active, onSelect }) {
  const s = PAGE_SIZES[sizeKey];
  const ratio = s.h / s.w;
  const cardW = 54;
  const cardH = Math.min(Math.round(cardW * ratio), 80);
  return (
    <button className={`bh-sz-card${active ? " bh-sz-card--on" : ""}`} onClick={onSelect}>
      <div className="bh-sz-card__paper" style={{ width: cardW, height: cardH }}>
        <div className="bh-sz-card__lines">
          {[...Array(4)].map((_, i) => <span key={i} />)}
        </div>
      </div>
      <span className="bh-sz-card__label">{s.label}</span>
      <span className="bh-sz-card__desc">{s.desc}</span>
      {active && <span className="bh-sz-card__check">✓</span>}
    </button>
  );
}
// ─── Print Modal — renders paginated pages then triggers print ────────────────
function PrintModal({ bookIdDetails, title, sizeKey, onClose }) {
  const printRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [status, setStatus] = useState("building");
  const layout = getLayout(sizeKey);
  const sz = PAGE_SIZES[sizeKey];
  const coverUrl = bookIdDetails?.cover_img_name
    ? `${import.meta.env.VITE_BOOK_IMAGE_URL}${bookIdDetails.cover_img_name}`
    : "";
  useEffect(() => {
    setStatus("building");
    const id = setTimeout(() => {
      try {
        const allPages = [];
        allPages.push({ type: "cover" });
        const chapters = (bookIdDetails?.book_chapters || []).filter(ch => hasValidContent(ch.content));
        chapters.forEach((chapter, chIdx) => {
          const titleHTML = `<h2>Chapter ${chIdx + 1}${chapter.title ? ` – ${chapter.title}` : ""}</h2>${chapter.content || ""}`;
          const paginated = paginateHTML(titleHTML, layout);
          paginated.forEach((html, pIdx) => {
            allPages.push({ type: "chapter", chapterIndex: chIdx, pageIndex: pIdx, html, chapter });
          });
        });
        setPages(allPages);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }, 150);
    return () => clearTimeout(id);
  }, [sizeKey]);
  const handlePrint = useCallback(() => {
    if (!printRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;";
    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    if (!win) return;
    win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || "My Book"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; }
        .print-page {
          width: ${layout.w}px;
          min-height: ${layout.h}px;
          background: white;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .print-page:last-child { page-break-after: avoid; }
        .print-rhead {
          display: flex; align-items: center; gap: 8px;
          padding: 72px 58px 0 86px;
        }
        .print-rhead-label {
          font-family: 'DM Sans', sans-serif; font-size: 7px; font-weight: 700;
          letter-spacing: .22em; color: #aaa; text-transform: uppercase; white-space: nowrap;
        }
        .print-rhead-rule { flex: 1; height: .5px; background: #e4e4e4; }
        .print-rhead-size { font-family: 'DM Mono', monospace; font-size: 7px; color: #ccc; }
        .print-body {
          flex: 1;
          padding: 16px 58px 16px 86px;
          font-size: ${layout.fontSize}px;
          line-height: 1.8; color: #1c1c1c;
          font-family: 'Lora', serif;
          word-break: break-word; overflow-wrap: break-word; overflow: hidden;
        }
        .print-body p  { margin: 0 0 .7em; }
        .print-body h1 { font-size: 2em; font-weight: bold; line-height: 1.2; margin: .2em 0 .35em; }
        .print-body h2 { font-size: 1.5em; font-weight: bold; line-height: 1.25; margin: .25em 0 .3em; }
        .print-body h3 { font-size: 1.17em; font-weight: bold; margin: .3em 0 .25em; }
        .print-body strong, .print-body b { font-weight: bold; }
        .print-body em, .print-body i { font-style: italic; }
        .print-body ul { list-style: disc; padding-left: 1.5em; margin: .4em 0; }
        .print-body ol { list-style: decimal; padding-left: 1.5em; margin: .4em 0; }
        .print-body blockquote { border-left: 3px solid #c8973a; margin: .7em 0; padding: .5em 1em; background: #fdf9f2; font-style: italic; color: #555; }
        .print-body table { border-collapse: collapse; width: 100%; margin: .6em 0; }
        .print-body td, .print-body th { border: 1px solid #ddd; padding: 4px 8px; }
        .print-body th { background: #f5f5f5; font-weight: 600; }
        .print-body img { max-width: 100%; height: auto; display: block; margin: .4em auto; }
        .print-folio {
          display: flex; align-items: center; gap: 10px;
          padding: 0 58px 96px 86px;
        }
        .print-folio-rule { flex: 1; height: .5px; background: #e4e4e4; }
        .print-folio-num { font-family: 'DM Sans', sans-serif; font-size: 9px; color: #aaa; letter-spacing: .07em; }
        .cover-page {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 24px;
          padding: 72px 58px 96px 86px;
          text-align: center;
        }
        .cover-page img { max-width: 60%; max-height: 400px; object-fit: contain; border-radius: 4px; }
        .cover-page h1 { font-family: 'Lora', serif; font-size: ${Math.round(layout.fontSize * 2.2)}px; font-weight: 700; color: #1a2f4a; }
        .cover-page h3 { font-family: 'DM Sans', sans-serif; font-size: ${Math.round(layout.fontSize * 1.1)}px; font-weight: 400; color: #666; }
        @media print {
          @page { size: ${sz.w}px ${sz.h}px; margin: 0; }
          body { width: ${sz.w}px; }
        }
      </style>
    </head>
    <body>
      ${printRef.current.innerHTML}
    </body>
    </html>
  `);
    win.document.close();
    iframe.onload = () => {
      win.focus();
      win.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  }, [layout, sz, title]);
  // const handlePrint = useCallback(() => {
  //   if (!printRef.current) return;
  //   const win = window.open("");
  //   if (!win) return;
  //   win.document.write(`
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>${title || "My Book"}</title>
  //       <style>
  //         @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');
  //         * { box-sizing: border-box; margin: 0; padding: 0; }
  //         body { background: white; }
  //         .print-page {
  //           width: ${layout.w}px;
  //           min-height: ${layout.h}px;
  //           background: white;
  //           page-break-after: always;
  //           display: flex;
  //           flex-direction: column;
  //           overflow: hidden;
  //           position: relative;
  //         }
  //         .print-page:last-child { page-break-after: avoid; }
  //         .print-rhead {
  //           display: flex; align-items: center; gap: 8px;
  //           padding: 72px 58px 0 86px;
  //         }
  //         .print-rhead-label {
  //           font-family: 'DM Sans', sans-serif; font-size: 7px; font-weight: 700;
  //           letter-spacing: .22em; color: #aaa; text-transform: uppercase; white-space: nowrap;
  //         }
  //         .print-rhead-rule { flex: 1; height: .5px; background: #e4e4e4; }
  //         .print-rhead-size { font-family: 'DM Mono', monospace; font-size: 7px; color: #ccc; }
  //         .print-body {
  //           flex: 1;
  //           padding: 16px 58px 16px 86px;
  //           font-size: ${layout.fontSize}px;
  //           line-height: 1.8; color: #1c1c1c;
  //           font-family: 'Lora', serif;
  //           word-break: break-word; overflow-wrap: break-word; overflow: hidden;
  //         }
  //         .print-body p  { margin: 0 0 .7em; }
  //         .print-body h1 { font-size: 2em; font-weight: bold; line-height: 1.2; margin: .2em 0 .35em; }
  //         .print-body h2 { font-size: 1.5em; font-weight: bold; line-height: 1.25; margin: .25em 0 .3em; }
  //         .print-body h3 { font-size: 1.17em; font-weight: bold; margin: .3em 0 .25em; }
  //         .print-body strong, .print-body b { font-weight: bold; }
  //         .print-body em, .print-body i { font-style: italic; }
  //         .print-body ul { list-style: disc; padding-left: 1.5em; margin: .4em 0; }
  //         .print-body ol { list-style: decimal; padding-left: 1.5em; margin: .4em 0; }
  //         .print-body blockquote { border-left: 3px solid #c8973a; margin: .7em 0; padding: .5em 1em; background: #fdf9f2; font-style: italic; color: #555; }
  //         .print-body table { border-collapse: collapse; width: 100%; margin: .6em 0; }
  //         .print-body td, .print-body th { border: 1px solid #ddd; padding: 4px 8px; }
  //         .print-body th { background: #f5f5f5; font-weight: 600; }
  //         .print-body img { max-width: 100%; height: auto; display: block; margin: .4em auto; }
  //         .print-folio {
  //           display: flex; align-items: center; gap: 10px;
  //           padding: 0 58px 96px 86px;
  //         }
  //         .print-folio-rule { flex: 1; height: .5px; background: #e4e4e4; }
  //         .print-folio-num { font-family: 'DM Sans', sans-serif; font-size: 9px; color: #aaa; letter-spacing: .07em; }
  //         .cover-page {
  //           display: flex; flex-direction: column; align-items: center;
  //           justify-content: center; gap: 24px;
  //           padding: 72px 58px 96px 86px;
  //           text-align: center;
  //         }
  //         .cover-page img { max-width: 60%; max-height: 400px; object-fit: contain; border-radius: 4px; }
  //         .cover-page h1 { font-family: 'Lora', serif; font-size: ${Math.round(layout.fontSize * 2.2)}px; font-weight: 700; color: #1a2f4a; }
  //         .cover-page h3 { font-family: 'DM Sans', sans-serif; font-size: ${Math.round(layout.fontSize * 1.1)}px; font-weight: 400; color: #666; }
  //         @media print {
  //           @page { size: ${sz.w}px ${sz.h}px; margin: 0; }
  //           body { width: ${sz.w}px; }
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       ${printRef.current.innerHTML}
  //     </body>
  //     </html>
  //   `);
  //   win.document.close();
  //   win.onload = () => {
  //     win.focus();
  //     win.print();
  //   };
  // }, [layout, sz, title]);
  let pageNum = 0;
  return (
    <div className="bh-print-overlay" onClick={onClose}>
      <div className="bh-print-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="bh-print-modal__head">
          <div className="bh-print-modal__title">
            <Download size={15} />
            <span>Download PDF — {PAGE_SIZES[sizeKey].label}</span>
            <span className="bh-print-modal__desc">{PAGE_SIZES[sizeKey].desc}</span>
          </div>
          <div className="bh-print-modal__actions">
            {status === "ready" && (
              <button className="bh-print-modal__print-btn" onClick={handlePrint}>
                <Download size={14} />
                Print / Save PDF
              </button>
            )}
            <button className="bh-print-modal__close" onClick={onClose}><X size={14} /></button>
          </div>
        </div>
        {/* Status */}
        {status === "building" && (
          <div className="bh-print-modal__loading">
            <div className="bh-spinner"><span /><span /><span /></div>
            <p>Laying out {PAGE_SIZES[sizeKey].label} pages…</p>
          </div>
        )}
        {/* Page Preview */}
        {status === "ready" && (
          <div className="bh-print-modal__canvas">
            {/* Hidden printable ref */}
            <div ref={printRef} style={{ display: "none" }}>
              {pages.map((pg, idx) => {
                if (pg.type === "cover") {
                  return (
                    <div key={idx} className="print-page cover-page">
                      {coverUrl && <img src={coverUrl} alt="Cover" />}
                      <h1>{title || "Untitled Book"}</h1>
                      <h3>by {bookIdDetails?.author || "Author"}</h3>
                    </div>
                  );
                }
                pageNum++;
                return (
                  <div key={idx} className="print-page">
                    <div className="print-rhead">
                      <span className="print-rhead-label">{(title || "").toUpperCase()}</span>
                      <span className="print-rhead-rule" />
                      <span className="print-rhead-size">{PAGE_SIZES[sizeKey].label}</span>
                    </div>
                    <div className="print-body" dangerouslySetInnerHTML={{ __html: pg.html }} />
                    <div className="print-folio">
                      <span className="print-folio-rule" />
                      <span className="print-folio-num">{pageNum}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Visual preview stack */}
            <div className="bh-print-modal__stack">
              {pages.map((pg, idx) => {
                const PREVIEW_W = 460;
                const scale = Math.min(PREVIEW_W / layout.w, 1);
                const scaledW = Math.round(layout.w * scale);
                const scaledH = Math.round(layout.h * scale);
                if (pg.type === "cover") {
                  return (
                    <div
                      key={idx}
                      className="bh-print-modal__page-wrap"
                      style={{ width: scaledW, height: scaledH }}
                    >
                      <div className="bh-print-modal__page-shadow" style={{ width: scaledW, height: scaledH }} />
                      <div
                        className="bh-print-modal__page"
                        style={{
                          width: layout.w, height: layout.h,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                          position: "absolute", top: 0, left: 0,
                        }}
                      >
                        <div className="bh-print-modal__cover">
                          {coverUrl && <img src={coverUrl} alt="Cover" style={{ maxWidth: "60%", maxHeight: 300, objectFit: "contain", borderRadius: 4 }} />}
                          <h1 style={{ fontFamily: "Georgia, serif", fontSize: layout.fontSize * 2.2, color: "#1a2f4a", textAlign: "center" }}>{title || "Untitled Book"}</h1>
                          <p style={{ fontFamily: "sans-serif", fontSize: layout.fontSize * 1.1, color: "#666" }}>by {bookIdDetails?.author || "Author"}</p>
                        </div>
                      </div>
                      <div className="bh-print-modal__page-num" style={{ position: "absolute", top: scaledH + 6, left: 0, width: "100%" }}>Cover</div>
                    </div>
                  );
                }
                const pNum = pages.slice(0, idx).filter(p => p.type !== "cover").length + 1;
                return (
                  <div
                    key={idx}
                    className="bh-print-modal__page-wrap"
                    style={{ width: scaledW, height: scaledH }}
                  >
                    <div className="bh-print-modal__page-shadow" style={{ width: scaledW, height: scaledH }} />
                    <div
                      className="bh-print-modal__page"
                      style={{
                        width: layout.w, height: layout.h,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        position: "absolute", top: 0, left: 0,
                      }}
                    >
                      {/* Running header */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "72px 58px 0 86px",
                      }}>
                        <span style={{ fontFamily: "sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: ".22em", color: "#aaa", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                          {(title || "").toUpperCase()}
                        </span>
                        <span style={{ flex: 1, height: .5, background: "#e4e4e4" }} />
                        <span style={{ fontFamily: "monospace", fontSize: 7, color: "#ccc" }}>{PAGE_SIZES[sizeKey].label}</span>
                      </div>
                      {/* Content body */}
                      <div
                        style={{
                          flex: 1,
                          padding: "16px 58px 16px 86px",
                          fontSize: layout.fontSize,
                          lineHeight: 1.8,
                          color: "#1c1c1c",
                          overflow: "hidden",
                          fontFamily: "Georgia, serif",
                          wordBreak: "break-word",
                        }}
                        dangerouslySetInnerHTML={{ __html: pg.html }}
                      />
                      {/* Folio */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "0 58px 96px 86px",
                      }}>
                        <span style={{ flex: 1, height: .5, background: "#e4e4e4" }} />
                        <span style={{ fontFamily: "sans-serif", fontSize: 9, color: "#aaa", letterSpacing: ".07em" }}>{pNum}</span>
                      </div>
                    </div>
                    <div className="bh-print-modal__page-num" style={{ position: "absolute", top: scaledH + 6, left: 0, width: "100%" }}>Page {pNum}</div>
                  </div>
                );
              })}
            </div>
            <div className="bh-print-modal__total">
              {pages.filter(p => p.type !== "cover").length} content pages + cover
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Main BookHeader ──────────────────────────────────────────────────────────
export default function BookHeader({
  bookId,
  title,
  onEditCover,
  bookIdDetails,
  onSubmit,
  loading,
}) {
  
  const [sizeKey, setSizeKey] = useState("TRADE");
  const [showSizePick, setShowSizePick] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const sizeRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!showSizePick) return;
    const handler = (e) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target)) {
        setShowSizePick(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSizePick]);
  console.log(bookIdDetails, "bookIdDetailsbookIdDetailsbookIdDetails")
  const isSubmitted = bookIdDetails?.book_submissions?.length > 0;
  const sz = PAGE_SIZES[sizeKey];

  return (
    <>
      <header className="book-header">
        <div className="book-title">
          <span className="book-icon">📘</span>
          <h3>{title || "Untitled Book"}</h3>
        </div>
        <div className="actions">
          <button className="action-btn edit-cover" onClick={onEditCover}>
            <ImageIcon size={16} />
            Edit Cover
          </button>
          <button
            className="action-btn submit-editing"
            onClick={() => {
              if (isSubmitted) {
                toast.info("You already submitted this book. Waiting for admin approval.");
                return;
              }
              onSubmit?.("submit");
            }}
            disabled={loading}
          >
            <Send size={16} />
            {loading ? "Submitting..." : "Submit for Editing"}
          </button>
          {/* {bookIdDetails?.book_editors?.length} */}
          {bookIdDetails?.book_chat_room?.id &&
          !bookIdDetails?.book_editors?.length <= 0
            &&
            <button
              className="action-btn submit-editing"
              onClick={() =>
                navigate(`/dashboard/chat/${bookIdDetails?.book_chat_room?.id}`, {
                  state: { book: bookIdDetails },
                })
              }
            >
              <MessageCircle size={16} />
              Chat
            </button>
          }
          {/* ── Download PDF with size selector ── */}
          <div className="bh-pdf-group" ref={sizeRef}>
            <button
              className="action-btn download-pdf bh-pdf-main"
              onClick={() => setShowPrintModal(true)}
              disabled={loading}
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              className="action-btn bh-pdf-size-toggle"
              onClick={() => setShowSizePick(v => !v)}
              disabled={loading}
              title="Choose page size"
            >
              <span className="bh-pdf-size-label">{sz.label}</span>
              <ChevronDown size={11} style={{ opacity: .7 }} />
            </button>
            {showSizePick && (
              <SizeDropdown
                current={sizeKey}
                onSelect={setSizeKey}
                onClose={() => setShowSizePick(false)}
              />
            )}
          </div>
        </div>
      </header>
      {showPrintModal && (
        <PrintModal
          bookIdDetails={bookIdDetails}
          title={title}
          sizeKey={sizeKey}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  );
}