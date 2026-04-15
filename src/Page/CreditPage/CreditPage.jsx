import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreditPage.scss";
import { GetCreditApi } from "../../api/operations/credit.api"; // adjust path

const creditActivities = [
  { activity: "Create a chapter outline", credits: 1, category: "Planning" },
  { activity: "Create a chapter draft", credits: 2, category: "Writing" },
  { activity: "Expand or rework a chapter section", credits: 1, category: "Writing" },
  { activity: "Edit or improve a chapter", credits: 1, category: "Editing" },
  { activity: "Style or voice alignment for a chapter", credits: 1, category: "Editing" },
  { activity: "Chapter summary", credits: 1, category: "Planning" },
  { activity: "Book summary", credits: 2, category: "Planning" },
  { activity: "Fact check a chapter", credits: 2, category: "Validation" },
  { activity: "Plagiarism check a chapter", credits: 2, category: "Validation" },
  { activity: "Rewrite a paragraph or short passage", credits: 1, category: "Writing" },
  { activity: "Title or subtitle ideas", credits: 1, category: "Planning" },
];

const includedFeatures = [
  { label: "Quote database access", icon: "📚" },
  { label: "Quote browsing and search", icon: "🔍" },
  { label: "Saved quotes and collections", icon: "🔖" },
  { label: "Dashboard access", icon: "🏠" },
  { label: "Manuscript storage", icon: "💾" },
  { label: "General platform access", icon: "✅" },
];

const separateServices = [
  { label: "Professional publishing packages", icon: "📦" },
  { label: "One-time publishing support services", icon: "🎯" },
  { label: "9-point TAV Analysis™ as a standalone service", icon: "📊" },
];

const sampleWorkflow = [
  { task: "Outline 6 chapters", credits: 6 },
  { task: "Draft 6 chapters", credits: 12 },
  { task: "Edit 6 chapters", credits: 6 },
  { task: "Book summary", credits: 2 },
  { task: "Fact check 2 chapters", credits: 4 },
];

const tabs = ["Overview", "Use Credits", "Included", "Workflow", "Separate Services"];

export default function CreditSystem() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [selected, setSelected] = useState([]);

  // ✅ NEW: API state
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    avg: 0,
    activities: creditActivities.length,
  });

  // ✅ NEW: API call
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await GetCreditApi();
      console.log(res,"res")
      const data = res?.data?.data;
