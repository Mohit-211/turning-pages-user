import { useEffect, useState } from "react";
import { Home, BookOpen, Send, Settings, User, Menu, Rss, LayoutList, Headset, Quote, MessageSquare } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import "./DashboardSidebar.scss";
const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Books", url: "/dashboard/books", icon: BookOpen },
  { title: "Submissions", url: "/dashboard/submissions", icon: Send },
  // { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  // { title: "My Feed", url: "/dashboard/feed-page", icon: LayoutList },
  { title: "My Directory", url: "/dashboard/directory-page", icon: LayoutList },

  { title: "Quotes", url: "/dashboard/quotes", icon: Quote},
  { title: "Support", url: "/dashboard/support", icon: Headset },
  { title: "Chat", url: "/dashboard/chat", icon: MessageSquare },
];
const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored === "true";
  });
  const toggleSidebar = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    localStorage.setItem("sidebarCollapsed", String(newValue));
  };
  const isActive = (path) =>
    currentPath === path ||
    (path === "/dashboard" && currentPath === "/dashboard/");
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse Toggle */}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <Menu className="toggle-icon" />
      </div>
      <div className="sidebar-group">
        {!collapsed && <div className="sidebar-label">Navigation</div>}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="sidebar-menu-item">
                <Link
                  to={item.url}
                  className={`sidebar-menu-button ${
                    isActive(item.url) ? "active" : ""
                  }`}
                  data-tooltip={item.title}
                >
                  <Icon className="icon" />
                  {!collapsed && <span className="title">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
export default DashboardSidebar;