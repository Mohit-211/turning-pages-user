import React, { useRef } from "react";
import { Tooltip } from "antd";
import {
  Sparkles,
  Square,
  Copy,
  CheckCheck,
  Edit3,
  Maximize2,
} from "lucide-react";
import InfoTip from "./InfoTip";

export default function ChapterAssist({
  instruction,
  setInstruction,
  generatedText,
  renderedHTML,
  streaming,
  copied,
  onGenerate,
  onStop,
  onCopy,
  onSetInEditor,
  onOpenReader,
}) {
  const instructionRef = useRef(null);
  const hasResult = generatedText?.trim().length > 0;

  return (
    <>
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
            if (
              e.key === "Enter" &&
              (e.ctrlKey || e.metaKey) &&
              !streaming &&
              instruction.trim()
            ) {
              onGenerate();
            }
          }}
        />
      </div>

      {/* Generate / Stop Button */}
      {streaming ? (
        <Tooltip title="Stop the current generation" placement="top">
          <button
            className="imp-ai-generate-btn imp-ai-generate-btn--stop"
            onClick={onStop}
          >
            <Square size={13} /> Stop Generating
          </button>
        </Tooltip>
      ) : (
        <Tooltip
          title={
            !instruction.trim()
              ? "Enter an instruction first"
              : "Generate content (Ctrl+Enter)"
          }
          placement="top"
        >
          <span style={{ display: "block" }}>
            <button
              className="imp-ai-generate-btn"
              onClick={onGenerate}
              disabled={!instruction.trim()}
              style={{ width: "100%" }}
            >
              <Sparkles size={14} /> Generate Content
            </button>
          </span>
        </Tooltip>
      )}

      {/* Action Buttons */}
      {hasResult && !streaming && (
        <div className="imp-ai-actions">
          <Tooltip
            title={copied ? "Copied to clipboard!" : "Copy generated text"}
            placement="top"
          >
            <button onClick={onCopy}>
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </Tooltip>

          <Tooltip
            title="Replace editor content with generated text"
            placement="top"
          >
            <button className="imp-ai-set-editor-btn" onClick={onSetInEditor}>
              <Edit3 size={14} /> Set in Editor
            </button>
          </Tooltip>
        </div>
      )}

      {/* Result Preview */}
      {(generatedText || streaming) && (
        <div className="imp-ai-result">
          <div className="imp-ai-result__header">
            <span className="imp-ai-result__header-label">
              {streaming ? "Generating…" : "Generated"}
            </span>

            {hasResult && !streaming && (
              <Tooltip title="Open full-screen reader" placement="top">
                <button
                  className="imp-ai-result__expand-btn"
                  onClick={onOpenReader}
                >
                  <Maximize2 size={11} /> Read Full
                </button>
              </Tooltip>
            )}
          </div>

          <div className="imp-ai-result__text">
            <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
            {streaming && <span className="imp-ai-cursor" />}
          </div>
        </div>
      )}
    </>
  );
}
