"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./ConfirmModal.scss";

export default function ConfirmModal({
  plan,
  isAnnual,
  loading,
  onConfirm,
  onCancel,
  modalType,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!plan) return null;

  const isPlan = modalType === "plan";
  const isPublish = modalType === "publish";
  const period = isAnnual ? "/yr" : "/mo";

  return createPortal(
    <div className="cm-overlay" onClick={onCancel}>
      <div
        className="cm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="cm__header">
          {/* ✅ Title changes based on modalType */}
          <span className="cm__title">
            {isPlan ? "Confirm Subscription" : "Confirm Purchase"}
          </span>
          <button className="cm__close" onClick={onCancel} disabled={loading}>
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cm__body">
          <div className="cm__plan-name">{plan.name}</div>

          <div className="cm__rows">

            {/* Plan name row */}
            <div className="cm__row">
              <span className="cm__row-label">Package</span>
              <span className="cm__row-value">{plan.name}</span>
            </div>

            {/* ✅ Credits — shown for BOTH plan and publish */}
            <div className="cm__row">
              <span className="cm__row-label">Credits</span>
              <span className="cm__row-value">
                {plan.credits}
                {isPlan ? " / month" : " credits"}
              </span>
            </div>

            {/* ✅ Billing period — only for plan */}
            {isPlan && (
              <div className="cm__row">
                <span className="cm__row-label">Billing</span>
                <span className="cm__row-value">
                  {isAnnual ? "Annual" : "Monthly"}
                </span>
              </div>
            )}

            {/* ✅ Features list — only for publish */}
            {isPublish && plan.features?.length > 0 && (
              <div className="cm__row cm__row--features">
                <span className="cm__row-label">Includes</span>
                <ul className="cm__features-list">
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ Total */}
            <div className="cm__row cm__row--total">
              <span className="cm__row-label">Total</span>
              <span className="cm__row-price">
                ${plan.price}
                {isPlan ? period : " one-time"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="cm__footer">
          <button
            className="cm__btn cm__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="cm__btn cm__btn--confirm"
            onClick={() => onConfirm(plan, modalType)}
            disabled={loading}
          >
            {loading ? (
              <span className="cm__spinner" />
            ) : isPlan ? (
              "Confirm & Subscribe"
            ) : (
              "Confirm & Pay"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}