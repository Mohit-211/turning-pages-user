import React from "react";
import { Layout, Badge, Dropdown, Avatar, Button } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./DashboardHeader.scss";

const { Header } = Layout;

const DashboardHeader = ({ user, notifications, unreadCount }) => {
  const notificationItems =
    notifications.length > 0
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
      key: "profile",
      label: (
        <div className="profile-label">
          <p className="name">{user.name}</p>
          <p className="email">{user.email}</p>
        </div>
      ),
      type: "group",
    },
    {
      key: "user",
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
      label: <Link to="/">Sign Out</Link>,
    },
  ];

  return (
    <Header className="dashboard-header">
      <div className="left-section">
        <Button type="text" icon={<MenuOutlined />} className="sidebar-trigger" />
        <div className="logo">
          <span className="emoji">📖</span>
          <span className="title">Turning Pages</span>
        </div>
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
          menu={{ items: profileItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="profile-trigger">
            <Avatar src={user.avatar} size="small">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
            <span className="username">{user.name}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default DashboardHeader;
