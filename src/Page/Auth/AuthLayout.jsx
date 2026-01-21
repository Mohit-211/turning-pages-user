import React from "react";
import { Card, CardContent } from "../../component/ui/Card/Card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import "./AuthLayout.scss";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="back-link">
          <ArrowLeft className="icon" />
          Back to Home
        </Link>
      </div>

      <div className="auth-main">
        <div className="auth-wrapper">
          <div className="auth-brand">
            <div className="brand-row">
              <span className="logo">📖</span>
              <span className="brand-title">Turning Pages</span>
            </div>
            <p className="brand-sub">
              Sign in to your account or create a new one
            </p>
          </div>

          <Card className="auth-card">
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
