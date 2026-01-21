import React, { useEffect, useState } from "react";
import DashboardSidebar from "../../component/DashboardSidebar/DashboardSidebar";
import DashboardHeader from "../../component/DashboardHeader/DashboardHeader";
import { UserProfileApi } from "../../api/users/users.api";
import "./Dashboard.scss";

const DashboardLayout = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    UserProfileApi()
      .then((res) => {
        setUser(res?.data?.data || null);
      })
      .catch(() => {
        // silent fail — user stays null → header can show fallback
      });
  }, []);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <div className="dashboard-main">
        <DashboardHeader
          user={user}
          notifications={[]} // ← replace with real data later
          unreadCount={0} // ← dynamic later
        />

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
