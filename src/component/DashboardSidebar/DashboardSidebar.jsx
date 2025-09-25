import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  SendOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./DashboardSidebar.scss";

const { Sider } = Layout;

const menuItems = [
  { key: "/dashboard", label: "Dashboard", icon: <HomeOutlined /> },
  { key: "/dashboard/books", label: "My Books", icon: <BookOutlined /> },
  { key: "/dashboard/submissions", label: "Submissions", icon: <SendOutlined /> },
  { key: "/dashboard/settings", label: "Settings", icon: <SettingOutlined /> },
  { key: "/dashboard/profile", label: "Profile", icon: <UserOutlined /> },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <Sider collapsible className="dashboard-sidebar">
      <div className="sidebar-title">Navigation</div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
      />
    </Sider>
  );
};

export default DashboardSidebar;
