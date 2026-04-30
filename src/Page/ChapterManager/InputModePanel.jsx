import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronRight,
  Upload as UploadIcon,
  Sparkles,
  Copy,
  CheckCheck,
  Plus,
  RefreshCw,
  Square,
  Edit3,
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

  // Drag Drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
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
  const handleGenerate = async () => {
    if (!selectedId) return message.warning("Select a chapter first");
    if (!instruction.trim()) {
      message.warning("Enter instruction");
      instructionRef.current?.focus();
      return;
    }

    setStreaming(true);
    setGeneratedText("");
    readerRef.current?.cancel?.();

    const token = localStorage.getItem("book_publish_token");

    try {
      const response = await fetch("https://api.turningpages.io:9090/api/v1/chapters/generate/chapter/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ instruction: instruction.trim(), chapter_id: selectedId, context: "" }),
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
              if (data.token) setGeneratedText(prev => prev + data.token);
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetInEditor = () => {
    if (!generatedText.trim()) return;
    onReplaceContent?.(renderMarkdown(generatedText));
    message.success("✅ Content set in editor!");
    // setTimeout(onSwitchToManual, 600);
  };

// Upload Mode
  if (activeMode === "upload") {
    return (
      <div className="imp-upload-panel">
        <div className="imp-upload-card">
          <h3 className="imp-upload-card__title">
            <UploadIcon size={20} strokeWidth={2} /> Upload Chapter Content
          </h3>

          <div
            className={`imp-dropzone ${dragging ? "imp-dropzone--active" : ""} ${
              droppedFile ? "imp-dropzone--has-file" : ""
            }`}
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
                <p className="imp-dropzone__hint">
                  Supports: <b>.docx, .pdf, .txt</b>
                </p>
              </>
            )}
          </div>

          {droppedFile && (
            <button
              className="imp-ai-generate-btn"
              onClick={handleUploadToEditor}
              style={{ marginTop: "16px", width: "100%" }}
            >
              Upload to Editor
            </button>
          )}

          <button
            className="imp-ai-close"
            onClick={onSwitchToManual}
            style={{ marginTop: "12px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // AI Mode - Main Focus
  if (activeMode === "ai") {
    return (
      <aside className="imp-ai-sidebar">
        <div className="imp-ai-header">
          <div className="imp-ai-header__left">
            <Sparkles size={15} />
            <span className="imp-ai-title">AI Assistant</span>
          </div>
          <button className="imp-ai-close" onClick={onClose}>
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="imp-ai-body">
          <div className="imp-ai-field">
            <label className="imp-ai-label">Instruction <span className="imp-ai-label__required">*</span></label>
            <textarea
              ref={instructionRef}
              className="imp-ai-textarea"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={5}
              placeholder="Continue the story where Arin enters the forest..."
              disabled={streaming}
            />
          </div>

          {streaming ? (
            <button className="imp-ai-generate-btn imp-ai-generate-btn--stop" onClick={handleStop}>
              <Square size={13} /> Stop Generating
            </button>
          ) : (
            <button className="imp-ai-generate-btn" onClick={handleGenerate} disabled={!instruction.trim()}>
              <Sparkles size={14} /> Generate Content
            </button>
          )}

          {(generatedText || streaming) && (
            <>
              {/* FORCE SHOW BUTTONS */}
             {generatedText?.trim().length > 0 && !streaming && (
                <div className="imp-ai-actions">
                  {/* <button onClick={() => onInsertContent?.(renderMarkdown(generatedText))}>
                    <Plus size={14} /> Smart Insert
                  </button>
                  <button onClick={() => onReplaceContent?.(renderMarkdown(generatedText))}>
                    <RefreshCw size={14} /> Replace All
                  </button> */}
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
              <div className="imp-ai-result">
                <div className="imp-ai-result__text">
                  <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
                  {streaming && <span className="imp-ai-cursor" />}
                </div>
              </div>
            </>


          )}
        </div>
      </aside>
    );
  }

  return null;
}