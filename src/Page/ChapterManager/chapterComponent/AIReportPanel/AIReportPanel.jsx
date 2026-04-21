import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { message } from "antd";
import "./AIReportPanel.scss";
/* ─────────────────────────────────────────────
   CONSISTENCY HELPERS
───────────────────────────────────────────── */
const CATEGORY_CONFIG = [
  { key: "character", label: "Character", icon: "👤" },
  { key: "timeline", label: "Timeline", icon: "🕐" },
  { key: "style", label: "Writing Style", icon: "✍️" },
  { key: "terminology", label: "Terminology", icon: "📝" },
  { key: "formatting", label: "Formatting", icon: "🔧" },
  { key: "facts", label: "Facts & Data", icon: "📊" },
  { key: "plot", label: "Plot / Logic", icon: "🎭" },
];
const getScoreMeta = (s) => {
  if (s >= 90) return { level: "Excellent Consistency", fix: "Minor continuity polish", badge: "success" };
  if (s >= 80) return { level: "Very Consistent", fix: "Fix minor timeline or detail gaps", badge: "success" };
  if (s >= 70) return { level: "Consistent", fix: "Improve character behavior & transitions", badge: "success" };
  if (s >= 60) return { level: "Mostly Consistent", fix: "Resolve timeline mismatches", badge: "warning" };
  if (s >= 50) return { level: "Moderate Consistency", fix: "Fix plot gaps & repeated events", badge: "warning" };
  if (s >= 40) return { level: "Low Consistency", fix: "Improve logic & continuity", badge: "warning" };
  if (s >= 30) return { level: "Weak Consistency", fix: "Restructure story arcs", badge: "danger" };
  if (s >= 20) return { level: "Very Weak Consistency", fix: "Major rewrite needed", badge: "danger" };
  if (s >= 10) return { level: "Poor Consistency", fix: "Severe inconsistencies", badge: "danger" };
  return { level: "Broken Narrative", fix: "Rebuild story structure", badge: "danger" };
};
const scoreRangeRows = [
  ["90–100%", "Excellent Consistency", "Minor continuity polish"],
  ["80–89%", "Very Consistent", "Fix minor timeline or detail gaps"],
  ["70–79%", "Consistent", "Improve character behavior & transitions"],
  ["60–69%", "Mostly Consistent", "Resolve timeline mismatches"],
  ["50–59%", "Moderate Consistency", "Fix plot gaps & repetition"],
  ["40–49%", "Low Consistency", "Improve logic & continuity"],
  ["30–39%", "Weak Consistency", "Restructure story arcs"],
  ["20–29%", "Very Weak Consistency", "Major rewrite needed"],
  ["10–19%", "Poor Consistency", "Severe inconsistencies"],
  ["0–9%", "Broken Narrative", "Rebuild story structure"],
];
/* ─────────────────────────────────────────────
   CATEGORY CARDS  — 7 mini score cards
───────────────────────────────────────────── */
const CategoryCards = ({ categories }) => {
  if (!Array.isArray(categories) || categories.length === 0) return null;
  return (
    <div className="category-grid">
      {CATEGORY_CONFIG.map((cfg) => {
        const found = categories.find((c) => c.key === cfg.key);
        const score = found?.score ?? null;
        const meta = score !== null ? getScoreMeta(score) : null;
        return (
          <div key={cfg.key} className="category-card">
            <div className="category-icon">{cfg.icon}</div>
            <div className="category-name">{cfg.label}</div>
            {score !== null ? (
              <>
                <div className={`category-score score-${meta.badge}`}>{score}%</div>
                <div className="cat-bar-bg">
                  <div
                    className={`cat-bar-fill bar-${meta.badge}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="category-na">No data</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
/* ─────────────────────────────────────────────
   SEVERITY OVERVIEW
───────────────────────────────────────────── */
const SeverityOverview = ({ issues }) => {
  const high = issues.filter((i) => i.severity === "HIGH").length;
  const medium = issues.filter((i) => i.severity === "MEDIUM").length;
  const low = issues.filter((i) => i.severity === "LOW").length;
  const cards = [
    { label: "High", count: high, cls: "sev-high" },
    { label: "Medium", count: medium, cls: "sev-medium" },
    { label: "Low", count: low, cls: "sev-low" },
    { label: "Total", count: issues.length, cls: "sev-total" },
  ];
  return (
    <div className="severity-grid">
      {cards.map(({ label, count, cls }) => (
        <div key={label} className={`severity-card ${cls}`}>
          <div className="severity-num">{count}</div>
          <div className="severity-lbl">{label}</div>
        </div>
      ))}
    </div>
  );
};
/* ─────────────────────────────────────────────
   FIX PRIORITY LIST  — top 5 by severity
───────────────────────────────────────────── */
const FixPriorityList = ({ issues }) => {
  const ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sorted = [...issues]
    .sort((a, b) => (ORDER[a.severity] ?? 2) - (ORDER[b.severity] ?? 2))
    .slice(0, 5);
  if (!sorted.length) return null;
  return (
    <div className="priority-list">
      {sorted.map((issue, i) => (
        <div key={i} className="priority-item">
          <div className="priority-num">{i + 1}</div>
          <div className="priority-body">
            <div className="priority-text">
              {issue.issue_description}
            </div>
            <div className="priority-meta">
              {issue.type && (
                <span className="type-tag">{issue.type}</span>
              )}
              <span className={`badge ${issue.severity === "HIGH" ? "danger" : issue.severity === "MEDIUM" ? "warning" : "success"}`} style={{ fontSize: 11 }}>
                {issue.severity}
              </span>
              <span className="priority-loc">
                Ch {issue.chapter_number} · Line {issue.line_number}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
/* ─────────────────────────────────────────────
   ISSUE LIST WITH FILTER
───────────────────────────────────────────── */
const IssueList = ({ issues }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const types = ["All", ...new Set(issues.map((i) => i.type).filter(Boolean))];
  const filtered = activeFilter === "All" ? issues : issues.filter((i) => i.type === activeFilter);
  if (!issues.length) {
    return (
      <div className="summary-box" style={{ textAlign: "center" }}>
        <p style={{ color: "#166534", fontWeight: 500 }}>✓ No consistency issues detected</p>
      </div>
    );
  }
  return (
    <>
      {/* filter buttons */}
      <div className="issue-filter-row">
        {types.map((t) => (
          <button
            key={t}
            className={`filter-chip ${activeFilter === t ? "active" : ""}`}
            onClick={() => setActiveFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><p>No issues for this category.</p></div>
      ) : (
        filtered.map((issue, i) => (
          <div
            key={i}
            className={`issue-card issue-${issue.severity?.toLowerCase()}`}
          >
            <div className="issue-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} />
                <span className={`severity ${issue.severity?.toLowerCase()}`}>
                  {issue.severity}
                </span>
                {issue.type && (
                  <span className="type-tag">{issue.type}</span>
                )}
              </div>
              <span className="issue-loc">
                Ch {issue.chapter_number} · L{issue.line_number}
              </span>
            </div>
            <div className="issue-body">
              <p>
                <strong>Chapter:</strong> {issue.chapter_number} – {issue.chapter_title}
              </p>
              <p>
                <strong>Line {issue.line_number}:</strong> {issue.line_text}
              </p>
              <p className="issue-description">{issue.issue_description}</p>
              {issue.suggested_fix && (
                <div className="suggestion">
                  <strong>Suggested Fix:</strong>
                  <p>{issue.suggested_fix}</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </>
  );
};
/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function AIReportPanel({
  data,
  loading,
  activeTab,
  setActiveTab,
  onRunTool,
  editorContent,
}) {
  const [inputText, setInputText] = useState("");
  const [hasRunPlagiarism, setHasRunPlagiarism] = useState(false);
  useEffect(() => {
    if (activeTab === "plagiarism") setInputText("");
  }, [activeTab]);
  /* ================= PLAGIARISM ================= */
  const renderPlagiarism = () => {
    const p = data?.plagiarism;
    if (!p && !hasRunPlagiarism) {
      return (
        <div className="empty-state">
          <p>
            No plagiarism report yet.
            Click <strong>Plagiarism Check</strong> above to run the analysis.
          </p>
        </div>
      );
    }
    if (!p) {
      return (
        <div className="plagiarism-input">
          <h4>Plagiarism Check</h4>
          <button
            className="use-editor-btn"
            onClick={() => setInputText(editorContent || "")}
          >
            Use Full Chapter Content
          </button>
          <textarea
            placeholder="Or paste selected text..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="run-btn"
            onClick={() => {
              if (!inputText.trim()) { message.warning("Enter text first"); return; }
              setHasRunPlagiarism(true);
              onRunTool("plagiarism", inputText);
            }}
          >
            Run Check
          </button>
        </div>
      );
    }
    return (
      <>
        <div className="score-card">
          <h1>{p.plagiarismScore ?? 0}%</h1>
          <p>Similarity Score</p>
          <span
            className={`badge ${p.status === "HIGH_RISK" ? "danger"
                : p.status === "MEDIUM_RISK" ? "warning"
                  : "success"
              }`}
          >
            {p.status?.replace("_", " ") || "UNKNOWN"}
          </span>
        </div>
        <div className="stats-grid">
          <Stat label="Total Words" value={p.stats?.totalWords} />
          <Stat label="Plagiarized" value={p.stats?.plagiarizedWords} />
          <Stat label="Identical" value={p.stats?.identicalWords} />
          <Stat label="Similar" value={p.stats?.similarWords} />
          <Stat label="Sources" value={p.stats?.sourcesMatched} />
        </div>
        <div className="source-list">
          <h4>Detected Sources</h4>
          {p?.others?.sources?.map((src, index) => (
            <div key={index} className="source-item">
              <div className="source-header">
                <span>{src.score}% Match</span>
                <span className="risk">
                  {src.score > 80 ? "High Risk" : src.score > 50 ? "Medium Risk" : "Low Risk"}
                </span>
              </div>
              <div className="source-meta">
                <strong>{src.title || "Untitled"}</strong>
                <p>{src.source}</p>
                {src.url && (
                  <a href={src.url} target="_blank" rel="noopener noreferrer">View Source</a>
                )}
              </div>
              {src.plagiarismFound?.length > 0 && (
                <div className="matched-text">{src.plagiarismFound[0].sequence}</div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };
  /* ================= CONSISTENCY ================= */
  const renderConsistency = () => {
    const c = data?.consistency;
    if (!c) return <EmptyState text="No consistency report available." />;
    const score = c.overall_consistency_score ?? 0;
    const meta = getScoreMeta(score);
    const issues = Array.isArray(c.issues) ? c.issues : [];
    return (
      <div className="consistency-wrap">
        {/* ── 1. SCORE CARD ── */}
        <div className="score-card">
          <h1>{score}%</h1>
          <p>Consistency Score</p>
          <span className={`badge ${meta.badge}`}>{meta.level}</span>
          <p className="score-focus">Focus: {meta.fix}</p>
        </div>
        {/* ── 2. SUMMARY ── */}
        {c.summary && (
          <div className="con-section">
            <div className="con-section-title">Overview</div>
            <div className="summary-box"><p>{c.summary}</p></div>
          </div>
        )}
        {/* ── 3. CATEGORY CARDS ── */}
        {Array.isArray(c.categories) && c.categories.length > 0 && (
          <div className="con-section">
            <div className="con-section-title">Consistency categories</div>
            <CategoryCards categories={c.categories} />
          </div>
        )}
        {/* ── 5. SCORE RANGE GUIDE ── */}
        <div className="con-section">
          <div className="con-section-title">Score range guide</div>
          <div className="summary-box" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "#667085", fontWeight: 600 }}>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Range</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Level</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Fix Focus</th>
                </tr>
              </thead>
              <tbody>
                {scoreRangeRows.map(([range, level, fix]) => {
                  const [start, end] = range.replace(/%/g, "").split("–").map(Number);
                  const isActive = score >= start && score <= end;
                  return (
                    <tr
                      key={range}
                      style={{
                        borderTop: "1px solid #eef1f5",
                        background: isActive ? "#f0f9ff" : "transparent",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      <td style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>
                        {isActive && (
                          <span className="range-dot" />
                        )}
                        {range}
                      </td>
                      <td style={{ padding: "7px 8px", color: isActive ? "#174f78" : "inherit" }}>
                        {level}
                      </td>
                      <td style={{ padding: "7px 8px", color: "#4b5563" }}>{fix}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* ── 6. FIX PRIORITY LIST ── */}
        {issues.length > 0 && (
          <div className="con-section">
            <div className="con-section-title">Fix priority list</div>
            <FixPriorityList issues={issues} />
          </div>
        )}
        {/* ── 7. CHAPTER BREAKDOWN ── */}
        {Array.isArray(c.chapter_summary) && c.chapter_summary.length > 0 && (
          <div className="con-section">
            <div className="con-section-title">Chapter breakdown</div>
            {c.chapter_summary.map((ch, i) => (
              <div key={i} className="chapter-card">
                <div>
                  <p className="chapter-title">
                    Chapter {ch.chapter_number}: {ch.chapter_title}
                  </p>
                  <p className="chapter-issues">
                    {ch.issue_count === 0
                      ? "No issues found"
                      : `${ch.issue_count} issue${ch.issue_count > 1 ? "s" : ""} found`}
                  </p>
                </div>
                <span className={`badge ${getScoreMeta(ch.consistency_score).badge}`} style={{ fontSize: 13, fontWeight: 700 }}>
                  {ch.consistency_score}%
                </span>
              </div>
            ))}
          </div>
        )}
        {/* ── 8. ISSUES WITH FILTER ── */}
        <div className="con-section">
          <div className="con-section-title">Issues</div>
          <IssueList issues={issues} />
        </div>
      </div>
    );
  };
  /* ================= SUMMARY ================= */
  const renderSummary = () => {
    const s = data?.summary?.summary;
    if (!s) return <EmptyState text="No summary generated yet." />;
    return (
      <>
        {s.short_summary && (
          <div className="summary-box">
            <h4>Short Summary</h4>
            <p>{s.short_summary}</p>
          </div>
        )}
        {s.detailed_summary && (
          <div className="summary-box">
            <h4>Detailed Summary</h4>
            <p>{s.detailed_summary}</p>
          </div>
        )}
      </>
    );
  };
  /* ================= FACT ================= */
  const renderFact = () => {
    const f = data?.fact;
    if (!f?.length) return <EmptyState text="No fact check report available." />;
    return (
      <div className="fact-grid">
        {f.map((item, i) => (
          <div key={i} className="fact-card">
            <div className="fact-header">
              <strong>{item.claim}</strong>
            </div>
            <div className={`fact-verdict ${item.verdict?.toLowerCase() === "false" ? "false" : "verified"}`}>
              {item.verdict}
            </div>
            <p className="fact-explanation">{item.explanation}</p>
          </div>
        ))}
      </div>
    );
  };
  if (loading) {
    return (
      <div className="ai-report-panel">
        <div className="loader">Running TAV Analysis...</div>
      </div>
    );
  }
  return (
    <div className="ai-report-panel">
      <div className="ai-tabs">
        {["plagiarism", "consistency", "summary", "fact"].map((tab) => (
          <button
            key={tab}
            className={`ai-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="ai-content">
        {activeTab === "plagiarism" && renderPlagiarism()}
        {activeTab === "consistency" && renderConsistency()}
        {activeTab === "summary" && renderSummary()}
        {activeTab === "fact" && renderFact()}
      </div>
    </div>
  );
}
const Stat = ({ label, value }) => (
  <div className="stat-box">
    <h3>{value ?? 0}</h3>
    <p>{label}</p>
  </div>
);
const EmptyState = ({ text }) => (
  <div className="empty-state"><p>{text}</p></div>
);