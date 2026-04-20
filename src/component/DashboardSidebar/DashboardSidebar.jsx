import { useEffect, useState } from "react";
import {
  Home,
  BookOpen,
  Send,
  User,
  Menu,
  LayoutList,
  Headset,
  Quote,
  MessageSquare,
  CreditCard,
  Users,
  Info,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { Tooltip } from "antd";
import "./DashboardSidebar.scss";
import { UserProfileApi } from "../../api/users/users.api";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home, tooltip: "Go to dashboard overview" },
  { title: "My Books", url: "/dashboard/books", icon: BookOpen, tooltip: "Manage your books" },
  { title: "Submissions", url: "/dashboard/submissions", icon: Send, tooltip: "Track submissions" },
  { title: "Profile", url: "/dashboard/profile", icon: User, tooltip: "Update your profile" },
  { title: "My Feed", url: "/dashboard/my-feed", icon: LayoutList, tooltip: "Your personal feed" },
  { title: "Social Feed", url: "/dashboard/social-feed", icon: Users, tooltip: "Community posts" },
  {
    title: "Credits",
    url: "/dashboard/credits",
    icon: CreditCard,
    showScore: true,
    tooltip: "Available credits for tools & submissions",
  },
  { title: "Quotes", url: "/dashboard/quotes", icon: Quote, tooltip: "View quotes by category and easily copy your favorites." },
  { title: "Support", url: "/dashboard/support", icon: Headset, tooltip: "Get help & support" },
  { title: "Chat", url: "/dashboard/chat", icon: MessageSquare, tooltip: "Chat with your book editor. Discuss edits, feedback, and updates in real time." },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const [creditScore, setCreditScore] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await UserProfileApi();
        setCreditScore(Number(res?.data?.data?.total_credit) || 0);
      } catch {
        setCreditScore(0);
      }
    };
    fetchProfile();
  }, []);

  const toggleSidebar = () => {
    const val = !collapsed;
    setCollapsed(val);
    localStorage.setItem("sidebarCollapsed", String(val));
  };

  const isActive = (path) =>
    currentPath === path ||
    (path === "/dashboard" && currentPath === "/dashboard/");

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Toggle */}
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
                {/* ✅ Tooltip on EVERY item */}
              
                  <Link
                    to={item.url}
                    className={`sidebar-menu-button ${
                      isActive(item.url) ? "active" : ""
                    }`}
                  >
                    <Icon className="icon" />

                    {!collapsed && (
                      <>
                        <div className="menu-content">
                          <span className="title">{item.title}</span>

                          {/* ℹ️ Info icon (extra detail) */}
                          {item.tooltip && (
                            <Tooltip title={item.tooltip}>
                              <Info
                                className="info-icon"
                                onClick={(e) => e.preventDefault()}
                              />
                            </Tooltip>
                          )}
                        </div>

                        {item.showScore && (
                          <span className="credit-badge">
                            {creditScore}
                          </span>
                        )}
                      </>
                    )}

                    {/* collapsed badge */}
                    {collapsed && item.showScore && (
                      <span className="credit-badge collapsed-badge">
                        {creditScore}
                      </span>
                    )}
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