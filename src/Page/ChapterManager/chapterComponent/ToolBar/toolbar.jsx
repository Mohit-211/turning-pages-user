import React, { useState, useEffect } from "react";
import { message } from "antd";


import "./Toolbar.scss";
import ToolbarTitle from "./ToolbarTitle";
import ToolbarSep from "./ToolbarSep";
import TAVGuideButton from "./TAVGuideButton";
import TAVToolGroup from "./TAVToolGroup";
import InputModeGroup from "./InputModeGroup";
import PanelToggleButton from "./PanelToggleButton";
import ViewModeButton from "./ViewModeButton";
import SaveButton from "./SaveButton";

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
  onWriteManually,
  onOpenAIAssistant,
  content = "",
  onOpenAIGuide,
  onlyView = false,
}) {
  const isEditMode = viewMode === "edit";
  const isChapterSelected = !!chapterTitle?.title;
  const [selectedTool, setSelectedTool] = useState(activeTool || "");
  const [activeMode, setActiveMode] = useState("write");

  useEffect(() => {
    setSelectedTool(activeTool || "");
  }, [activeTool]);

  const handleRunTool = () => {
    if (!selectedTool) {
      message.warning("Please select a TAV Tool before running analysis");
      return;
    }
    if (content && content.length < 200) {
      message.warning("Content should be at least 200 characters to run TAV Analysis");
      return;
    }
    onRunAITool(selectedTool);
  };

  const actionDisabled = !isChapterSelected || !isEditMode;

  return (
    <div className="chapter-toolbar">
      <ToolbarTitle chapterTitle={chapterTitle} />

      <ToolbarSep />

      <div className="action-buttons">
        <TAVGuideButton onOpenAIGuide={onOpenAIGuide} />

        <ToolbarSep />

        <TAVToolGroup
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          onRun={handleRunTool}
          disabled={actionDisabled}
        />

        <ToolbarSep />

        <InputModeGroup
          activeMode={activeMode}
          onModeChange={setActiveMode}
          disabled={actionDisabled}
          onWriteManually={onWriteManually}
          onOpenUploadModal={onOpenUploadModal}
          onOpenAIAssistant={onOpenAIAssistant}
        />

        <ToolbarSep />

        <PanelToggleButton
          isAIPanelOpen={isAIPanelOpen}
          onToggle={onToggleAIPanel}
        />

        <ViewModeButton
          viewMode={viewMode}
          setViewMode={setViewMode}
          disabled={!isChapterSelected}
        />

        <SaveButton
          saving={saving}
          disabled={!isChapterSelected}
          onlyView={onlyView}
          onSave={onSave}
        />
      </div>
    </div>
  );
}