import React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import "./Toast.scss";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={`toast-viewport ${className}`}
      {...props}
    />
  )
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={`toast toast-${variant} ${className}`}
        {...props}
      />
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <ToastPrimitives.Action
      ref={ref}
      className={`toast-action ${className}`}
      {...props}
    />
  )
);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <ToastPrimitives.Close
      ref={ref}
      className={`toast-close ${className}`}
      {...props}
    >
      <X className="toast-close-icon" />
    </ToastPrimitives.Close>
  )
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <ToastPrimitives.Title
      ref={ref}
      className={`toast-title ${className}`}
      {...props}
    />
  )
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <ToastPrimitives.Description
      ref={ref}
      className={`toast-description ${className}`}
      {...props}
    />
  )
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
