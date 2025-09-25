import React from "react";

import { ArrowRight } from "lucide-react";
import "./CTABanner.scss";
import { Button } from "../../component/ui/button/button";

const CTABanner = () => {
  return (
    <section className="cta-banner">
      <div className="cta-container">
        <div className="cta-content">
          <h2>Start Your Book Today</h2>
          <p>
            Join thousands of authors who have transformed their manuscripts into published books. 
            Your story deserves to be told with excellence.
          </p>

          <div className="cta-buttons">
            <Button size="lg" variant="secondary" className="cta-join" asChild>
              <a href="/auth">
                Join Now
                <ArrowRight className="cta-arrow" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="cta-learn">
              Learn More
            </Button>
          </div>

          <div className="cta-features">
            <span>✓ 30-day free trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
