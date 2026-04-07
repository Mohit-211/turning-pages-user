import React from "react";
import { BookOpen, Upload, Sparkles, Download } from "lucide-react";
import "./WorkflowSection.scss";

const steps = [
  {
    icon: BookOpen,
    title: "Create Book",
    description:
      "Start writing your manuscript or upload existing content in any format.",
  },
  {
    icon: Upload,
    title: "Submit for Editing",
    description:
      "Upload your draft and choose from TAV editing or professional human editors.",
  },
  {
    icon: Sparkles,
    title: "Editors Enhance",
    description:
      "Our TAV and human editors work on structure, style, grammar, and flow.",
  },
  {
    icon: Download,
    title: "Download Final Manuscript",
    description:
      "Receive your polished, publication-ready manuscript in your preferred format.",
  },
];

const WorkflowSection = () => {
  return (
    <section id="workflow" className="workflow-section">
      <div className="workflow-container">
        <div className="workflow-header">
          <h2>How It Works</h2>
          <p>
            Our streamlined process takes you from rough draft to published
            book in four simple steps.
          </p>
        </div>

        <div className="workflow-grid">
          {/* Connecting line for desktop */}
          <div className="workflow-line" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="workflow-step">
                <div className="workflow-step-inner">
                  <div className="workflow-icon">
                    <Icon />
                  </div>
                  <div className="workflow-step-number">{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
