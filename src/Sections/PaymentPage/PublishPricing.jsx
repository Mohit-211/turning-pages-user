import { useState } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import StripePayment from "../../component/StripePayment/StripePayment";

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

function PublishCard({ pkg, onBuy, disablePayment }) {
  return (
    <div className="publish-card">
      <div className="publish-card__name">{pkg.name}</div>
      <div className="publish-card__price">${pkg.price}</div>

      <ul className="publish-card__features">
        {pkg.features.map((f, i) => (
          <li key={i}>✔ {f}</li>
        ))}
      </ul>

      <button
        className="publish-card__cta"
        onClick={() => onBuy(pkg)}
        disabled={disablePayment}
      >
        Buy now
      </button>
    </div>
  );
}

export default function PublishPricing({ disablePayment }) {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    message.success("Package purchased 🎉");

    setSelectedPackage(null);

    // ✅ redirect back to previous page
    const redirectTo = location.state?.from || "/dashboard";
    navigate(redirectTo);
  };

  return (
    <>
      <div className="pricing-page__section-header">
        <p className="pricing-page__eyebrow">One-time packages</p>
        <h2 className="pricing-page__title">Publishing packages</h2>
      </div>

      <div className="publish-grid">
        {PUBLISH_PACKAGES.map((pkg, i) => (
          <PublishCard
            key={i}
            pkg={pkg}
            onBuy={setSelectedPackage}
            disablePayment={disablePayment}
          />
        ))}
      </div>

      {selectedPackage && (
        <StripePayment
          amount={selectedPackage.price}
          credit={selectedPackage.credits}
          packageName={selectedPackage.value}
          payment_for="buy_credit"
          modalType="publish"
          onPaymentSuccess={handlePaymentSuccess}
          onCloseModal={() => setSelectedPackage(null)}
        />
      )}
    </>
  );
}