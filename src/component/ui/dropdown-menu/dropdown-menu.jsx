import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import "./DropdownMenu.scss";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef(
  ({ className = "", inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={`dropdown-sub-trigger ${inset ? "inset" : ""} ${className}`}
      {...props}
    >
      {children}
      <ChevronRight className="dropdown-sub-trigger__icon" />
    </DropdownMenuPrimitive.SubTrigger>
  )
);

const DropdownMenuSubContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={`dropdown-sub-content ${className}`}
    {...props}
  />
));

const DropdownMenuContent = React.forwardRef(({ className = "", sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={`dropdown-content ${className}`}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

const DropdownMenuItem = React.forwardRef(({ className = "", inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={`dropdown-item ${inset ? "inset" : ""} ${className}`}
    {...props}
  />
));

const DropdownMenuCheckboxItem = React.forwardRef(({ className = "", children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={`dropdown-checkbox-item ${className}`}
    checked={checked}
    {...props}
  >
    <span className="dropdown-checkbox-item__indicator">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="icon" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));

const DropdownMenuRadioItem = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={`dropdown-radio-item ${className}`}
    {...props}
  >
    <span className="dropdown-radio-item__indicator">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="icon" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));

const DropdownMenuLabel = React.forwardRef(({ className = "", inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={`dropdown-label ${inset ? "inset" : ""} ${className}`}
    {...props}
  />
));

const DropdownMenuSeparator = React.forwardRef(({ className = "", ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={`dropdown-separator ${className}`}
    {...props}
  />
));

const DropdownMenuShortcut = ({ className = "", ...props }) => {
  return <span className={`dropdown-shortcut ${className}`} {...props} />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
