import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload as UploadIcon,
  Sparkles,
  Copy,
  CheckCheck,
  Square,
  Edit3,
  Maximize2,
  X,
  FileText,
  AlertCircle,
  Info,
  BookOpen,
} from "lucide-react";
import { message } from "antd";
import DOMPurify from "dompurify";
import { marked } from "marked";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import "./InputModePanel.scss";

// PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

marked.setOptions({ breaks: true, gfm: true });

function renderMarkdown(raw = "") {
  if (!raw) return "";
  return DOMPurify.sanitize(marked.parse(raw));
}

function wordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─────────────────────────────────────────────────────────────
//  Tooltip Component  (portal-free, fixed position)
// ─────────────────────────────────────────────────────────────
function Tooltip({ content, children, position = "top", maxWidth = 220 }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 180);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    const tt = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    let top, left;

    switch (position) {
      case "bottom":
        top  = tr.bottom + gap;
        left = tr.left + tr.width / 2 - tt.width / 2;
        break;
      case "left":
        top  = tr.top + tr.height / 2 - tt.height / 2;
        left = tr.left - tt.width - gap;
        break;
      case "right":
        top  = tr.top + tr.height / 2 - tt.height / 2;
        left = tr.right + gap;
        break;
      default: // top
        top  = tr.top - tt.height - gap;
        left = tr.left + tr.width / 2 - tt.width / 2;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - tt.width - 8));
    setCoords({ top, left });
  }, [visible, position]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <>
      <span
        ref={triggerRef}
        className="imp-tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tooltipRef}
          className={`imp-tooltip imp-tooltip--${position}`}
          style={{ top: coords.top, left: coords.left, maxWidth }}
          role="tooltip"
        >
          {content}
          <span className={`imp-tooltip__arrow imp-tooltip__arrow--${position}`} />
        </div>
      )}
    </>
  );
}

// Inline info icon with tooltip
function InfoTip({ text, position = "top" }) {
  return (
    <Tooltip content={text} position={position} maxWidth={240}>
      <span className="imp-info-tip" tabIndex={0} aria-label="More information">
        <Info size={12} />
      </span>
    </Tooltip>
  );
}

