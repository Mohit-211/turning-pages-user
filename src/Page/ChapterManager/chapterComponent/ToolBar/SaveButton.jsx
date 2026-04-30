import React from "react";
import { Save } from "lucide-react";
import { Tooltip } from "antd";

export default function SaveButton({ saving, disabled, onlyView, onSave }) {
  const tooltipText = disabled
    ? "Please create/select a chapter first"
    : onlyView
    ? "View mode enabled"
    : "";

  return (
    <Tooltip title={tooltipText}>
      <span>
        <button
          className="toolbar-btn btn-save"
          disabled={saving || onlyView || disabled}
          onClick={onSave}
        >
          <Save size={14} />
          <span>{saving ? "Saving..." : "Save"}</span>
        </button>
      </span>
    </Tooltip>
  );
}