import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Modal, InputNumber, Button, Spin } from "antd";
import StripePayment from "../StripePayment/StripePayment";
import "./CreditBar.scss";
import { UserProfileApi } from "../../api/users/users.api";

const CreditBar = ({ maxCredits = 100 }) => {
  const [open, setOpen] = useState(false);
  const [creditInput, setCreditInput] = useState(10);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH PROFILE ================= */
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await UserProfileApi();
      const userData = res?.data?.data;
      setCredits(userData?.total_credit || 0);
    } catch (error) {
      console.log("Profile fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const creditPercent = Math.min((credits / maxCredits) * 100, 100);
  const amount = creditInput;

  return (
    <>
      <div className="credit-bar">
        <div className="credit-info">
          <span className="label">Credits</span>
          <span className="count">
            {loading ? <Spin size="small" /> : `${credits} / ${maxCredits}`}
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${creditPercent}%` }}
          />
        </div>

        <button className="more-credits-btn" onClick={() => setOpen(true)}>
          <Plus size={14} />
          More Credits
        </button>
      </div>

      {/* 💳 Buy Credits Modal */}
      <Modal
        open={open}
        footer={null}
        destroyOnClose
        onCancel={() => setOpen(false)}
        title="Buy Credits"
      >
        <div style={{ marginBottom: 16 }}>
          <label>Enter Credits</label>
          <InputNumber
            min={1}
            max={1000}
            value={creditInput}
            onChange={(value) => setCreditInput(value || 1)}
            style={{ width: "100%", marginTop: 8 }}
          />
        </div>

        <div style={{ marginBottom: 20, fontWeight: 600 }}>
          Total Amount: <span>${amount}</span>
        </div>

        {/* <StripePayment
          amount={amount}
          credits={creditInput}
          onPaymentSuccess={() => {
            setOpen(false);
            setCreditInput(10);
            fetchUserProfile(); // 🔄 refresh credits after payment
          }}
          onCloseModal={() => setOpen(false)}
        /> */}
        <StripePayment
  amount={amount}
  credit={creditInput}
  payment_for="buy_credit"
  onPaymentSuccess={() => {
    setOpen(false);
    setCreditInput(10);
    fetchUserProfile();
  }}
  onCloseModal={() => setOpen(false)}
/>
      </Modal>
    </>
  );
};

export default CreditBar;