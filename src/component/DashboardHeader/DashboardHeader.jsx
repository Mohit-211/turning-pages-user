import React, { useState, useRef, useEffect } from "react";
import { Bell, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.scss";
import ProfileIcon from "../../assets/profileicon.jpg";
import { logoutApi } from "../../api/auth/auth.api";
import CreditBar from "./CreditBar";

const DashboardHeader = ({
  user,
  notifications = [],
  unreadCount = 0,
 
  maxCredits = 200,
}) => {
  const navigate = useNavigate();
  console.log(user,"user")
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // await logoutApi();
      localStorage.removeItem("book_publish_token");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <header className="dashboard-header">
      <div className="left-section">
        <div className="logo">
          <span className="emoji">📖</span>
          <span className="title">Turning Pages</span>
        </div>
      </div>

      <div className="center-section">
        <CreditBar
          credits={user?.total_credit}
          maxCredits={maxCredits}
          onMoreCredits={() => navigate("/dashboard/billing")}
        />
      </div>

      <div className="right-section">
        {/* Notifications */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => {
              setShowNotifications((s) => !s);
              setShowProfile(false);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown notification-dropdown">
              <div className="dropdown-header">Notifications</div>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.unread ? "unread" : ""}`}
                  >
                    <p className="message">{n.message}</p>
                    <span className="time">{n.time}</span>
                  </div>
                ))
              ) : (
                <div className="empty">No new notifications</div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="dropdown-wrapper" ref={profileRef}>
          <div
            className="profile-trigger"
            onClick={() => {
              setShowProfile((s) => !s);
              setShowNotifications(false);
            }}
          >
            <img src={ProfileIcon} alt="Profile" className="avatar" />
            <span className="username">
              {user?.user_profile?.name || "User"}
            </span>
            <ChevronDown size={16} />
          </div>

          {showProfile && (
            <div className="dropdown profile-dropdown">
              {/* <div className="profile-header">
                <p className="name">{user?.user_profile?.name || "User"}</p>
                <p className="email">{user?.email || "—"}</p>
              </div> */}

              <div
                className="dropdown-item"
                onClick={() => navigate("/dashboard/profile")}
              >
                <User size={16} />
                Profile
              </div>

              <div
                className="dropdown-item"
                onClick={() => navigate("/dashboard/settings")}
              >
                <Settings size={16} />
                Settings
              </div>

              <div className="divider" />

              <div className="dropdown-item danger" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
