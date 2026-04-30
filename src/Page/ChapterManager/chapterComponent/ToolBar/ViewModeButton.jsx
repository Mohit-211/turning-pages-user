import React from "react";
import { Eye, Edit } from "lucide-react";
import { Tooltip } from "antd";

export default function ViewModeButton({ viewMode, setViewMode, disabled }) {
  const tooltipText = "Please create/select a chapter first";
  const isEditMode = viewMode === "edit";

  return (
    <Tooltip title={disabled ? tooltipText : ""}>
      <span>
        {isEditMode ? (
          <button
            className="toolbar-btn btn-view"
            disabled={disabled}
            onClick={() => setViewMode("preview")}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
        ) : (
          <button
            className="toolbar-btn btn-view"
            disabled={disabled}
            onClick={() => setViewMode("edit")}
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        )}
      </span>
    </Tooltip>
  );
}