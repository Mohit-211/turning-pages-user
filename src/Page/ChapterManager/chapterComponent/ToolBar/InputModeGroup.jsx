import React from "react";
import { Edit, Upload, Sparkles } from "lucide-react";
import { Tooltip } from "antd";

export default function InputModeGroup({
  activeMode,
  onModeChange,
  disabled,
  onWriteManually,
  onOpenUploadModal,
  onOpenAIAssistant,
}) {
  const tooltipText = "Please create/select a chapter first";

  const handleClick = (mode, handler) => {
    onModeChange(mode);
    handler?.();
  };

  return (
    <div className="mode-group">
      <Tooltip title={disabled ? tooltipText : ""}>
        <button
          className={`mode-btn btn-write ${activeMode === "write" ? "active" : ""}`}
          disabled={disabled}
          onClick={() => handleClick("write", onWriteManually)}
        >
          <Edit size={14} />
          <span>Write</span>
        </button>
      </Tooltip>

      <div className="mode-inner-sep" />

      <Tooltip title={disabled ? tooltipText : ""}>
        <button
          className={`mode-btn btn-upload ${activeMode === "upload" ? "active" : ""}`}
          disabled={disabled}
          onClick={() => handleClick("upload", onOpenUploadModal)}
        >
          <Upload size={14} />
          <span>Upload</span>
        </button>
      </Tooltip>

      <div className="mode-inner-sep" />

      <Tooltip title={disabled ? tooltipText : ""}>
        <button
          className={`mode-btn btn-ai ${activeMode === "ai" ? "active" : ""}`}
          disabled={disabled}
          onClick={() => handleClick("ai", onOpenAIAssistant)}
        >
          <Sparkles size={14} />
          <span>TAV Assistant</span>
        </button>
      </Tooltip>
    </div>
  );
}