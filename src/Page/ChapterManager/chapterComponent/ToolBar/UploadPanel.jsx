import React, { useState, useRef } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { message, Tooltip } from "antd";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromFile(file) {
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
}

export default function UploadPanel({ onReplaceContent, onSwitchToManual }) {
  const [dragging, setDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const fileInputRef = useRef(null);

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
                Drag & drop your file here
                <br />
                or click to browse
              </p>
              <p className="imp-dropzone__hint">
                Supports: <b>.docx, .pdf, .txt</b>
              </p>
            </>
          )}
        </div>

        {droppedFile && (
          <Tooltip title="Upload file content into the editor" placement="top">
            <button
              className="imp-ai-generate-btn"
              onClick={handleUploadToEditor}
              style={{ marginTop: "16px", width: "100%" }}
            >
              Upload to Editor
            </button>
          </Tooltip>
        )}

        <Tooltip title="Go back to manual editing" placement="top">
          <button
            className="imp-ai-close"
            onClick={onSwitchToManual}
            style={{ marginTop: "12px" }}
          >
            Cancel
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
