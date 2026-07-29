import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreditPage.scss";
import { GetCreditApi } from "../../api/operations/credit.api"; // adjust path

const creditActivities = [
  { activity: "Create a chapter outline", credits: 0.5, category: "Planning" },
  { activity: "Create a chapter draft", credits: 2, category: "Writing" },
  { activity: "Expand or rework a chapter section", credits: 0.75, category: "Writing" },
  { activity: "Edit or improve a chapter", credits: 1, category: "Editing" },
  { activity: "Style or voice alignment for a chapter", credits: 1, category: "Editing" },
  { activity: "Chapter summary", credits: 0.25, category: "Planning" },
  { activity: "Book summary", credits: 0.5, category: "Planning" },
  { activity: "Fact check a chapter", credits: 2, category: "Validation" },
  { activity: "Plagiarism check a chapter", credits: 2, category: "Validation" },
  { activity: "Rewrite a paragraph or short passage", credits: 0.25, category: "Writing" },
  { activity: "Title or subtitle ideas", credits: 0.25, category: "Planning" },
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

// ✅ UPDATED: full sample workflow for ONE complete book (6 chapters),
// now touching every credit-consuming activity so users can see the
// full range of usage, not just the writing steps.
const sampleWorkflow = [
  { task: "Outline 6 chapters", detail: "6 × Create a chapter outline (0.5 cr)", credits: 3 },
  { task: "Draft 6 chapters", detail: "6 × Create a chapter draft (2 cr)", credits: 12 },
  { task: "Expand or rework 2 chapter sections", detail: "2 × Expand/rework a section (0.75 cr)", credits: 1.5 },
  { task: "Edit 6 chapters", detail: "6 × Edit or improve a chapter (1 cr)", credits: 6 },
  { task: "Style/voice alignment for 6 chapters", detail: "6 × Style or voice alignment (1 cr)", credits: 6 },
  { task: "Chapter summaries (6)", detail: "6 × Chapter summary (0.25 cr)", credits: 1.5 },
  { task: "Book summary", detail: "1 × Book summary (0.5 cr)", credits: 0.5 },
  { task: "Fact check 3 chapters", detail: "3 × Fact check a chapter (2 cr)", credits: 6 },
  { task: "Plagiarism check 3 chapters", detail: "3 × Plagiarism check a chapter (2 cr)", credits: 6 },
  { task: "Rewrite 4 paragraphs/passages", detail: "4 × Rewrite a paragraph (0.25 cr)", credits: 1 },
  { task: "Title & subtitle ideas", detail: "1 × Title or subtitle ideas (0.25 cr)", credits: 0.25 },
];

// const tabs = ["Overview", "Credit Usage", "Sample Usage",  "Free Access","Additional Services"];
const tabs = [
  "Overview",
  "Credit Usage",
  "Sample Usage",
  "Free Access",
  "Additional Services",
  "Plans & Pricing", // ✅ NEW
];

const PLANS = [
  { id: "starter", value: "starter", name: "Starter", price: 29, credits: 50 },
  { id: "author", value: "author", name: "Author", price: 59, credits: 120 },
  { id: "pro", value: "pro_author", name: "Pro Author", price: 99, credits: 250, popular: true },
  { id: "studio", value: "studio", name: "Studio", price: 179, credits: 500 },
];

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
      console.log(res, "res");
      const data = res?.data?.data;
      console.log(data, "data");
      setStats({
        total: data.total_credits,
        used: data.credits_used,
        avg: data.avg_credits_per_book,
        activities: data.activities,
      });
    } catch (err) {
      console.log("Credit API Error:", err);
    }
  };

  const totalSelected = selected.reduce((s, i) => s + creditActivities[i].credits, 0);

  // Per-book total from the full sample workflow (uses every activity type)
  const workflowTotal = sampleWorkflow.reduce((s, r) => s + r.credits, 0);

  // ✅ NEW: 5-book scenario — minimum credits to use every feature across 5 books
  const BOOK_COUNT = 5;
  const fiveBookTotal = workflowTotal * BOOK_COUNT;
  const recommendedPlan =
    PLANS.find((p) => p.credits >= fiveBookTotal) || PLANS[PLANS.length - 1];

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
              { label: "AVERAGE PER BOOK (approx)", value: `${stats.avg}`, color: "#1E3A5F" },
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
                    <strong style={{ color: "#C0392B" }}>40 to 50 Book Credits</strong> to
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
                        desc: `A full 6-chapter book using every feature (outline, draft, edit, style, summaries, fact check, plagiarism check, rewrites, titles) uses about $45 credits from outline to summary.`,
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

                  {/* ✅ NEW: 5-book scenario */}
                  {/* <div className="cs-overview-card cs-overview-card--highlight" style={{marginTop:"14px"}}>
                    <span className="cs-overview-card__icon">📚</span>
                    <div>
                      <div className="cs-overview-card__title">
                        Writing 5 books and using every feature?
                      </div>
                      <div className="cs-overview-card__desc">
                        If you plan to outline, draft, edit, style, summarize, fact check,
                        plagiarism check, rewrite passages, and generate titles for{" "}
                        <strong>{BOOK_COUNT} books</strong> (6 chapters each), you'll need a
                        minimum of{" "}
                        <strong style={{ color: "#C0392B" }}>
                          {fiveBookTotal} credits
                        </strong>{" "}
                        ({workflowTotal} credits × {BOOK_COUNT} books) to cover every
                        activity across all of them.
                        <br />
                        <br />
                        The <strong>{recommendedPlan.name}</strong> plan (
                        {recommendedPlan.credits} credits/mo for ${recommendedPlan.price}
                        /mo) is the minimum plan that covers this in a single month — or
                        spread the work across a couple of months on a smaller plan.
                      </div>
                    </div>
                  </div> */}
                </div>
              )}

              {/* Credit Usage */}
              {activeTab === "Credit Usage" && (
                <div className="cs-credits">
                  <div className="cs-credits__header">
                    <p className="cs-credits__hint">
                      Credits are used whenever you access certain features or perform
                      specific actions. Different tasks may use different amounts. Your
                      balance updates instantly, so you always know where you stand.
                    </p>
                    {selected.length > 0 && (
                      <div className="cs-credits__summary">
                        <span className="cs-credits__summary-count">
                          {selected.length} selected
                        </span>
                        <span className="cs-credits__summary-total">
                          {totalSelected} Credits
                        </span>
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
                              className={`cs-activity__check${
                                sel ? " cs-activity__check--checked" : ""
                              }`}
                            >
                              {sel && <span className="cs-activity__checkmark">✓</span>}
                            </div>
                            <span
                              className={`cs-activity__label${
                                sel ? " cs-activity__label--selected" : ""
                              }`}
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
                              className={`cs-activity__credits${
                                sel ? " cs-activity__credits--selected" : ""
                              }`}
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

              {/* Free Access */}
              {activeTab === "Free Access" && (
                <div className="cs-included">
                  <p className="cs-included__intro">
                    These features are available to you at no cost, no credits required. You
                    can explore, try things out, and get value right away without worrying
                    about usage. It’s our way of letting you experience the platform freely.
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

              {/* Sample Usage */}
              {activeTab === "Sample Usage" && (
                <div className="cs-workflow">
                  <p className="cs-workflow__intro">
                    Want a clearer picture? Here's a full sample walkthrough for{" "}
                    <strong>one 6-chapter book</strong>, using every credit-consuming
                    feature — outlining, drafting, expanding, editing, style alignment,
                    summaries, fact checking, plagiarism checking, rewrites, and title
                    ideas — so you can see exactly what a complete workflow costs.
                  </p>
                  <div className="cs-workflow__table">
                    <div className="cs-workflow__thead">
                      <span className="cs-workflow__col-label">Task</span>
                      <span className="cs-workflow__col-label">Credits</span>
                    </div>
                    {sampleWorkflow.map((row, i) => (
                      <div
                        key={i}
                        className={`cs-workflow__row cs-workflow__row--${
                          i % 2 === 0 ? "even" : "odd"
                        }`}
                      >
                        <div className="cs-workflow__row-left">
                          <span className="cs-workflow__step-num">{i + 1}</span>
                          <div>
                            <span className="cs-workflow__task-name">{row.task}</span>
                            {row.detail && (
                              <div className="cs-workflow__task-detail">{row.detail}</div>
                            )}
                          </div>
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
                      <span className="cs-workflow__total-label">Total (1 book)</span>
                      <span className="cs-workflow__total-val">{workflowTotal}</span>
                    </div>
                  </div>

                  {/* ✅ NEW: 5-book projection table */}
                  {/* <div className="cs-workflow__table" style={{ marginTop: "1.5rem" }}>
                    <div className="cs-workflow__thead">
                      <span className="cs-workflow__col-label">
                        Scaling up: {BOOK_COUNT} books, full feature usage
                      </span>
                      <span className="cs-workflow__col-label">Credits</span>
                    </div>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`cs-workflow__row cs-workflow__row--${
                          n % 2 === 0 ? "even" : "odd"
                        }`}
                      >
                        <div className="cs-workflow__row-left">
                          <span className="cs-workflow__step-num">{n}</span>
                          <span className="cs-workflow__task-name">
                            Book {n} (outline → draft → edit → style → summary →
                            fact check → plagiarism check → rewrites → titles)
                          </span>
                        </div>
                        <div className="cs-workflow__row-right">
                          <span className="cs-workflow__credit-val">{workflowTotal}</span>
                        </div>
                      </div>
                    ))}
                    <div className="cs-workflow__total-row">
                      <span className="cs-workflow__total-label">
                        Total for {BOOK_COUNT} books
                      </span>
                      <span className="cs-workflow__total-val">{fiveBookTotal}</span>
                    </div>
                  </div> */}
                </div>
              )}

              {/* Additional SERVICES */}
              {activeTab === "Additional Services" && (
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

              {activeTab === "Plans & Pricing" && (
                <div className="cs-plans">
                  <p className="cs-services__intro">
                    Choose a subscription plan that fits your writing needs. Each plan
                    provides monthly credits.
                  </p>

                  <div className="cs-plans__grid">
                    {PLANS.map((plan) => (
                      <div key={plan.id} className="cs-plan-card">
                        <div className="cs-credits__summary-count">{plan.name}</div>

                        <div className="cs-plan-card__price">
                          ${plan.price} <span>/mo</span>
                        </div>

                        <div className="cs-plan-card__credits">{plan.credits} credits</div>
                      </div>
                    ))}
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