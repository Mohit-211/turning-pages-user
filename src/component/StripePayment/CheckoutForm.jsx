import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, message } from "antd";
import { stripePaymentApi, CreateSubscriptionApi } from "../../api/operations/paymentApi";
import { createPortal } from "react-dom";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a1a1a",
      fontFamily: "inherit",
      "::placeholder": { color: "#a0aec0" },
    },
    invalid: {
      color: "#e53e3e",
      iconColor: "#e53e3e",
    },
  },
};

const CheckoutForm = ({
  amount,
  credit,
  packageName,
  payment_for,
  modalType,         // "plan" | "publish"
  book_submission_id,
  onCloseModal,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState("");

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : "");
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!stripe || !elements || loading) return;

  setLoading(true);
  setCardError("");

  try {
    let clientSecret = null;

    /* ================= PLAN ================= */
    if (modalType === "plan") {
      const res = await CreateSubscriptionApi({
        package_name: packageName,
      });

      if (!res?.data?.success) {
        return;
      }

      clientSecret = res?.data?.data?.client_secret;

      // ✅ If backend already activated subscription
      if (!clientSecret) {
        message.success("Subscription activated 🎉");
        onPaymentSuccess?.(res.data);
        // onCloseModal?.();
        return;
      }
    }

    /* ================= PAYMENT API ================= */
    if (modalType === "publish") {
      const response = await stripePaymentApi({
        amount,
        package_name: packageName,
      });

      clientSecret = response?.data?.data?.client_secret;
    }

    if (payment_for === "book_submission") {
      const response = await stripePaymentApi({
        amount,
        payment_for: "book_submission",
        book_submission_id,
      });

      clientSecret = response?.data?.data?.client_secret;
    }

    /* ================= VALIDATION ================= */
    if (!clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    /* ================= STRIPE CONFIRM ================= */
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      setCardError(result.error.message);
      return;
    }

    /* ================= SUCCESS ================= */
    if (result.paymentIntent?.status === "succeeded") {
      if (modalType === "plan") {
        message.success("Subscription successful 🎉");
      } else {
        message.success("Payment successful 🎉");
      }

      onPaymentSuccess?.(result.paymentIntent);
      onCloseModal?.();
    } else {
    }

  } catch (err) {
    console.error("Stripe error:", err);
  } finally {
    setLoading(false);
  }
};
  const title = modalType === "plan" ? "Subscribe to Plan" : "Complete Purchase";

  return createPortal(
    <div
      onClick={onCloseModal}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            {title}
          </h3>
          <button
            onClick={onCloseModal}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: "#666",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>



        {/* Card form */}
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              color: "#444",
              marginBottom: "8px",
            }}
          >
            Card Details
          </label>

          <div
            style={{
              border: cardError ? "1.5px solid #e53e3e" : "1.5px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px 14px",
              background: "#fff",
              marginBottom: "8px",
              transition: "border-color 0.2s",
            }}
          >
            <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
          </div>

          {cardError && (
            <p style={{ color: "#e53e3e", fontSize: "12px", marginBottom: "16px", marginTop: 0 }}>
              {cardError}
            </p>
          )}

          <p style={{ fontSize: "12px", color: "#888", marginBottom: "20px" }}>
            🔒 Payments are encrypted and secured by Stripe
          </p>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!stripe || loading}
            block
            size="large"
          >
            {loading ? "Processing..." : `Pay $${amount}`}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CheckoutForm;