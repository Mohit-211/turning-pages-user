import React from "react";
import "./AIToolsGuide.scss";

const tools = [
  { name: "Plagiarism Check", desc: "Detects duplicate or copied content", symbol: "⊘", color: "red" },
  { name: "Consistency Check", desc: "Checks writing style and tone consistency", symbol: "≈", color: "blue" },
  { name: "Generate Summary", desc: "Creates a short summary of your content", symbol: "∑", color: "green" },
  { name: "Fact Checking", desc: "Verifies factual correctness", symbol: "✓", color: "violet" },
];

const tips = [
  "Always select a TAV tool from the dropdown before clicking Run.",
  "Ensure your content is at least 200 characters for analysis to proceed.",
  "Use clear and meaningful content for best results.",
  "Longer content generally provides richer analysis.",
  "Always review AI output before applying any changes.",
  "Save your work before switching between Edit and Preview modes.",
];

const steps = [
  {
    id: "01",
    title: "Select AI Tools",
    desc: (
      <>
        Open the toolbar and click on the dropdown labeled{" "}
        <mark>Select AI Tool</mark>. Choose the required <mark>TAV Tool</mark>.
      </>
    ),
  },
  {
    id: "02",
    title: "Select TAV Tools",
    desc: "Choose one of the four analysis modes:",
    extra: "tools",
  },
  {
    id: "03",
    title: "Run TAV Analysis",
    desc: (
      <>
        Click <mark>Run TAV Analysis</mark>. The system will validate your
        input and process your content, then show results instantly.
      </>
    ),
    extra: "flow",
  },
];

const validations = [
  {
    type: "error",
    icon: "⊘",
    title: "No tool selected",
    badge: "Blocked",
    desc: (
      <>
        If you click <mark>Run</mark> without selecting a tool from the
        dropdown, the analysis will not start.
      </>
    ),
    alert: "Please select a TAV Tool before running analysis.",
  },
  {
    type: "warning",
    icon: "≈",
    title: "Content too short",
    badge: "Warning",
    desc: (
      <>
        Your chapter content must be at least <mark>200 characters</mark>{" "}
        long. If content is shorter, analysis is blocked.
      </>
    ),
    alert: "Content should be at least 200 characters to run TAV Analysis.",
  },
  {
    type: "info",
    icon: "✎",
    title: "Edit vs preview mode",
    badge: "Informational",
    desc: (
      <>
        The toolbar toggles between <mark>Edit</mark> and{" "}
        <mark>Preview</mark> based on your current mode. Switch to edit mode
        before making changes or running analysis.
      </>
    ),
  },
  {
    type: "info",
    icon: "↑",
    title: "Save in progress",
    badge: "Informational",
    desc: (
      <>
        The <mark>Save</mark> button is automatically disabled while saving to
        prevent duplicate requests. It shows <mark>Saving…</mark> until
        complete.
      </>
    ),
  },
];

const quickRef = [
  {
    icon: "▶",
    title: "Run (play icon)",
    desc: "Triggers TAV analysis for the selected tool. Runs both validations — tool selected and 200 character minimum — before proceeding.",
  },
  {
    icon: "AI",
    title: "Open AI / Close AI",
    desc: (
      <>
        Toggles the AI side panel. When open, the button shows an{" "}
        <mark>X</mark> icon. Click again to close.
      </>
    ),
  },
  {
    icon: "↑",
    title: "Upload",
    desc: "Opens the upload modal to import external content into the chapter editor.",
  },
  {
    icon: "?",
    title: "AI Guide",
    desc: "Opens this guide. Use it anytime you need a refresher on how to use TAV tools.",
  },
];

const flowSteps = ["Select tool", "Add content", "Click Run", "View results"];

export default function AIToolsGuide() {
  return (
    <div className="guide">

      {/* HEADER
      <header className="guide__header">
        <span className="guide__eyebrow">TAV Platform · Documentation</span>
        <h1 className="guide__title">AI Tools <em>Guide</em></h1>
        <p className="guide__subtitle">
          How to run TAV analysis — including all validations and error states.
        </p>
      </header> */}

      {/* STEPS */}
      <div className="guide__steps">
        {steps.map((step, index) => (
          <article
            key={step.id}
            className={`step ${index === steps.length - 1 ? "step--last" : ""}`}
          >
            <div className="step__aside">
              <span className="step__num">{step.id}</span>
              {index !== steps.length - 1 && <div className="step__line" />}
            </div>

            <div className="step__body">
              <h2 className="step__title">{step.title}</h2>
              <p className="step__desc">{step.desc}</p>

              {/* TOOL GRID — STEP 2 */}
              {step.extra === "tools" && (
                <div className="tool-grid">
                  {tools.map((tool) => (
                    <div
                      key={tool.name}
                      className={`tool-card tool-card--${tool.color}`}
                    >
                      <span className="tool-card__symbol">{tool.symbol}</span>
                      <div>
                        <p className="tool-card__name">{tool.name}</p>
                        <p className="tool-card__desc">{tool.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FLOW ROW — STEP 3 */}
              {step.extra === "flow" && (
                <div className="flow-row">
                  {flowSteps.map((label, i) => (
                    <React.Fragment key={label}>
                      <span className="flow-box">{label}</span>
                      {i < flowSteps.length - 1 && (
                        <span className="flow-arrow">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* DIVIDER */}
      <div className="guide__divider" />

      {/* VALIDATIONS */}
      <section className="guide__section">
        <span className="guide__section-label">Validations &amp; error states</span>
        <div className="val-grid">
          {validations.map((v) => (
            <div key={v.title} className={`val-card val-card--${v.type}`}>
              <div className="val-card__header">
                <div className="val-card__icon">{v.icon}</div>
                <span className="val-card__title">{v.title}</span>
                <span className="val-card__badge">{v.badge}</span>
              </div>
              <div className="val-card__body">
                <p className="val-card__msg">{v.desc}</p>
                {v.alert && (
                  <div className="val-card__alert">"{v.alert}"</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="guide__divider" />

      {/* QUICK REFERENCE */}
      <section className="guide__section">
        <span className="guide__section-label">
          Quick reference — what each button does
        </span>
        <div className="val-grid">
          {quickRef.map((item) => (
            <div key={item.title} className="val-card val-card--info">
              <div className="val-card__header">
                <div className="val-card__icon">{item.icon}</div>
                <span className="val-card__title">{item.title}</span>
              </div>
              <div className="val-card__body">
                <p className="val-card__msg">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="guide__divider" />

      {/* TIPS */}
      <aside className="tips">
        <span className="tips__label">Best Practices</span>
        <ul className="tips__list">
          {tips.map((tip, i) => (
            <li key={i} className="tips__item">
              <span className="tips__dot" />
              {tip}
            </li>
          ))}
        </ul>
      </aside>

    </div>
  );
}