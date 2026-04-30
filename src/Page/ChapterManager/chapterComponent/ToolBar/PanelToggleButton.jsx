import React from "react";
import { PanelRight, X } from "lucide-react";

export default function PanelToggleButton({ isAIPanelOpen, onToggle }) {
  return (
    <button
      className={`toolbar-btn btn-panel ${isAIPanelOpen ? "active" : ""}`}
      onClick={onToggle}
    >
      {isAIPanelOpen ? <X size={14} /> : <PanelRight size={14} />}
      <span>{isAIPanelOpen ? "Close Panel" : "Open Panel"}</span>
    </button>
  );
}