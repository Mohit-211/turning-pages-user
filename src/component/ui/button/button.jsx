import React from "react";
import "./Button.scss";

const Button = React.forwardRef(
  ({ children, variant = "default", size = "default", asChild = false, className = "", ...props }, ref) => {
    const Comp = asChild ? "a" : "button";
    const classes = `btn btn-${variant} btn-${size} ${className}`.trim();

    return (
      <Comp ref={ref} className={classes} {...props}>
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
