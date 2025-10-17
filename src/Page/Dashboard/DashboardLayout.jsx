import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import DashboardSidebar from "../../component/DashboardSidebar/DashboardSidebar";
import DashboardHeader from "../../component/DashboardHeader/DashboardHeader";
import "./Dashboard.scss";
import { UserProfileApi } from "../../api/users/users.api";
const { Content } = Layout;
const DashboardLayout = ({ children }) => {
  const [user, setUser] = useState()
  console.log(user, "user")
  const token = localStorage.getItem("book_publish_token");
  useEffect(() => {
    UserProfileApi().then((res) => {
      setUser(res?.data?.data)
    }).catch((error) => {
      // console.log(error)
    })
  }, [])

  return (
    <Layout className="dashboard">
      <DashboardSidebar />
    
      <Layout>
        <DashboardHeader user={user} notifications={[]} unreadCount={2} />
        <Content className="dashboard-content">{children}</Content>
      </Layout>
    </Layout>
  );
};
export default DashboardLayout;