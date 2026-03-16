import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePayment = ({
  amount,
  credit,
  payment_for,
  book_submission_id,
  onCloseModal,
  onPaymentSuccess,
}) => {
  if (!amount) return null;
console.log(amount,payment_for,book_submission_id,"book_submission_id")
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        credit={credit}
        payment_for={payment_for}
        book_submission_id={book_submission_id}
        onCloseModal={onCloseModal}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
};

export default StripePayment;