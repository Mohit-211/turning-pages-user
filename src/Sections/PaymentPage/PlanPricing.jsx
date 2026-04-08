import { useState } from "react";
import { message } from "antd";
import { CreateSubscriptionApi } from "../../api/operations/paymentApi";
import StripePayment from "../../component/StripePayment/StripePayment";

const PLANS = [
  { id: "starter", value: "starter", name: "Starter", price: 29, credits: 5 },
  { id: "author", value: "author", name: "Author", price: 59, credits: 12 },
  { id: "pro", value: "pro_author", name: "Pro Author", price: 99, credits: 25, popular: true },
  { id: "studio", value: "studio", name: "Studio", price: 179, credits: 50 },
];

function PlanCard({ plan, onBuy }) {
  return (
    <div className={`plan-card${plan.popular ? " plan-card--popular" : ""}`}>
      {plan.popular && <div className="plan-card__badge">Most popular</div>}
      <div className="plan-card__name">{plan.name}</div>
      <div className="plan-card__price">
        ${plan.price}<span>/mo</span>
      </div>
      <div className="plan-card__credits">{plan.credits} credits / month</div>

      <button className="plan-card__cta" onClick={() => onBuy(plan)}>
        Get started
      </button>
    </div>
  );
}

export default function PlanPricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePaymentSuccess = async () => {
    try {
      const res = await CreateSubscriptionApi({
        package_name: selectedPlan.value,
      });

      if (res?.data?.success) {
        message.success("Subscription activated 🎉");
      } else {
        message.error("Subscription failed.");
      }

      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
      message.error("Something went wrong.");
    }
  };

  return (
    <>
      <div className="pricing-page__section-header">
        <p className="pricing-page__eyebrow">Subscription plans</p>
        <h1 className="pricing-page__title">Pick your plan</h1>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onBuy={setSelectedPlan} />
        ))}
      </div>

      {selectedPlan && (
        <StripePayment
          amount={selectedPlan.price}
          credit={selectedPlan.credits}
          packageName={selectedPlan.value}
          payment_for="subscription"
          modalType="plan"
          onPaymentSuccess={handlePaymentSuccess}
          onCloseModal={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
}