// ─────────────────────────────────────────────────────────────
//  Utility: strip HTML tags to plain text
// ─────────────────────────────────────────────────────────────
function htmlToPlainText(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────────
//  Context Preview Panel  (shown when matchedContent exists)
// ─────────────────────────────────────────────────────────────
function ContextPanel({ matchedContent, onSaveContext }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(htmlToPlainText(matchedContent));
  }, [matchedContent]);

  const wc = useMemo(() => wordCount(value), [value]);

  return (
    <div className={`imp-context-panel ${expanded ? "imp-context-panel--expanded" : ""}`}>
      
      {/* HEADER */}
      <div
        className="imp-context-panel__header"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="imp-context-panel__header-left">
          <BookOpen size={13} />
          <span className="imp-context-panel__title">Chapter Context</span>
          <span className="imp-context-panel__badge">{wc} words</span>
        </div>

        <div className="imp-context-panel__header-right">
          {!editing && (
            <button
              className="imp-context-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              <Edit3 size={12} /> Edit
            </button>
          )}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>

      {/* BODY */}
      <div className="imp-context-panel__body">
        {editing ? (
          <>
            <textarea
              className="imp-ai-textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={6}
            />

            <div className="imp-context-actions">
              <button
                className="imp-ai-generate-btn"
                onClick={() => {
                  onSaveContext?.(value);   // 🔥 SAVE TO PARENT
                  setEditing(false);
                }}
              >
                Save
              </button>

              <button
                className="imp-ai-close"
                onClick={() => {
                  setValue(htmlToPlainText(matchedContent));
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="imp-context-panel__text">
            {expanded
              ? value
              : value.length > 280
              ? value.slice(0, 280) + "…"
              : value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Inline Context Panel
//  Shown after the user types context in NoContextInput and
//  confirms it. Displays a collapsible read-only preview with
//  a "Clear & re-enter" button so they can change it.
// ─────────────────────────────────────────────────────────────
function InlineContextPanel({ context, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const wc      = useMemo(() => wordCount(context), [context]);
  const preview = useMemo(
    () => (context.length > 280 ? context.slice(0, 280).trimEnd() + "…" : context),
    [context]
  );

  return (
    <div className="imp-context-panel imp-context-panel--inline">
      <button
        className="imp-context-panel__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="imp-context-panel__header-left">
          <BookOpen size={13} />
          <span className="imp-context-panel__title">Context (session only)</span>
          <span className="imp-context-panel__badge">{wc} words</span>
        </div>
        <div className="imp-context-panel__header-right">
          <InfoTip
            text="This context was typed manually and is used only for this session. It is not saved to the chapter."
            position="left"
          />
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>
      <div className="imp-context-panel__body">
        <p className="imp-context-panel__text">{expanded ? context : preview}</p>
        <button
          className="imp-context-panel__change-btn"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
        >
          ✕ Clear &amp; re-enter context
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  No-Context Input
//  User types/pastes context. Clicking "Use this context"
//  (or Ctrl+Enter) calls onConfirm(text) which stores the
//  value in parent state — the instruction field then unlocks.
// ─────────────────────────────────────────────────────────────
function NoContextInput({ onConfirm }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleConfirm = () => {
    if (value.trim()) onConfirm(value.trim());
  };

  return (
    <div className="imp-no-context-input">
      <div className="imp-no-context-input__header">
        <AlertCircle size={14} className="imp-no-context-input__icon" />
        <span className="imp-no-context-input__title">No context found</span>
        <InfoTip
          text="Context is the background the AI uses to write story-consistent content. Add a summary or paste existing chapter text — it will be sent with every generation request this session."
          position="right"
        />
      </div>

      <p className="imp-no-context-input__desc">
        Add context so the AI can generate relevant content for this chapter.
      </p>

      <textarea
        ref={textareaRef}
        className="imp-ai-textarea imp-no-context-input__textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleConfirm();
        }}
        rows={5}
        placeholder="Paste or write chapter context here… (Ctrl+Enter to confirm)"
      />

      <button
        className="imp-ai-generate-btn"
        onClick={handleConfirm}
        disabled={!value.trim()}
        style={{ marginTop: "10px", width: "100%" }}
      >
        <CheckCheck size={14} /> Use this context
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Full-Size Reader Modal
// ─────────────────────────────────────────────────────────────
function ReaderModal({ html, rawText, onClose, onSetInEditor, onCopy, copied }) {
  const wc        = useMemo(() => wordCount(rawText), [rawText]);
  const charCount = rawText?.length ?? 0;

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="imp-reader-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="imp-reader-modal" role="dialog" aria-modal="true" aria-label="Generated Content Reader">
        <div className="imp-reader-header">
          <div className="imp-reader-header__left">
            <div className="imp-reader-header__icon"><FileText size={16} /></div>
            <div>
              <p className="imp-reader-title">Generated Content</p>
              <p className="imp-reader-subtitle">{wc} words · {charCount} characters</p>
            </div>
          </div>
          <div className="imp-reader-header-actions">
            <Tooltip content="Copy the full generated text to your clipboard." position="bottom">
              <button className="imp-reader-action-btn" onClick={onCopy}>
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </Tooltip>
            <Tooltip content="Replace the current editor content with this generated text." position="bottom">
              <button
                className="imp-reader-action-btn imp-reader-action-btn--primary"
                onClick={() => { onSetInEditor(); onClose(); }}
              >
                <Edit3 size={14} /> Set in Editor
              </button>
            </Tooltip>
            <button
              className="imp-reader-action-btn imp-reader-action-btn--close"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="imp-reader-body" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="imp-reader-footer">
          <div className="imp-reader-footer__word-count">
            <span>{wc}</span> words · <span>{charCount}</span> characters
          </div>
          <div className="imp-reader-footer__actions">
            <button className="imp-reader-action-btn" onClick={onClose}>Close</button>
            <button
              className="imp-reader-action-btn imp-reader-action-btn--primary"
              onClick={() => { onSetInEditor(); onClose(); }}
            >
              <Edit3 size={14} /> Set in Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
export default function InputModePanel({
  activeMode,
  onClose,
  onSwitchToManual,
  selectedId,
  onInsertContent,
  onReplaceContent,
  editorContent,
  matchedContent,
  onSaveContext,
}) {
  const [instruction, setInstruction]     = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [streaming, setStreaming]         = useState(false);
  const [copied, setCopied]               = useState(false);
  const [readerOpen, setReaderOpen]       = useState(false);

  // Inline context: typed by user when matchedContent is absent.
  // Persists across re-renders; cleared only when user clicks
  // "Clear & re-enter" inside InlineContextPanel.
  const [inlineContext, setInlineContext] = useState("");

  const instructionRef = useRef(null);
  const readerRef      = useRef(null);

  const renderedHTML = useMemo(() => renderMarkdown(generatedText), [generatedText]);

  // hasContext is true when either the chapter has saved context
  // OR the user supplied inline context this session.
  const hasContext = Boolean(matchedContent?.trim()) || Boolean(inlineContext.trim());

  // The actual string sent to the API — saved context takes priority.
  const resolvedContext = useMemo(() => {
    if (matchedContent?.trim()) return htmlToPlainText(matchedContent);
    if (inlineContext.trim())   return inlineContext.trim();
    return null;
  }, [matchedContent, inlineContext]);

  // Upload states
  const [dragging, setDragging]       = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => () => readerRef.current?.cancel?.(), []);

  // Auto-focus the instruction field as soon as context becomes available.
  useEffect(() => {
    if (hasContext) {
      setTimeout(() => instructionRef.current?.focus(), 50);
    }
  }, [hasContext]);

  /* ====================== FILE UPLOAD ====================== */
  const extractTextFromFile = async (file) => {
    const type = file.type;
    try {
      if (type === "text/plain") return await file.text();
      if (type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n\n";
        }
        return text.trim();
      }
      if (
        type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        return result.value.trim();
      }
      message.error("Unsupported file");
      return "";
    } catch {
      message.error("Failed to read file");
      return "";
    }
  };

  const handleUploadToEditor = async () => {
    if (!droppedFile) return message.warning("Select a file");
    try {
      const text = await extractTextFromFile(droppedFile);
      if (!text?.trim()) return message.warning("No text found");
      const html = text
        .split(/\n\s*\n/)
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
      onReplaceContent?.(html);
      message.success("Uploaded to editor");
      setDroppedFile(null);
      setTimeout(() => onSwitchToManual?.(), 400);
    } catch {
      message.error("Upload failed");
    }
  };

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) setDroppedFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => {
    if (e.target.files[0]) setDroppedFile(e.target.files[0]);
  };

  /* ====================== AI GENERATION ====================== */
  const handleGenerate = useCallback(async () => {
    if (!selectedId) return message.warning("Select a chapter first");

    if (!instruction.trim()) {
      message.warning("Enter an instruction");
      instructionRef.current?.focus();
      return;
    }

    if (!resolvedContext) {
      return message.warning("Please add context for this chapter before generating content.");
    }

    setStreaming(true);
    setGeneratedText("");
    setReaderOpen(false);
    readerRef.current?.cancel?.();

    const token = localStorage.getItem("book_publish_token");

    try {
      const response = await fetch(
        "https://api.turningpages.io:9090/api/v1/chapters/generate/chapter/content",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-access-token": token },
          body: JSON.stringify({
            instruction: instruction.trim(),
            chapter_id:  selectedId,
            context:     resolvedContext,
          }),
        }
      );

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      readerRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace("data:", "").trim();
          if (jsonStr === "[DONE]") break;
          try {
            const data = JSON.parse(jsonStr);
            if (data.token) setGeneratedText((prev) => prev + data.token);
          } catch { /* partial chunk – skip */ }
        }
      }
    } catch {
      message.error("Generation failed");
    } finally {
      setStreaming(false);
      readerRef.current = null;
    }
  }, [selectedId, instruction, resolvedContext]);

  const handleStop = () => { readerRef.current?.cancel?.(); setStreaming(false); };

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedText]);

  const handleSetInEditor = useCallback(() => {
    if (!generatedText.trim()) return;
    onReplaceContent?.(renderMarkdown(generatedText));
    message.success("✅ Content set in editor!");
  }, [generatedText, onReplaceContent]);

  // ── Upload Mode ──────────────────────────────────────────────
  if (activeMode === "upload") {
    return (
      <div className="imp-upload-panel">
        <div className="imp-upload-card">
          <h3 className="imp-upload-card__title">
            <UploadIcon size={20} strokeWidth={2} /> Upload Chapter Content
          </h3>

          <Tooltip
            content="Drag & drop or click to pick a file. Supported: .docx, .pdf, .txt — the text will be extracted and placed into the chapter editor."
            position="top"
            maxWidth={270}
          >
            <div
              className={`imp-dropzone ${dragging ? "imp-dropzone--active" : ""} ${droppedFile ? "imp-dropzone--has-file" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.txt"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div className="imp-dropzone__icon">
                <UploadIcon size={36} strokeWidth={1.5} />
              </div>
              {droppedFile ? (
                <>
                  <p className="imp-dropzone__filename">{droppedFile.name}</p>
                  <p className="imp-dropzone__hint">Click to change file</p>
                </>
              ) : (
                <>
                  <p className="imp-dropzone__label">
                    Drag & drop your file here<br />or click to browse
                  </p>
                  <p className="imp-dropzone__hint">Supports: <b>.docx, .pdf, .txt</b></p>
                </>
              )}
            </div>
          </Tooltip>

          {droppedFile && (
            <Tooltip
              content="Extract text from the file and replace the editor content with it."
              position="top"
            >
              <button
                className="imp-ai-generate-btn"
                onClick={handleUploadToEditor}
                style={{ marginTop: "16px", width: "100%" }}
              >
                Upload to Editor
              </button>
            </Tooltip>
          )}

          <button className="imp-ai-close" onClick={onSwitchToManual} style={{ marginTop: "12px" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── AI Mode ──────────────────────────────────────────────────
 if (activeMode === "ai") {
  const hasResult = generatedText?.trim().length > 0;

  const renderContextSection = () => {
    if (matchedContent?.trim()) {
      return <ContextPanel
  matchedContent={matchedContent}
  onSaveContext={(updatedText) => {
    console.log("Updated Context:", updatedText);

    // 🔥 Optional: save to backend
    onSaveContext?.(updatedText);
  }}
/>;
    }
    if (inlineContext.trim()) {
      return (
        <InlineContextPanel
          context={inlineContext}
          onClear={() => {
            setInlineContext("");
            setGeneratedText("");
          }}
        />
      );
    }
    return (
      <NoContextInput
        onConfirm={(text) => {
          setInlineContext(text);
          setTimeout(() => instructionRef.current?.focus(), 80);
        }}
      />
    );
  };

  return (
    <>
      <aside className="imp-ai-sidebar">
        {/* Header */}
        <div className="imp-ai-header">
          <div className="imp-ai-header__left">
            <Sparkles size={15} color="#e5283c" />
            <span className="imp-ai-title">TAV Assistant</span>
            <InfoTip
              text="TAV Assistant generates chapter content using your instruction. Adding context improves accuracy but is optional."
              position="right"
            />
          </div>
          <Tooltip content="Close the AI assistant panel" position="left">
            <button className="imp-ai-close" onClick={onClose}>
              <ChevronRight size={17} />
            </button>
          </Tooltip>
        </div>

        {/* Body */}
        <div className="imp-ai-body">

          {/* Context */}
          {renderContextSection()}

          {/* Instruction */}
          <div className="imp-ai-field">
            <label className="imp-ai-label">
              Tell the TAV what to generate
              <span className="imp-ai-label__required"> *</span>
              <InfoTip
                text="Describe what the AI should write — e.g. 'Continue the story' or 'Write dialogue scene'."
                position="right"
              />
            </label>

            {/* Warning instead of blocking */}
            {!hasContext && (
              <p className="imp-ai-field__warning">
                <AlertCircle size={12} />
                No context added — AI output may be generic.
              </p>
            )}

            <textarea
              ref={instructionRef}
              className="imp-ai-textarea imp-ai-textarea--instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={5}
              placeholder="Write what you want the AI to generate…"
              disabled={streaming}   // ✅ FIXED
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (e.ctrlKey || e.metaKey) &&
                  !streaming &&
                  instruction.trim()
                ) handleGenerate();
              }}
            />

            <p className="imp-ai-field__hint">
              Tip: Press Ctrl+Enter to generate
            </p>
          </div>

          {/* Generate / Stop */}
          {streaming ? (
            <button
              className="imp-ai-generate-btn imp-ai-generate-btn--stop"
              onClick={handleStop}
            >
              <Square size={13} /> Stop Generating
            </button>
          ) : (
            <button
              className="imp-ai-generate-btn"
              onClick={handleGenerate}
              disabled={!instruction.trim()}
            >
              <Sparkles size={14} /> Generate Content
            </button>
          )}

          {/* Actions */}
          {hasResult && !streaming && (
            <div className="imp-ai-actions">
              <button onClick={handleCopy}>
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                className="imp-ai-set-editor-btn"
                onClick={handleSetInEditor}
              >
                <Edit3 size={14} /> Set in Editor
              </button>
            </div>
          )}

          {/* Result */}
          {(generatedText || streaming) && (
            <div className="imp-ai-result">
              <div className="imp-ai-result__header">
                <span>
                  {streaming ? "Generating…" : "Generated"}
                </span>

                {hasResult && !streaming && (
                  <button className="imp-ai-result__expand-btn" onClick={() => setReaderOpen(true)}>
                    <Maximize2 size={11} /> Read Full
                  </button>
                )}
              </div>

              <div className="imp-ai-result__text">
                <div
                  dangerouslySetInnerHTML={{ __html: renderedHTML }}
                />
                {streaming && <span className="imp-ai-cursor" />}
              </div>
            </div>
          )}
        </div>
      </aside>

      {readerOpen && (
        <ReaderModal
          html={renderedHTML}
          rawText={generatedText}
          onClose={() => setReaderOpen(false)}
          onSetInEditor={handleSetInEditor}
          onCopy={handleCopy}
          copied={copied}
        />
      )}
    </>
  );
}
  return null;
}