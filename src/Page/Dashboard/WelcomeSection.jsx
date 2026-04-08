import React from "react";
import "./WelcomeSection.scss";
import PaymentSection from "./PaymentSection";

const WelcomeSection = ({ user, onNewBook }) => {
  const displayName = user?.user_profile?.name?.split(" ")[0] || "Creator";

  return (
    <>
    <section className="welcome-section">
      <div className="greeting">
        <h2>Welcome back, {displayName}</h2>
        <p>Continue shaping your next story</p>
      </div>

      <button className="new-book-button" onClick={onNewBook}>
        <span className="plus">+</span>
        Start a New Book
      </button>
    </section>
    <PaymentSection user={user}/>
    </>
  );
};

export default WelcomeSection;
