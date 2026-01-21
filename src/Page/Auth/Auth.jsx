import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../component/ui/Tabs/Tabs";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

import "./AuthLayout.scss";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (location.pathname === "/signup") {
      setActiveTab("signup");
    } else {
      setActiveTab("login");
    }
  }, [location.pathname]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(value === "login" ? "/login" : "/signup");
  };

  return (
    <AuthLayout>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="tabs-list">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Forms are rendered by routes or conditionally elsewhere */}
    </AuthLayout>
  );
};

export default Auth;
