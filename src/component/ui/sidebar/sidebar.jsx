// Sidebar.tsx
import React from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Button className="sidebar__toggle">
          <PanelLeft />
        </Button>
      </div>
      <div className="sidebar__content">
        <ul className="sidebar__menu">
          <li className="sidebar__menu-item">Dashboard</li>
          <li className="sidebar__menu-item">Settings</li>
          <li className="sidebar__menu-item">Profile</li>
        </ul>
      </div>
      <div className="sidebar__footer">Footer</div>
    </div>
  );
};

export default Sidebar;
