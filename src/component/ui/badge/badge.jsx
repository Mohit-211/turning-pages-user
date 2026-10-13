import React from "react";
import "./badge.scss";

function Badge({ className = "", variant = "default", ...props }) {
  return (
    <div className={`badge badge--${variant} ${className}`} {...props} />
  );
}

export { Badge };
