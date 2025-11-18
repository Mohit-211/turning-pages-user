import React from "react";
import { Layout, Badge, Dropdown, Avatar, Button, message } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import "./DashboardHeader.scss";
import ProfileIcon from "../../assets/profileicon.jpg";
import { logoutApi } from "../../api/auth/auth.api";
const { Header } = Layout;
const DashboardHeader = ({ user, notifications, unreadCount }) => {
  const navigate = useNavigate();
  const notificationItems =
    notifications?.length > 0
      ? notifications.map((n) => ({
        key: n.id,
        label: (
          <div className="notification-item">
            <div className="notification-top">
              <p className="message">{n.message}</p>
              {n.unread && <span className="dot" />}
            </div>
            <p className="time">{n.time}</p>
          </div>
        ),
      }))
      : [
        {
          key: "empty",
          label: (
            <div className="empty-notification">No notifications</div>
          ),
        },
      ];
  const profileItems = [
    {
      key: "profile-group",
      label: (
        <div className="profile-label">
          <p className="name">{user?.user_profile?.name}</p>
          <p className="email">{user?.email}</p>
        </div>
      ),
      type: "group",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
    },
  ];
  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/dashboard/profile");
    } else if (key === "settings") {
      navigate("/settings");
    } else if (key === "logout") {
      handleLogout()

    }
  };
  const handleLogout = async () => {
    message.success("Logged out successfully");
    localStorage.removeItem("book_publish_token");
    navigate("/login");
    // try {
    //   const response = await logoutApi(); // call your logout API
    //   console.log(response, "==response for logout")
    //   message.success("Logged out successfully");
    //    localStorage.removeItem("book_publish_token");
    //   navigate("/login"); // redirect to login page
    // } catch (error) {
    //   console.log(error, "error")
    // }
  };
  return (
    <Header className="dashboard-header">
      <div className="left-section">
        {/* <Button
          type="text"
          icon={<MenuOutlined />}
          className="sidebar-trigger"
        />
        <div className="logo">
          <span className="emoji">📖</span>
          <span className="title">Turning Pages</span>
        </div> */}
      </div>
      <div className="right-section">
        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Badge count={unreadCount} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </Dropdown>
        <Dropdown
          menu={{ items: profileItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="profile-trigger">
            <Avatar src={ProfileIcon} size="small">
              {user?.user_profile?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
            <span className="username">{user?.user_profile?.name}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};
export default DashboardHeader;