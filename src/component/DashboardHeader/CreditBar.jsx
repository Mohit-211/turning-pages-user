import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Modal, InputNumber, Button } from "antd";
import StripePayment from "../StripePayment/StripePayment"; // adjust path
import "./CreditBar.scss";

const CreditBar = ({ credits = 0, maxCredits = 100 }) => {
  const [open, setOpen] = useState(false);
  const [creditInput, setCreditInput] = useState(10);

  const creditPercent = Math.min((credits / maxCredits) * 100, 100);
  const amount = creditInput; // 1 credit = 1 price

  return (
    <>
      <div className="credit-bar">
        <div className="credit-info">
          <span className="label">Credits</span>
          <span className="count">
            {credits} / {maxCredits}
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

      {/* 💳 Simple Buy Credits Modal */}
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
            onChange={setCreditInput}
            style={{ width: "100%", marginTop: 8 }}
          />
        </div>

        <div style={{ marginBottom: 20, fontWeight: 600 }}>
          Total Amount: <span>${amount}</span>
        </div>

        <StripePayment
          amount={amount}
          credits={creditInput}
          onPaymentSuccess={() => {
            setOpen(false);
            setCreditInput(10);
            // 🔄 refresh credits from backend
          }}
          onCloseModal={() => setOpen(false)}
        />
      </Modal>
    </>
  );
};

export default CreditBar;
