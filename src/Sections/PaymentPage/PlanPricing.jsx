import { useEffect, useState } from "react";
import { message } from "antd";
import { CreateSubscriptionApi } from "../../api/operations/paymentApi";
import StripePayment from "../../component/StripePayment/StripePayment";
import { UserProfileApi } from "../../api/users/users.api";

const PLANS = [
  { id: "starter", value: "starter", name: "Starter", price: 29, credits: 5 },
  { id: "author", value: "author", name: "Author", price: 59, credits: 12 },
  { id: "pro", value: "pro_author", name: "Pro Author", price: 99, credits: 25, popular: true },
  { id: "studio", value: "studio", name: "Studio", price: 179, credits: 50 },
];

/* ================= PLAN CARD ================= */

function PlanCard({ plan, onBuy, hasActivePlan, isActive }) {
  // ❗ disable everything if already subscribed
  const isDisabled = hasActivePlan;

  const getButtonText = () => {
    if (isActive) return "Active Plan";
    if (hasActivePlan) return "Upgrade";
    return "Get started";
  };

  return (
    <div
      className={`plan-card 
        ${plan.popular ? "plan-card--popular" : ""} 
        ${isActive ? "plan-card--active" : ""}`}
    >
      {plan.popular && <div className="plan-card__badge">Most popular</div>}
      {isActive && <div className="plan-card__current">Current Plan</div>}

      <div className="plan-card__name">{plan.name}</div>

      <div className="plan-card__price">
        ${plan.price} <span>/mo</span>
      </div>

      <div className="plan-card__credits">
        {plan.credits} credits / month
      </div>

      <button
        className={`plan-card__cta ${isDisabled ? "disabled" : ""}`}
        onClick={() => !isDisabled && onBuy(plan)}
        disabled={isDisabled}
      >
        {getButtonText()}
      </button>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function PlanPricing() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await UserProfileApi();
      if (res?.data?.success) {
        setHasActivePlan(res.data.data.has_active_plan);
        setCurrentPlan(res.data.data.package_name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handlePaymentSuccess = async () => {
    try {
      const res = await CreateSubscriptionApi({
        package_name: selectedPlan.value,
      });

      if (res?.data?.success) {
        message.success("Subscription activated 🎉");

        await fetchUserProfile();
        window.dispatchEvent(new Event("profileUpdated"));
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
          <PlanCard
            key={plan.id}
            plan={plan}
            onBuy={setSelectedPlan}
            hasActivePlan={hasActivePlan}
            isActive={currentPlan === plan.value}
          />
        ))}
      </div>

      {/* ❌ will never open if user already has plan */}
      {!hasActivePlan && selectedPlan && (
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