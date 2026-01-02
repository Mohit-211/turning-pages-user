import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, message } from "antd";
import { stripePaymentApi } from "../../api/operations/paymentApi";

const CheckoutForm = ({ amount, credit, onCloseModal, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || loading) return;

    setLoading(true);

    try {
      // 1️⃣ Create PaymentMethod
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });

      if (error) {
        message.error(error.message);
        setLoading(false);
        return;
      }

      // 2️⃣ Call backend to create PaymentIntent
      const payload = { amount, credit };
      const response = await stripePaymentApi(payload);

      // ⚡ Use client_secret from backend
      const clientSecret = response?.data?.data?.client_secret;

      if (!clientSecret) {
        message.error("Payment initialization failed.");
        setLoading(false);
        return;
      }

      // 3️⃣ Confirm Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        message.error(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        message.success("Payment successful 🎉");
        onPaymentSuccess?.(result.paymentIntent);
        onCloseModal?.();
      }
    } catch (err) {
      console.error("Stripe error:", err);
      message.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkoutFormContainer">
      <form onSubmit={handleSubmit} className="checkoutForm">
        <CardElement className="cardElement" />
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={!stripe}
          block
          style={{ marginTop: 20 }}
        >
          Pay ${amount}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutForm;
