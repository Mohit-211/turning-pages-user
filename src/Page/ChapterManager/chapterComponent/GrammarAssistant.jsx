import React, { useState } from "react";
import "./GrammarAssistant.scss";

export default function GrammarAssistant({ text, setText, token }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------------ Grammar Check API ------------------
  const checkGrammar = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch(
        "https://api.turningpages.io:9090/api/v1/grammar/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();
      setErrors(data?.errors || []);
    } catch (err) {
      console.error("Grammar Error:", err);
    }

    setLoading(false);
  };

  // ------------------ Highlight Grammar Errors ------------------
  const highlightText = () => {
    let highlighted = text;

    errors.forEach((err) => {
      const wrong = err.wrong;
      const reg = new RegExp(wrong, "gi");

      highlighted = highlighted.replace(
        reg,
        `<span class="grammar-error" data-error="${wrong}">${wrong}</span>`
      );
    });

    return { __html: highlighted };
  };

  // ------------------ Click on highlighted word ------------------
  const handleHighlightClick = (e) => {
    if (e.target.classList.contains("grammar-error")) {
      const selectedWord = e.target.getAttribute("data-error");
    }
  };

  // ------------------ NEW FEATURE: Capture selected text ------------------
  const handleTextSelection = () => {
    const selected = window.getSelection().toString().trim();
    if (selected) {
    }
  };

  return (
    <div className="grammar-container">
      {/* Grammar Check Button */}
      <button className="grammar-btn" onClick={checkGrammar} disabled={loading}>
        {loading ? "Checking..." : "Grammar Check"}
      </button>

      <div className="grammar-body">
        {/* LEFT SIDE - Highlighted Preview */}
        <div
          className="grammar-preview"
          onClick={handleHighlightClick}
          onMouseUp={handleTextSelection} // <-- NEW LINE
          dangerouslySetInnerHTML={highlightText()}
        />

        {/* RIGHT SIDE - Suggestions */}
        <div className="grammar-sidebar">
          <h3>Suggestions</h3>

          {errors.length === 0 ? (
            <p>No issues found 🎉</p>
          ) : (
            errors.map((err, i) => (
              <div key={i} className="grammar-item">
                <p>
                  <strong>Issue:</strong> {err.message}
                </p>
                <p>
                  <strong>Suggestion:</strong> {err.suggestion}
                </p>

                <button
                  className="apply-btn"
                  onClick={() =>
                    setText((prev) => prev.replace(err.wrong, err.suggestion))
                  }
                >
                  Apply Fix
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
