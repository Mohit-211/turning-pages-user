import React from "react";

export default function HtmlEditor({ html, setHtml }) {
  return (
    <textarea
      value={html}
      onChange={(e) => setHtml(e.target.value)}
      placeholder="Write HTML here..."
      style={{
        width: "100%",
        height: "200px",
        padding: "10px",
      }}
    />
  );
}
