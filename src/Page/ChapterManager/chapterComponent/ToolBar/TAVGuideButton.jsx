import React from "react";
import { BookOpen } from "lucide-react";

export default function TAVGuideButton({ onOpenAIGuide }) {
  return (
    <button className="toolbar-btn btn-guide" onClick={onOpenAIGuide}>
      <BookOpen size={14} />
      <span>TAV Guide</span>
    </button>
  );
}