import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ChevronRight,
  Upload as UploadIcon,
  Sparkles,
  Copy,
  CheckCheck,
  RefreshCw,
  Square,
  Edit3,
  Maximize2,
  X,
  FileText,
  Info,
} from "lucide-react";
import { message, Tooltip } from "antd";
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
  const normalized = raw
    .replace(/\\n\\n/g, "\n\n")
    .replace(/\\n/g, "\n");
  return DOMPurify.sanitize(marked.parse(normalized));
}

function wordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─────────────────────────────────────────────────────────────
//  InfoTip — must be outside main component
// ─────────────────────────────────────────────────────────────
function InfoTip({ text, position = "top" }) {
  return (
    <Tooltip title={text} placement={position}>
      <span className="imp-info-tip" tabIndex={0} aria-label="More information">
        <Info size={12} />
      </span>
    </Tooltip>
  );
}

// ─────────────────────────────────────────────────────────────
//  Full-Size Reader Modal
// ─────────────────────────────────────────────────────────────
function ReaderModal({ html, rawText, onClose, onSetInEditor, onCopy, copied }) {
  const wc = useMemo(() => wordCount(rawText), [rawText]);
  const charCount = rawText?.length ?? 0;

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="imp-reader-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="imp-reader-modal" role="dialog" aria-modal="true" aria-label="Generated Content Reader">
        {/* Header */}
        <div className="imp-reader-header">
          <div className="imp-reader-header__left">
            <div className="imp-reader-header__icon">
              <FileText size={16} />
            </div>
            <div>
              <p className="imp-reader-title">Generated Content</p>
              <p className="imp-reader-subtitle">{wc} words · {charCount} characters</p>
            </div>
          </div>
          <div className="imp-reader-header-actions">
            <Tooltip title={copied ? "Copied to clipboard!" : "Copy generated text"} placement="top">
              <button className="imp-reader-action-btn" onClick={onCopy}>
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </Tooltip>

            <Tooltip title="Replace editor content with this" placement="top">
              <button className="imp-reader-action-btn imp-reader-action-btn--primary" onClick={() => { onSetInEditor(); onClose(); }}>
                <Edit3 size={14} /> Set in Editor
              </button>
            </Tooltip>

            <Tooltip title="Close (Esc)" placement="left">
              <button className="imp-reader-action-btn imp-reader-action-btn--close" onClick={onClose}>
                <X size={16} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Body */}
        <div className="imp-reader-body" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Footer */}
        <div className="imp-reader-footer">
          <div className="imp-reader-footer__word-count">
            <span>{wc}</span> words · <span>{charCount}</span> characters
          </div>
          <div className="imp-reader-footer__actions">
            <Tooltip title="Close reader" placement="top">
              <button className="imp-reader-action-btn" onClick={onClose}>
                Close
              </button>
            </Tooltip>

            <Tooltip title="Replace editor content with this" placement="top">
              <button className="imp-reader-action-btn imp-reader-action-btn--primary" onClick={() => { onSetInEditor(); onClose(); }}>
                <Edit3 size={14} /> Set in Editor
              </button>
            </Tooltip>
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
}) {
  const [instruction, setInstruction] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);

  const instructionRef = useRef(null);
  const readerRef = useRef(null);

  const renderedHTML = useMemo(() => renderMarkdown(generatedText), [generatedText]);

  // Upload states
  const [dragging, setDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => readerRef.current?.cancel?.();
  }, []);

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
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(" ") + "\n\n";
        }
        return text.trim();
      }
      if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        return result.value.trim();
      }
      message.error("Unsupported file");
      return "";
    } catch (err) {
      message.error("Failed to read file");
      return "";
    }
  };

  const handleUploadToEditor = async () => {
    if (!droppedFile) return message.warning("Select a file");
    try {
      const text = await extractTextFromFile(droppedFile);
      if (!text?.trim()) return message.warning("No text found");
      const html = text.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
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
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) setDroppedFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => {
    if (e.target.files[0]) setDroppedFile(e.target.files[0]);
  };

  /* ====================== AI GENERATION ====================== */
  const handleGenerate = async () => {
    if (!selectedId) return message.warning("Select a chapter first");
    if (!instruction.trim()) {
      message.warning("Enter instruction");
      instructionRef.current?.focus();
      return;
    }

    setStreaming(true);
    setGeneratedText("");
    setReaderOpen(false);
    readerRef.current?.cancel?.();

    const token = localStorage.getItem("book_publish_token");

    try {
      const response = await fetch("https://api.turningpages.io:9090/api/v1/chapters/generate/chapter/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ instruction: instruction.trim(), chapter_id: selectedId }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      readerRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const jsonStr = line.replace("data:", "").trim();
            if (jsonStr === "[DONE]") break;
            try {
              const data = JSON.parse(jsonStr);
              if (data.token) setGeneratedText(prev => prev + data.token.replace(/\\n/g, "\n"));
            } catch { }
          }
        }
      }
    } catch (err) {
      message.error("Generation failed");
    } finally {
      setStreaming(false);
      readerRef.current = null;
    }
  };

  const handleStop = () => {
    readerRef.current?.cancel?.();
    setStreaming(false);
  };

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
                <p className="imp-dropzone__label">Drag & drop your file here<br />or click to browse</p>
                <p className="imp-dropzone__hint">Supports: <b>.docx, .pdf, .txt</b></p>
              </>
            )}
          </div>

          {droppedFile && (
            <Tooltip title="Upload file content into the editor" placement="top">
              <button className="imp-ai-generate-btn" onClick={handleUploadToEditor} style={{ marginTop: "16px", width: "100%" }}>
                Upload to Editor
              </button>
            </Tooltip>
          )}

          <Tooltip title="Go back to manual editing" placement="top">
            <button className="imp-ai-close" onClick={onSwitchToManual} style={{ marginTop: "12px" }}>
              Cancel
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  // ── AI Mode ──────────────────────────────────────────────────
  if (activeMode === "ai") {
    const hasResult = generatedText?.trim().length > 0;

    return (
      <>
        <aside className="imp-ai-sidebar">
          {/* Header */}
          <div className="imp-ai-header">
            <div className="imp-ai-header__left">
              <Sparkles size={15} color="#e5283c" />
              <span className="imp-ai-title">TAV Assistant</span>
            </div>
            <Tooltip title="Close AI panel" placement="left">
              <button className="imp-ai-close" onClick={onClose}>
                <ChevronRight size={17} />
              </button>
            </Tooltip>
          </div>

          {/* Body */}
          <div className="imp-ai-body">
            {/* Instruction Field */}
            <div className="imp-ai-field">
              <label className="imp-ai-label">
                Tell the TAV what to generate
                <span className="imp-ai-label__required"> *</span>
                <InfoTip
                  text="Describe what the TAV Assist should write — e.g. 'Continue the story' or 'Write dialogue scene'."
                  position="right"
                />
              </label>
              <textarea
                ref={instructionRef}
                className="imp-ai-textarea imp-ai-textarea--instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={5}
                placeholder="Write what happens next..."
                disabled={streaming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !streaming && instruction.trim()) {
                    handleGenerate();
                  }
                }}
              />
            </div>

            {/* Generate / Stop Button */}
            {streaming ? (
              <Tooltip title="Stop the current generation" placement="top">
                <button className="imp-ai-generate-btn imp-ai-generate-btn--stop" onClick={handleStop}>
                  <Square size={13} /> Stop Generating
                </button>
              </Tooltip>
            ) : (
              <Tooltip
                title={!instruction.trim() ? "Enter an instruction first" : "Generate content (Ctrl+Enter)"}
                placement="top"
              >
                <span style={{ display: "block" }}>
                  <button
                    className="imp-ai-generate-btn"
                    onClick={handleGenerate}
                    disabled={!instruction.trim()}
                    style={{ width: "100%" }}
                  >
                    <Sparkles size={14} /> Generate Content
                  </button>
                </span>
              </Tooltip>
            )}

            {/* Action Buttons — shown when result is ready */}
            {hasResult && !streaming && (
              <div className="imp-ai-actions">
                <Tooltip title={copied ? "Copied to clipboard!" : "Copy generated text"} placement="top">
                  <button onClick={handleCopy}>
                    {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </Tooltip>

                <Tooltip title="Replace editor content with generated text" placement="top">
                  <button className="imp-ai-set-editor-btn" onClick={handleSetInEditor}>
                    <Edit3 size={14} /> Set in Editor
                  </button>
                </Tooltip>
              </div>
            )}

            {/* Result Preview */}
            {(generatedText || streaming) && (
              <div className="imp-ai-result">
                {/* Result Header */}
                <div className="imp-ai-result__header">
                  <span className="imp-ai-result__header-label">
                    {streaming ? "Generating…" : "Generated"}
                  </span>
                  {hasResult && !streaming && (
                    <Tooltip title="Open full-screen reader" placement="top">
                      <button
                        className="imp-ai-result__expand-btn"
                        onClick={() => setReaderOpen(true)}
                      >
                        <Maximize2 size={11} /> Read Full
                      </button>
                    </Tooltip>
                  )}
                </div>

                {/* Text Preview */}
                <div className="imp-ai-result__text">
                  <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
                  {streaming && <span className="imp-ai-cursor" />}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Full-Size Reader Modal */}
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