console.log(data,"data")
      setStats({
        total: data.total_credits,
        used: data.credits_used ,
        avg: data.avg_credits_per_book,
        activities: data.activities
,
      });
    } catch (err) {
      console.log("Credit API Error:", err);
    }
  };

  const totalSelected = selected.reduce((s, i) => s + creditActivities[i].credits, 0);
  const workflowTotal = sampleWorkflow.reduce((s, r) => s + r.credits, 0);

  const toggle = (idx) =>
    setSelected((p) => (p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]));

  return (
    <div className="credit-system">
      <div className="cs-main">
        <main className="cs-content">

          {/* Welcome */}
          <div className="cs-welcome">
            <div>
              <h1 className="cs-welcome__title">Book Credits Guide</h1>
              <p className="cs-welcome__subtitle">
                Understand how Book Credits work and plan your writing journey
              </p>
            </div>
            <button
              className="cs-welcome__btn"
              onClick={() => navigate("/dashboard/payment")}
            >
              + Buy More Credits
            </button>
          </div>

          {/* ✅ FIXED STATS ONLY */}
          <div className="cs-stats">
            {[
              { label: "YOUR CREDITS", value: stats.total, color: "#1E3A5F" },
              { label: "CREDITS USED", value: stats.used, color: "#C0392B" },
              { label: "AVG PER BOOK", value: `~${stats.avg}`, color: "#1E3A5F" },
              { label: "ACTIVITIES", value: stats.activities, color: "#1E3A5F" },
            ].map((s) => (
              <div key={s.label} className="cs-stat-card">
                <div className="cs-stat-card__label">{s.label}</div>
                <div className="cs-stat-card__value" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

            {/* Tabbed card */}
          <div className="cs-card">
            <div className="cs-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`cs-tab${activeTab === tab ? " cs-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="cs-panel">

              {/* OVERVIEW */}
              {activeTab === "Overview" && (
                <div className="cs-overview">
                  <p className="cs-overview__intro">
                    Turning Pages uses{" "}
                    <strong style={{ color: "#1E3A5F" }}>Book Credits</strong> to help you
                    make meaningful progress on your manuscript. A Book Credit is used when
                    the platform helps you move your book forward through writing, editing,
                    refining, or validating your content. Most authors use{" "}
                    <strong style={{ color: "#C0392B" }}>20 to 30 Book Credits</strong> to
                    write, revise, and prepare a full book for publishing.
                  </p>
                  <div className="cs-overview__grid">
                    {[
                      {
                        title: "Included in subscription",
                        desc: "Quote database, dashboard, manuscript storage & more — no credits needed.",
                        icon: "✅",
                      },
                      {
                        title: "Credit-based activities",
                        desc: "Writing, editing, fact-checking, and validation features consume credits.",
                        icon: "🔖",
                      },
                      {
                        title: "Typical usage",
                        desc: "A full 6-chapter book typically uses around 30 credits from outline to summary.",
                        icon: "📖",
                      },
                      {
                        title: "Separate services",
                        desc: "Publishing packages, TAV Analysis™ and professional services are priced separately.",
                        icon: "📦",
                      },
                    ].map((c) => (
                      <div key={c.title} className="cs-overview-card">
                        <span className="cs-overview-card__icon">{c.icon}</span>
                        <div>
                          <div className="cs-overview-card__title">{c.title}</div>
                          <div className="cs-overview-card__desc">{c.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USE CREDITS */}
              {activeTab === "Use Credits" && (
                <div className="cs-credits">
                  <div className="cs-credits__header">
                    <p className="cs-credits__hint">Click activities to build a credit estimate</p>
                    {selected.length > 0 && (
                      <div className="cs-credits__summary">
                        <span className="cs-credits__summary-count">{selected.length} selected</span>
                        <span className="cs-credits__summary-total">{totalSelected} Credits</span>
                        <button
                          className="cs-credits__summary-clear"
                          onClick={() => setSelected([])}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="cs-credits__list">
                    {creditActivities.map((item, idx) => {
                      const sel = selected.includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`cs-activity${sel ? " cs-activity--selected" : ""}`}
                          onClick={() => toggle(idx)}
                        >
                          <div className="cs-activity__left">
                            <div
                              className={`cs-activity__check${sel ? " cs-activity__check--checked" : ""}`}
                            >
                              {sel && <span className="cs-activity__checkmark">✓</span>}
                            </div>
                            <span
                              className={`cs-activity__label${sel ? " cs-activity__label--selected" : ""}`}
                            >
                              {item.activity}
                            </span>
                          </div>
                          <div className="cs-activity__right">
                            <span
                              className={`cs-activity__badge cs-badge--${item.category}`}
                            >
                              {item.category}
                            </span>
                            <span
                              className={`cs-activity__credits${sel ? " cs-activity__credits--selected" : ""}`}
                            >
                              {item.credits} cr
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INCLUDED */}
              {activeTab === "Included" && (
                <div className="cs-included">
                  <p className="cs-included__intro">
                    The following features are included as part of your subscription and do
                    not use Book Credits.
                  </p>
                  <div className="cs-included__grid">
                    {includedFeatures.map((f, i) => (
                      <div key={i} className="cs-feature-card">
                        <span className="cs-feature-card__icon">{f.icon}</span>
                        <span className="cs-feature-card__label">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WORKFLOW */}
              {activeTab === "Workflow" && (
                <div className="cs-workflow">
                  <p className="cs-workflow__intro">
                    A sample credit usage for a full 6-chapter book.
                  </p>
                  <div className="cs-workflow__table">
                    <div className="cs-workflow__thead">
                      <span className="cs-workflow__col-label">Task</span>
                      <span className="cs-workflow__col-label">Credits</span>
                    </div>
                    {sampleWorkflow.map((row, i) => (
                      <div
                        key={i}
                        className={`cs-workflow__row cs-workflow__row--${i % 2 === 0 ? "even" : "odd"}`}
                      >
                        <div className="cs-workflow__row-left">
                          <span className="cs-workflow__step-num">{i + 1}</span>
                          <span className="cs-workflow__task-name">{row.task}</span>
                        </div>
                        <div className="cs-workflow__row-right">
                          <div className="cs-workflow__bar-track">
                            <div
                              className="cs-workflow__bar-fill"
                              style={{
                                width: `${Math.min(
                                  (row.credits / workflowTotal) * 100 * 3,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="cs-workflow__credit-val">{row.credits}</span>
                        </div>
                      </div>
                    ))}
                    <div className="cs-workflow__total-row">
                      <span className="cs-workflow__total-label">Total</span>
                      <span className="cs-workflow__total-val">{workflowTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SEPARATE SERVICES */}
              {activeTab === "Separate Services" && (
                <div className="cs-services">
                  <p className="cs-services__intro">
                    Some services are separate from Book Credits because they are
                    professional publishing or premium editorial services.
                  </p>
                  <div className="cs-services__list">
                    {separateServices.map((s, i) => (
                      <div key={i} className="cs-service-item">
                        <span className="cs-service-item__icon">{s.icon}</span>
                        <span className="cs-service-item__label">{s.label}</span>
                        <span className="cs-service-item__tag">Priced Separately</span>
                      </div>
                    ))}
                  </div>
                  <div className="cs-services-note">
                    <p>
                      <strong>Note:</strong> Turning Pages subscriptions are designed to
                      help authors write and prepare their manuscript. Professional
                      publishing services, formatting, cover design, upload assistance, and
                      related publishing services are optional one-time services and are not
                      included in the credit subscription system.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}