import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DashboardHeader.scss";
import ProfileIcon from "../../assets/profileicon.jpg";
import logo from "../../../public/logo.jpg";

const DashboardHeader = ({
  user,
  notifications = [],
  unreadCount = 0,
  maxCredits = 200,
}) => {
  const navigate = useNavigate();

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
      localStorage.removeItem("book_publish_token");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="left-section">
        <div className="logo">
          <span className="emoji">
            <img src={logo} width={50} height={50} />
          </span>
          <span className="title">Turning Pages</span>
        </div>
      </div>

      <div className="center-section"></div>

      <div className="right-section">
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
  <div
    className="dropdown profile-dropdown"
    onClick={(e) => e.stopPropagation()}
  >
    <div
      className="dropdown-item"
      onClick={() => {
        setShowProfile(false); // ✅ close dropdown
        navigate("/dashboard/profile");
      }}
    >
      <User size={16} />
      Profile
    </div>

    <div
      className="dropdown-item"
      onClick={() => {
        setShowProfile(false); // ✅ close dropdown
        navigate("/dashboard/change-password");
      }}
    >
      <Key size={16} />
      Change Password
    </div>

    <div className="divider" />

    <div
      className="dropdown-item danger"
      onClick={() => {
        setShowProfile(false); // ✅ close dropdown
        handleLogout();
      }}
    >
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