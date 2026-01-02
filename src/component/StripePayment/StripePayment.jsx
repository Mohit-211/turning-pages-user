import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePayment = ({ amount, credits, onCloseModal, onPaymentSuccess }) => {
  if (!amount || !credits) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        credit={credits}
        onCloseModal={onCloseModal}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
};

export default StripePayment;
