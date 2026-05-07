import React, { useEffect, useMemo } from "react";
import { Tooltip } from "antd";
import { FileText, Copy, CheckCheck, Edit3, X } from "lucide-react";

function wordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function ReaderModal({ html, rawText, onClose, onSetInEditor, onCopy, copied }) {
  const wc = useMemo(() => wordCount(rawText), [rawText]);
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
      <div
        className="imp-reader-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Generated Content Reader"
      >
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
              <button
                className="imp-reader-action-btn imp-reader-action-btn--primary"
                onClick={() => { onSetInEditor(); onClose(); }}
              >
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
              <button
                className="imp-reader-action-btn imp-reader-action-btn--primary"
                onClick={() => { onSetInEditor(); onClose(); }}
              >
                <Edit3 size={14} /> Set in Editor
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
