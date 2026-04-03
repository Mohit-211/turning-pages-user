import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePayment = ({
  amount,
  credit,
  packageName,
  payment_for,
  modalType,          // ✅ "plan" | "publish"
  book_submission_id,
  onCloseModal,
  onPaymentSuccess,
}) => {
  if (!amount) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        credit={credit}
        packageName={packageName}
        payment_for={payment_for}
        modalType={modalType}   // ✅ passed down
        book_submission_id={book_submission_id}
        onCloseModal={onCloseModal}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
};

export default StripePayment;