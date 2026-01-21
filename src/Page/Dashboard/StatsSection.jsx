import React from "react";
import "./StatsSection.scss";

const StatsSection = ({ stats = [], isLoading = false }) => {
  // Default/fallback stats shown during loading or when data is empty
  const displayStats =
    isLoading || stats.length === 0
      ? [
          { title: "Total Books", value: "—" },
          { title: "Published", value: "—" },
          { title: "Submissions", value: "—" },
          { title: "Views", value: "—" },
        ]
      : stats;

  const getValueStyle = (title) => {
    const lower = title.toLowerCase();

    if (lower.includes("published") || lower.includes("completed")) {
      return "value-positive"; // blue
    }

    if (
      lower.includes("draft") ||
      lower.includes("in progress") ||
      lower.includes("pending") ||
      lower.includes("submissions") ||
      lower.includes("views")
    ) {
      return "value-warning"; // red
    }

    // default to blue for most neutral / positive stats
    return "value-positive";
  };

  return (
    <section className="stats-section">
      <div className="stats-grid">
        {displayStats.map((stat, index) => (
          <div
            key={index}
            className={`stat-card ${isLoading ? "loading" : ""}`}
          >
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className={`stat-value ${getValueStyle(stat.title)}`}>
                {isLoading ? null : stat.value}
              </h3>
            </div>

            {isLoading && (
              <div className="skeleton-overlay">
                <div className="skeleton-title" />
                <div className="skeleton-value" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
