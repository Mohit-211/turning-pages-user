import React from "react";
import "./EmptyState.scss";

const EmptyState = ({
  title = "Nothing here yet",
  description = "There’s no data to display right now.",
  buttonText,
  onButtonClick,
  icon,
}) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}

      <p className="empty-title">{title}</p>
      <span className="empty-description">{description}</span>

      {buttonText && (
        <button className="empty-btn" onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;