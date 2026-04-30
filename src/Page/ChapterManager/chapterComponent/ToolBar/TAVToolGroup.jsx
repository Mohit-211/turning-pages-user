import React from "react";
import { PlayCircle } from "lucide-react";
import { Tooltip } from "antd";

export default function TAVToolGroup({
  selectedTool,
  onToolChange,
  onRun,
  disabled,
}) {
  const tooltipText = "Please create/select a chapter first";

  return (
    <div className="tav-group">
      <Tooltip title={disabled ? tooltipText : ""}>
        <select
          className="tav-select"
          value={selectedTool}
          disabled={disabled}
          onChange={(e) => onToolChange(e.target.value)}
        >
          <option value="">Select TAV Tool</option>
          <option value="plagiarism">Plagiarism Check</option>
          <option value="consistency">Consistency Check</option>
          <option value="summary">Generate Summary</option>
          <option value="fact">Fact Checking</option>
        </select>
      </Tooltip>
      <div className="tav-inner-sep" />
      <Tooltip title={disabled ? tooltipText : ""}>
        <button className="tav-run-btn" disabled={disabled} onClick={onRun}>
          <PlayCircle size={14} />
        </button>
      </Tooltip>
    </div>
  );
}