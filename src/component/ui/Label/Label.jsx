import React, { forwardRef } from "react";
import "./Label.scss";

const Label = forwardRef(({ className = "", ...props }, ref) => {
  return (
    <label ref={ref} className={`custom-label ${className}`} {...props} />
  );
});

Label.displayName = "Label";

export { Label };
