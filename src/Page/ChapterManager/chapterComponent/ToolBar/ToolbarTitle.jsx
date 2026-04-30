import React from "react";

export default function ToolbarTitle({ chapterTitle }) {
  const isChapterSelected = !!chapterTitle?.title;

  return (
    <div className="chapter-title">
      <span className={`title-dot ${isChapterSelected ? "active" : ""}`} />
      <h2>{chapterTitle?.title || "Untitled Chapter"}</h2>
    </div>
  );
}