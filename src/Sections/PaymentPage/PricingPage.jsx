"use client";
import "./PricingPage.scss";
import PlanPricing from "./PlanPricing";
import PublishPricing from "./PublishPricing";
import { useLocation } from "react-router-dom";

export default function PricingPage() {
  const location = useLocation();
  

  const isPublishOnly = location.pathname === "/dashboard/publish-payment";
  const isPaymentPage = location.pathname === "/dashboard/payment";
console.log(isPaymentPage ,"isPaymentPage ")
  return (
    <div className="pricing-page">

      {/* ── PLANS ── */}
      {!isPublishOnly && (
        <>
          <PlanPricing />
          <hr className="pricing-page__divider" />
        </>
      )}

      {/* ── PUBLISH PACKAGES ── */}
      <PublishPricing disablePayment={isPaymentPage} />

    </div>
  );
}