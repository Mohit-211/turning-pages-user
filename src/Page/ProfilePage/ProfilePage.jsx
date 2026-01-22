import React, { useEffect, useState } from "react";
import {
  UpdateUserProfileApi,
  UserProfileApi,
} from "../../api/users/users.api";
import { GetAllPaymentsApi } from "../../api/operations/paymentApi";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /* =====================
     LOAD PROFILE
  ====================== */
  const loadProfile = async () => {
    try {
      const res = await UserProfileApi();
      const data = res?.data?.data;

      setUser(data);
      setFormData({
        name: data?.user_profile?.name || "",
        mobile: data?.user_profile?.mobile || "",
        email: data?.email || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     LOAD PAYMENTS
  ====================== */
  const loadPayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await GetAllPaymentsApi();
      setPayments(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadPayments();
  }, []);

  /* =====================
     VALIDATION
  ====================== */
  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";

    if (!formData.mobile.trim()) {
      e.mobile = "Mobile number required";
    } else if (!/^\+?\d{10,15}$/.test(formData.mobile)) {
      e.mobile = "Invalid mobile number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* =====================
     HANDLERS
  ====================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await UpdateUserProfileApi(formData);
      loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };


if (loading) {
    return (
      <div className="profile-page loading">
        <div className="skeleton-header" />
        <div className="skeleton-form">
          <div className="skeleton-line long" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
        </div>
      </div>
    );
  }
  return (
    <div className="profile-page">
      {/* ===== HEADER ===== */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-section">
            <div className="avatar-placeholder">
              {user?.user_profile?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <button className="edit-avatar">✎</button>
          </div>

          <div className="user-details">
            <h2 className="username">{user?.user_profile?.name}</h2>
            <p className="email-display">{user?.email}</p>
          </div>
        </div>

        <button className="save-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ===== FORM ===== */}
      <div className="form-section">
        <h3>Personal Details</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

            <div className="form-field">
              <label>Mobile</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
              {errors.mobile && (
                <span className="error-text">{errors.mobile}</span>
              )}
            </div>

            <div className="form-field">
              <label>Email</label>
              <input value={formData.email} disabled />
            </div>
          </div>
        </form>
      </div>

      {/* ===== PAYMENT HISTORY TABLE ===== */}
    
<div className="payment-section">
  <h3>Payment History</h3>

  {loadingPayments ? (
    <p className="no-payments">Loading payment history...</p>
  ) : payments.length === 0 ? (
    <p className="no-payments">No payment records found</p>
  ) : (
    <div className="payment-table-wrapper">
      <table className="payment-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Payment Type</th>
            <th>Mode</th>
            <th>Gateway</th>
            <th>Credits</th>
            <th>Amount</th>
            <th>Transaction ID</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {payments?.reverse().map((p) => (
            <tr key={p.id}>
              <td>
                {new Date(p.created_at).toLocaleDateString()}
              </td>

              <td>{p.payment_type}</td>
              <td className="capitalize">{p.payment_mode}</td>
              <td className="capitalize">{p.payment_gateway}</td>

              <td>{p.credit}</td>

              <td className="amount">
                {p.currency} {p.amount}
              </td>

              <td className="mono">{p.transaction_id}</td>

              <td>
                <span
                  className={`status-pill ${
                    p.payment_status === "success"
                      ? "completed"
                      : "pending"
                  }`}
                >
                  {p.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

    </div>
  );
};

export default ProfilePage;
