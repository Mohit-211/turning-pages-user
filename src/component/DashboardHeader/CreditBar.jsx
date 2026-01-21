import React from "react";
import { Plus } from "lucide-react";
import "./CreditBar.scss";

const CreditBar = ({ credits = 0, maxCredits = 100, onMoreCredits }) => {
  const creditPercent = Math.min((credits / maxCredits) * 100, 100);

  return (
    <div className="credit-bar">
      <div className="credit-info">
        <span className="label">Credits</span>
        <span className="count">
          {credits} / {maxCredits}
        </span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${creditPercent}%` }} />
      </div>

      <button className="more-credits-btn" onClick={onMoreCredits}>
        <Plus size={14} />
        More Credits
      </button>
    </div>
  );
};

export default CreditBar;
