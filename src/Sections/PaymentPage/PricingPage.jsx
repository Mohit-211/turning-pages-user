import React, { useState } from "react";
import { Card, Button, Tag, Modal } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import "./PricingPage.scss";
import StripePayment from "../../component/StripePayment/StripePayment";

const plans = [
  { title: "Basic", price: "$50", amount: 50, credits: 50, note: "No bonus credits" },
  { title: "Value", price: "$100", amount: 100, credits: 120, tag: "Best Value", highlight: true, note: "+20 Bonus Credits" },
  { title: "Pro", price: "$200", amount: 200, credits: 250, tag: "Most Popular", note: "+50 Bonus Credits" },
];

const PricingCards = ({ onPaymentDone }) => {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleBuy = (plan) => {
    setSelectedPlan(plan);
    setOpen(true);
  };

  const handleSuccess = (paymentIntent) => {
    console.log("Payment Success:", paymentIntent);
    console.log("Credits Purchased:", selectedPlan?.credits);

    // 🔹 Call backend to add credits if needed

    setOpen(false);
    setSelectedPlan(null);

    if (onPaymentDone) {
      setTimeout(() => onPaymentDone(), 800);
    }
  };

  return (
    <>
      <section id="pricing">
        <div className="pricing-wrapper">
          {plans.map((plan) => (
            <Card key={plan.title} className={`pricing-card ${plan.highlight ? "active" : ""}`}>
              {plan.tag && <Tag color="gold">{plan.tag}</Tag>}
              <h2 className="plan-title">{plan.title}</h2>
              <div className="price-section"><span className="price">{plan.price}</span></div>
              <div className="credit-box"><ThunderboltOutlined /><span>{plan.credits} Credits</span></div>
              <p className="credit-note">{plan.note}</p>
              <Button type={plan.highlight ? "primary" : "default"} block size="large" onClick={() => handleBuy(plan)}>
                Buy Credits
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <Modal open={open} footer={null} destroyOnClose onCancel={() => setOpen(false)}>
        {selectedPlan && (
          <StripePayment
            amount={selectedPlan.amount}
            credits={selectedPlan.credits}
            onPaymentSuccess={handleSuccess}
            onCloseModal={() => setOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};

export default PricingCards;
