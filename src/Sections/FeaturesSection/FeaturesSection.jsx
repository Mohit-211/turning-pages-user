import React from "react";
import { PenTool, Brain, Users } from "lucide-react";

import "./FeaturesSection.scss";
import { Card, CardContent } from "../../component/ui/Card/Card";

const features = [
  {
    icon: PenTool,
    title: "Write & Upload Manuscripts",
    description:
      "Seamlessly create new content or upload existing manuscripts. Our platform supports all major document formats and provides a distraction-free writing environment.",
  },
  {
    icon: Brain,
    title: "AI-Powered Editing",
    description:
      "Advanced AI algorithms analyze your writing for grammar, style, pacing, and structure. Get intelligent suggestions that preserve your unique voice.",
  },
  {
    icon: Users,
    title: "Professional Editorial Services",
    description:
      "Connect with experienced human editors for comprehensive manuscript reviews, developmental editing, and publication-ready polish.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2>Everything You Need to Write Better</h2>
          <p>
            From first draft to final manuscript, our comprehensive platform
            supports every step of your writing journey.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="feature-card">
                <CardContent className="feature-card-content">
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
