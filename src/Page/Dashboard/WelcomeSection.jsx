import React from "react";
import { Button } from "antd";
import "./WelcomeSection.scss";

const WelcomeSection = ({ user, onNewBook }) => (
  <div className="welcome-section">
    <div>
      <h2>Welcome back, {user?.user_profile?.name}</h2>
      <p>Continue writing your next masterpiece</p>
    </div>
    <Button type="primary" className="new-book-btn" onClick={onNewBook}>
      + Start a New Book
    </Button>
  </div>
);

export default WelcomeSection;
