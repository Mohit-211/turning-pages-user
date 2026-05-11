import React from "react";
import { Tooltip } from "antd";

const IconQuote = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

export default function QuotesButton({ isQuotesPanelOpen, onToggle }) {
  return (
    <Tooltip title="Quotes Library">
      <button
        className={`toolbar-icon-btn quotes-panel-btn ${isQuotesPanelOpen ? "toolbar-icon-btn--active" : ""}`}
        onClick={onToggle}
      >
        <IconQuote />
        <span className="toolbar-icon-btn__label">Quotes</span>
      </button>
    </Tooltip>
  );
}