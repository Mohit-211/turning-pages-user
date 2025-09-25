import React from "react";
import { Star } from "lucide-react";
import "./TestimonialsSection.scss";
import { Card, CardContent } from "../../component/ui/Card/Card";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Romance Novelist",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b524?w=150&h=150&fit=crop&crop=face",
    content:
      "Turning Pages transformed my writing process. The AI editing caught nuances I missed, and the professional editors helped me publish my bestselling novel.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Non-fiction Author",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content:
      "The workflow is incredibly smooth. I uploaded my rough manuscript and received a polished, publication-ready book. The turnaround time was impressive.",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "First-time Author",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content:
      "As a new author, I was overwhelmed by the editing process. Turning Pages made it simple and affordable. My book is now available on major platforms!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2>What Authors Say</h2>
          <p>
            Join thousands of successful authors who trust Turning Pages with
            their manuscripts.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="testimonial-card">
              <CardContent className="testimonial-content">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star fill="#D62430" key={i} className="testimonial-star" />
                  ))}
                </div>

                <p className="testimonial-text">"{testimonial.content}"</p>

                <div className="testimonial-author">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div>
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
