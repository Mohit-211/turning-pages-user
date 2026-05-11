import React, { useState, useRef, useMemo, useCallback } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { message, Tooltip } from "antd";
import DOMPurify from "dompurify";
import { marked } from "marked";

import InfoTip from "./InfoTip";
import ReaderModal from "./ReaderModal";
import UploadPanel from "./UploadPanel";
import ChapterAssist from "./ChapterAssist";
import TextAssist from "./TextAssist";

import "./InputModePanel.scss";

marked.setOptions({ breaks: true, gfm: true });

function renderMarkdown(raw = "") {
  if (!raw) return "";
  const normalized = raw.replace(/\\n\\n/g, "\n\n").replace(/\\n/g, "\n");
  return DOMPurify.sanitize(marked.parse(normalized));
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
  const [readerOpen, setReaderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chapter");

  const readerRef = useRef(null);
  const renderedHTML = useMemo(() => renderMarkdown(generatedText), [generatedText]);

  /* ── AI Generation ───────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!selectedId) return message.warning("Select a chapter first");
    if (!instruction.trim()) return message.warning("Enter instruction");

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
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            instruction: instruction.trim(),
            chapter_id: selectedId,
          }),
        }
      );

      const reader = response.body.getReader();
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
            if (data.token)
              setGeneratedText((prev) => prev + data.token.replace(/\\n/g, "\n"));
          } catch {}
        }
      }
    } catch {
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

  /* ── Upload Mode ─────────────────────────────────────────── */
  if (activeMode === "upload") {
    return (
      <UploadPanel
        onReplaceContent={onReplaceContent}
        onSwitchToManual={onSwitchToManual}
      />
    );
  }

  /* ── AI Mode ─────────────────────────────────────────────── */
  if (activeMode === "ai") {
    return (
      <>
        <aside className="imp-ai-sidebar">
          {/* Header */}
          <div className="imp-ai-header">
            <div className="imp-ai-header__left">
              <Sparkles size={15} color="#e5283c" />
              <span className="imp-ai-title">TAV Assist</span>
            </div>

            <Tooltip title="Close AI panel" placement="left">
              <button className="imp-ai-close" onClick={onClose}>
                <ChevronRight size={17} />
              </button>
            </Tooltip>
          </div>

          {/* Tabs */}
          <div className="imp-ai-tabs">
    <button
  className={`imp-ai-tab ${activeTab === "chapter" ? "imp-ai-tab--active" : ""}`}
  onClick={() => setActiveTab("chapter")}
>
  <span className="imp-ai-tab__content">
    📘 Chapter Assist

    <InfoTip text="Generate full chapter content using TAV instructions." />
  </span>
</button>

<button
  className={`imp-ai-tab ${activeTab === "text" ? "imp-ai-tab--active" : ""}`}
  onClick={() => setActiveTab("text")}
>
  <span className="imp-ai-tab__content">
    ✨ Text Assist

    <InfoTip text="Rewrite, improve, expand, shorten, or refine selected text." />
  </span>
</button>
          </div>

          {/* Tab Body */}
          <div className="imp-ai-body">
            {activeTab === "chapter" && (
              <ChapterAssist
                instruction={instruction}
                setInstruction={setInstruction}
                generatedText={generatedText}
                renderedHTML={renderedHTML}
                streaming={streaming}
                copied={copied}
                onGenerate={handleGenerate}
                onStop={handleStop}
                onCopy={handleCopy}
                onSetInEditor={handleSetInEditor}
                onOpenReader={() => setReaderOpen(true)}
              />
            )}

            {activeTab === "text" && <TextAssist />}
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
