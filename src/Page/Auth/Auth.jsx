import React, { useState, useEffect } from "react";
import { Card, CardHeader } from "../../component/ui/Card/Card";
import { Tabs, TabsList, TabsTrigger } from "../../component/ui/Tabs/Tabs";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "./Auth.scss";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (location.pathname === "/signup") setActiveTab("signup");
    else setActiveTab("login");
  }, [location.pathname]);

  const handleTabChange = (value) => {
    console.log(value,"value")
    setActiveTab(value);
    navigate(value === "login" ? "/login" : "/signup");
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="back-link">
          <ArrowLeft className="icon" /> Back to Home
        </Link>
      </div>

      <div className="auth-main">
        <div className="auth-wrapper">
          <div className="auth-brand">
            <div className="brand-row">
              <span className="logo">📖</span>
              <span className="brand-title">Turning Pages</span>
            </div>
            <p className="brand-sub">Sign in to your account or create a new one</p>
          </div>

          <Card className="auth-card">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="tabs-list">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
