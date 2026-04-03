import React from "react";
import "./PaymentSection.scss";
import { useNavigate } from "react-router-dom";

const PaymentSection = ({ user, onUpgrade, plan }) => {
  const displayName = user?.user_profile?.name?.split(" ")[0] || "Creator";
const navigate = useNavigate();
  return (
    <section className="payment-section-page">
      <div className="payment-info">
        <h2>Hi {displayName}, manage your plan 💳</h2>
        {/* <p>
          {plan
            ? `You're currently on the ${plan} plan`
            : "You are currently on a free plan"}
        </p> */}
      </div>

      <button className="upgrade-button" onClick={() => navigate("/dashboard/payment")}>
        <span className="icon">🚀</span>
        Purchase or Upgrade Plan
      </button>
    </section>
  );
};

export default PaymentSection;