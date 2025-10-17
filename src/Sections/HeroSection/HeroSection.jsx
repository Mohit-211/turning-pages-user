import React from "react";
import heroImage from "../../assets/hero-illustration.jpg";
import "./HeroSection.scss";
import { Button } from "../../component/ui/button/button";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-grid">
          {/* Left side */}
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Write. Edit. Publish.{" "}
                <span className="highlight">Smarter.</span>
              </h1>
              <p>
                Turning Pages helps authors draft, upload, and refine manuscripts with
                AI-powered editorial support.
              </p>
            </div>

            <div className="hero-buttons">
              <Button size="lg" className="btn-primary" asChild>
                <a href="/dashboard" style={{color:"white",textDecoration:"none"}}>Get Started</a>
              </Button>
              <Button variant="outline" size="lg" className="btn-outline">
                Watch Demo
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Authors</div>
              </div>
              <div className="stat">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Books Published</div>
              </div>
              <div className="stat">
                <div className="stat-number">4.9</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="hero-image">
            <img
              src={heroImage}
              alt="AI Book Writing Platform Illustration"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
