import React, { useState } from "react";
import "./Tabs.scss";

const Tabs = ({ defaultValue, children, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    if (child.type.displayName === "TabsList") {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }

    if (child.type.displayName === "TabsContent") {
      return React.cloneElement(child, { activeTab });
    }

    return child;
  });

  return <div className={`custom-tabs ${className}`}>{enhancedChildren}</div>;
};

const TabsList = ({ children, activeTab, setActiveTab, className = "" }) => (
  <div className={`custom-tabs-list ${className}`}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, { activeTab, setActiveTab })
        : child
    )}
  </div>
);
TabsList.displayName = "TabsList";

const TabsTrigger = ({ value, children, activeTab, setActiveTab, className = "" }) => {
  const isActive = activeTab === value;
  return (
    <button
      className={`custom-tabs-trigger ${isActive ? "active" : ""} ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = ({ value, activeTab, children, className = "" }) => {
  if (activeTab !== value) return null;
  return <div className={`custom-tabs-content ${className}`}>{children}</div>;
};
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
