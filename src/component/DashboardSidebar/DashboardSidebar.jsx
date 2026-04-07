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
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import "./DashboardSidebar.scss";
import { UserProfileApi } from "../../api/users/users.api";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Books", url: "/dashboard/books", icon: BookOpen },
  { title: "Submissions", url: "/dashboard/submissions", icon: Send },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "My Feed", url: "/dashboard/my-feed", icon: LayoutList },
  { title: "Social Feed", url: "/dashboard/social-feed", icon: Users },
  {
    title: "Credits",
    url: "/dashboard/credits",
    icon: CreditCard,
    showScore: true,
  },
  { title: "Quotes", url: "/dashboard/quotes", icon: Quote },
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

  const [creditScore, setCreditScore] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await UserProfileApi();
        console.log(res, "res")
        const score = Number(res?.data?.data?.total_credit);
        console.log(score, "score")
        setCreditScore(score);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setCreditScore(0);
      }
    };

    fetchProfile();
  }, []);

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
      {/* Toggle */}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <Menu className="toggle-icon" />
      </div>

      {/* Navigation */}
      <div className="sidebar-group">
        {!collapsed && <div className="sidebar-label">Navigation</div>}

        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.title} className="sidebar-menu-item">
                <Link
                  to={item.url}
                  className={`sidebar-menu-button ${isActive(item.url) ? "active" : ""
                    }`}
                  data-tooltip={item.title}
                >
                  <Icon className="icon" />

                  {!collapsed && (
                    <>
                      <span className="title">{item.title}</span>

                      {/* Credit Badge */}
                      {item.showScore && (
                        <span className="credit-badge">
                          {creditScore}
                        </span>
                      )}
                    </>
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