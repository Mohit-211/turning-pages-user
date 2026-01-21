import React from "react";
import { Save, Eye, Edit, Sparkles, Upload } from "lucide-react";
import "./Toolbar.scss";

export default function Toolbar({
  chapterTitle,
  onSave,
  saving = false,
  viewMode = "edit", // "edit" | "preview" — controlled by parent
  setViewMode, // required to toggle mode
  onOpenAIAssistant,
  onOpenUploadModal,
}) {
  const isEditMode = viewMode === "edit";

  const handlePreview = () => setViewMode("preview");
  const handleEdit = () => setViewMode("edit");

  return (
    <div className="chapter-toolbar">
      {/* Left: Chapter Title */}
      <div className="chapter-title">
        <h2>{chapterTitle?.title || "Untitled Chapter"}</h2>
      </div>

      {/* Right: All Action Buttons in one line */}
      <div className="action-buttons">
        <button
          className="toolbar-btn upload-btn"
          onClick={onOpenUploadModal}
          aria-label="Upload chapter content"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>

        <button
          className="toolbar-btn ai-btn"
          onClick={onOpenAIAssistant}
          aria-label="Open AI Assistant"
        >
          <Sparkles size={18} />
          <span>AI Assistant</span>
        </button>

        {isEditMode ? (
          <button
            className="toolbar-btn preview-btn"
            onClick={handlePreview}
            disabled={saving}
            aria-label="Switch to preview mode"
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
        ) : (
          <button
            className="toolbar-btn edit-btn"
            onClick={handleEdit}
            disabled={saving}
            aria-label="Switch to edit mode"
          >
            <Edit size={18} />
            <span>Edit</span>
          </button>
        )}

        <button
          className="toolbar-btn save-btn"
          onClick={onSave}
          disabled={saving}
          aria-label="Save chapter"
        >
          <Save size={18} />
          <span>{saving ? "Saving..." : "Save"}</span>
        </button>
      </div>
    </div>
  );
}
