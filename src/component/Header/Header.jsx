import React from "react";
import "./Header.scss";
import { Button } from "../../component/ui/button/button";

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <div className="header__logo">
          <span className="header__icon">📖</span>
          <span className="header__title">Turning Pages</span>
        </div>

        {/* Navigation */}
        <nav className="header__nav">
          <a href="#features">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
        </nav>

        {/* Actions */}
        <div className="header__actions">
          <Button variant="ghost" className="signin-btn" asChild>
            <a href="/login" style={{ color: "black",textDecoration:"none" }}>Sign In</a>
          </Button>
          <Button variant="default" className="getstarted-btn" asChild>
            <a href="/login" style={{ color: "white",textDecoration:"none"  }}>Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
