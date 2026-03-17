import React from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./BackToDashboard.scss";

const BackToDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="back-to-dashboard" onClick={() => navigate("/dashboard")}>
      <LeftOutlined className="back-icon" />
      <span className="back-text">Back to Dashboard</span>
    </div>
  );
};

export default BackToDashboard;
