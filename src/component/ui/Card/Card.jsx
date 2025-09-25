import React, { forwardRef } from "react";
import "./Card.scss";

const Card = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`custom-card ${className}`} {...props} />
));
Card.displayName = "Card";

const CardHeader = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`custom-card-header ${className}`} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className = "", ...props }, ref) => (
  <h3 ref={ref} className={`custom-card-title ${className}`} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`custom-card-description ${className}`} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`custom-card-content ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`custom-card-footer ${className}`} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
