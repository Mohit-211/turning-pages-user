"use client";
import { useState } from "react";
import "./PricingPage.scss";
import ConfirmModal from "./ConfirmModal";
import { message } from "antd";
import { CreateSubscriptionApi } from "../../api/operations/paymentApi";
import StripePayment from "../../component/StripePayment/StripePayment";

// ---------------- PLANS ----------------
const PLANS = [
  { id: "starter", value: "starter", name: "Starter", price: 29, credits: 5 },
  { id: "author", value: "author", name: "Author", price: 59, credits: 12 },
  { id: "pro", value: "pro_author", name: "Pro Author", price: 99, credits: 25, popular: true },
  { id: "studio", value: "studio", name: "Studio", price: 179, credits: 50 },
];

// ---------------- PUBLISH PACKAGES ----------------
const PUBLISH_PACKAGES = [
  {
    name: "Publish Ready",
    value: "publish_ready",
    price: 299,
    credits: 5,
    features: [
      "Interior formatting (ebook or paperback)",
      "Upload & submission to Amazon KDP",
      "Metadata setup and final quality check",
    ],
  },
  {
    name: "Professional Publish",
    value: "professional_publish",
    price: 699,
    credits: 12,
    features: [
      "Custom cover design (front & back)",
      "Interior formatting (ebook + paperback)",
      "Upload to Amazon KDP & Barnes & Noble Press",
      "Metadata optimization",
      "3 social media launch graphics",
    ],
  },
  {
    name: "Author Brand Launch",
    value: "author_brand_launch",
    price: 1199,
    credits: 25,
    features: [
      "Premium cover design (multiple concepts)",
      "Formatting for ebook, paperback & hardcover",
      "ISBN assistance",
      "10 social media graphics",
      "Priority turnaround & launch guidance",
    ],
  },
];

// ---------------- ICONS ----------------
function CheckIcon() {
  return (
    <svg className="check-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#E1F5EE" />
      <path d="M4 7l2 2 4-4" stroke="#1D9E75" strokeWidth="1.5" />
    </svg>
  );
}

// ---------------- PLAN CARD ----------------
function PlanCard({ plan, onGetStarted }) {
  return (
    <div className={`plan-card${plan.popular ? " plan-card--popular" : ""}`}>
      {plan.popular && <div className="plan-card__badge">Most popular</div>}
      <div className="plan-card__name">{plan.name}</div>
      <div className="plan-card__price">
        ${plan.price}<span>/mo</span>
      </div>
      <div className="plan-card__credits">{plan.credits} credits / month</div>
      <button className="plan-card__cta" onClick={() => onGetStarted(plan)}>
        Get started
      </button>
    </div>
  );
}

// ---------------- PUBLISH CARD ----------------
function PublishCard({ pkg, onBuy }) {
  return (
    <div className="publish-card">
      <div className="publish-card__name">{pkg.name}</div>
      <div className="publish-card__price">${pkg.price.toLocaleString()}</div>
      <ul className="publish-card__features">
        {pkg.features.map((f, i) => (
          <li key={i}>
            <CheckIcon /> {f}
          </li>
        ))}
      </ul>
      <button className="publish-card__cta" onClick={() => onBuy(pkg)}>
        Buy now
      </button>
    </div>
  );
}

// ---------------- MAIN ----------------
export default function PricingPage() {
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stripe state
  const [showStripe, setShowStripe] = useState(false);
  const [stripeAmount, setStripeAmount] = useState(0);
  const [stripeCredit, setStripeCredit] = useState(0);
  const [stripePackageName, setStripePackageName] = useState("");
  const [stripeModalType, setStripeModalType] = useState("");

  const handleGetStarted = (plan) => {
    setModalType("plan");
    setModalData(plan);
  };

  const handlePublishClick = (pkg) => {
    setModalType("publish");
    setModalData(pkg);
  };

  const handleConfirm = async (item, type) => {
    setStripeAmount(item.price);
    setStripeCredit(item.credits);
    setStripePackageName(item.value);
    setStripeModalType(type);
    setShowStripe(true);
    setModalData(null);
    setModalType(null);
  };

  const handlePaymentSuccess = async (paymentIntent, type) => {
    try {
      if (type === "plan") {
        const res = await CreateSubscriptionApi({ package_name: stripePackageName });
        if (res?.data?.success) {
          message.success("Subscription activated 🎉");
        } else {
          message.error("Payment received but subscription activation failed. Contact support.");
        }
      }
      if (type === "publish") {
        message.success("Purchase successful 🎉");
      }
      setShowStripe(false);
    } catch (err) {
      console.error(err);
      message.error("Something went wrong after payment.");
    }
  };

  return (
    <div className="pricing-page">

      {/* ── PLANS ── */}
      <div className="pricing-page__section-header">
        <p className="pricing-page__eyebrow">Subscription plans</p>
        <h1 className="pricing-page__title">Pick your plan</h1>
        <p className="pricing-page__subtitle">
          Monthly credits for TAV-assisted writing and publishing workflows.
        </p>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onGetStarted={handleGetStarted} />
        ))}
      </div>

      <hr className="pricing-page__divider" />

      {/* ── PUBLISH PACKAGES ── */}
      <div className="pricing-page__section-header">
        <p className="pricing-page__eyebrow">One-time packages</p>
        <h2 className="pricing-page__title">Publishing packages</h2>
        <p className="pricing-page__subtitle">
          Everything you need to take your manuscript to market.
        </p>
      </div>

      <div className="publish-grid">
        {PUBLISH_PACKAGES.map((pkg, i) => (
          <PublishCard key={i} pkg={pkg} onBuy={handlePublishClick} />
        ))}
      </div>

      {/* ── CONFIRM MODAL ── */}
      {modalData && (
        <ConfirmModal
          plan={modalData}
          loading={loading}
          modalType={modalType}
          onConfirm={handleConfirm}
          onCancel={() => {
            setModalData(null);
            setModalType(null);
          }}
        />
      )}

      {/* ── STRIPE PAYMENT ── */}
      {showStripe && (
        <StripePayment
          amount={stripeAmount}
          credit={stripeCredit}
          packageName={stripePackageName}
          payment_for={stripeModalType === "plan" ? "subscription" : "buy_credit"}
          modalType={stripeModalType}
          onPaymentSuccess={(paymentIntent) =>
            handlePaymentSuccess(paymentIntent, stripeModalType)
          }
          onCloseModal={() => setShowStripe(false)}
        />
      )}
    </div>
  );
}