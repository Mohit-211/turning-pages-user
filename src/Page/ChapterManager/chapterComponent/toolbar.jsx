import React, { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Edit,
  Upload,
  PanelRight,
  X,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import { message, Tooltip } from "antd";
import "./Toolbar.scss";

export default function Toolbar({
  chapterTitle,
  saving = false,
  viewMode,
  setViewMode,
  onToggleAIPanel,
  isAIPanelOpen,
  onRunAITool,
  activeTool,
  onSave,
  onOpenUploadModal,
  content = "",
  onOpenAIGuide,
  onlyView = false,
}) {
  const isEditMode = viewMode === "edit";
  const [selectedTool, setSelectedTool] = useState(activeTool || "");

  const isChapterSelected = !!chapterTitle?.title;

  useEffect(() => {
    setSelectedTool(activeTool || "");
  }, [activeTool]);

  const handleRunTool = () => {
    if (!selectedTool) {
      message.warning("Please select a TAV Tool before running analysis");
      return;
    }

    if (content && content.length < 200) {
      message.warning(
        "Content should be at least 200 characters to run TAV Analysis"
      );
      return;
    }

    onRunAITool(selectedTool);
  };

  const tooltipText = "Please create/select a chapter first";
console.log(viewMode,"viewMode")
  return (
    <div className="chapter-toolbar">
      <div className="chapter-title">
        <h2>{chapterTitle?.title || "Untitled Chapter"}</h2>
      </div>

      <div className="action-buttons">
        {/* AI Guide */}
        <button className="toolbar-btn ai-guide-btn" onClick={onOpenAIGuide}>
          <BookOpen size={18} />
          <span>TAV Guide</span>
        </button>

        {/* TAV Tool */}
        <div className="ai-tool-select">
          <Tooltip title={!isChapterSelected ? tooltipText : ""}>
            <span>
              <select
                value={selectedTool}
                disabled={!isChapterSelected || !isEditMode}
                onChange={(e) => setSelectedTool(e.target.value)}
              >
                <option value="">Select TAV Tool</option>
                <option value="plagiarism">Plagiarism Check</option>
                <option value="consistency">Consistency Check</option>
                <option value="summary">Generate Summary</option>
                <option value="fact">Fact Checking</option>
              </select>
            </span>
          </Tooltip>

          <Tooltip title={!isChapterSelected ? tooltipText : ""}>
            <span>
              <button
                className="toolbar-btn run-ai-btn"
                disabled={!isChapterSelected||!isEditMode}
                onClick={handleRunTool}
              >
                <PlayCircle size={18} />
              </button>
            </span>
          </Tooltip>
        </div>

      
        <Tooltip title={!isChapterSelected ? tooltipText : ""}>
          <span>
            <button
              className="toolbar-btn upload-btn"
              disabled={!isChapterSelected||!isEditMode}
              onClick={onOpenUploadModal}
            >
              <Upload size={18} />
              <span>Upload</span>
            </button>
          </span>
        </Tooltip>

        {/* AI Panel */}
        <button
          className={`toolbar-btn ${isAIPanelOpen ? "active" : ""}`}
          onClick={onToggleAIPanel}
        >
          {isAIPanelOpen ? <X size={18} /> : <PanelRight size={18} />}
          <span>
            {isAIPanelOpen ? "Close TAV Panel" : "Open TAV Panel"}
          </span>
        </button>

        {/* Preview / Edit */}
        <Tooltip title={!isChapterSelected ? tooltipText : ""}>
          <span>
            {isEditMode ? (
              <button
                className="toolbar-btn"
                disabled={!isChapterSelected}
                onClick={() => setViewMode("preview")}
              >
                <Eye size={18} />
                <span>Preview</span>
              </button>
            ) : (
              <button
                className="toolbar-btn"
                disabled={!isChapterSelected}
                onClick={() => setViewMode("edit")}
              >
                <Edit size={18} />
                <span>Edit</span>
              </button>
            )}
          </span>
        </Tooltip>

        {/* Save */}
        <Tooltip
          title={
            !isChapterSelected
              ? tooltipText
              : onlyView
              ? "View mode enabled"
              : ""
          }
        >
          <span>
            <button
              className="toolbar-btn save-btn"
              disabled={saving || onlyView || !isChapterSelected}
              onClick={onSave}
            >
              <Save size={18} />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}