import React, { useState } from "react";
import axios from "axios";
import "./Bhavya.scss";

interface GrammarError {
  message: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
}

const Bhavya = () => {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [loading, setLoading] = useState(false);

  const checkGrammar = async () => {
    if (!text.trim()) return;

    setLoading(true);
    const res = await axios.post(
      "https://api.languagetool.org/v2/check",
      new URLSearchParams({
        text,
        language: "en-US",
      })
    );

    setErrors(res.data.matches);
    setLoading(false);
  };

  const applyFix = (error: GrammarError) => {
    if (!error.replacements.length) return;

    const fix = error.replacements[0].value;

    const updatedText =
      text.slice(0, error.offset) +
      fix +
      text.slice(error.offset + error.length);

    setText(updatedText);
    setErrors((prev) => prev.filter((e) => e !== error));
  };

  return (
    <div className="grammar-container">
      <div className="editor">
        <h3>Grammar Editor</h3>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type incorrect English here..."
        />

        <button onClick={checkGrammar} disabled={loading}>
          {loading ? "Checking..." : "Check Grammar"}
        </button>
      </div>

      <div className="suggestions">
        <h3>Suggestions</h3>

        {errors.length === 0 && (
          <p className="empty">No issues found</p>
        )}

        {errors.map((err, i) => (
          <div className="card" key={i}>
            <p className="message">{err.message}</p>

            {err.replacements[0] && (
              <div className="fix-row">
                <span>
                  Suggestion:{" "}
                  <b>{err.replacements[0].value}</b>
                </span>

                <button
                  className="fix-btn"
                  onClick={() => applyFix(err)}
                >
                  Fix
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bhavya;
