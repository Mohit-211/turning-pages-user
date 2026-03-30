import React from "react";
import "./AIToolsGuide.scss";

export default function AIToolsGuide() {
  return (
    <div className="ai-guide">
      <h1>AI Tools Instruction Guide</h1>

      {/* Step 1 */}
      <section>
        <h2>Step 1: Select AI Tools</h2>
        <p>
          Open the toolbar and click on the dropdown labeled{" "}
          <strong>Select AI Tool</strong>.
        </p>
        <p>
          From the list, choose the required <strong>TAV Tool</strong> for your
          analysis.
        </p>
      </section>

      {/* Step 2 */}
      <section>
        <h2>Step 2: Select TAV Tools</h2>
        <ul>
          <li>
            <strong>Plagiarism Check</strong> – Detects duplicate or copied
            content.
          </li>
          <li>
            <strong>Consistency Check</strong> – Checks writing style and tone
            consistency.
          </li>
          <li>
            <strong>Generate Summary</strong> – Creates a short summary of your
            content.
          </li>
          <li>
            <strong>Fact Checking</strong> – Verifies factual correctness.
          </li>
        </ul>
      </section>

      {/* Step 3 */}
      <section>
        <h2>Step 3: Running TAV Analysis</h2>
        <p>
          After selecting a tool, click on the{" "}
          <strong>Run TAV Analysis</strong> button.
        </p>
        <p>
          The system will process your content and display AI-generated results.
        </p>
      </section>

      {/* Tips */}
      <section>
        <h2>Best Practices</h2>
        <ul>
          <li>Use clear and meaningful content.</li>
          <li>Longer content generally provides better results.</li>
          <li>Review AI output before applying changes.</li>
        </ul>
      </section>
    </div>
  );
}