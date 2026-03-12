import React, { useEffect, useState } from "react";
import {
  UpdateUserProfileApi,
  UserProfileApi,
} from "../../api/users/users.api";

import {
  GetAllPaymentsApi,
  GetPaymentSpendingListApi,
} from "../../api/operations/paymentApi";

import "./ProfilePage.scss";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  const [payments, setPayments] = useState([]);
  const [spendingList, setSpendingList] = useState([]);

  const [activeTab, setActiveTab] = useState("payments");

  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSpending, setLoadingSpending] = useState(true);

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

  /* =====================
     LOAD SPENDING
  ====================== */
  const loadSpendingList = async () => {
    try {
      setLoadingSpending(true);
      const res = await GetPaymentSpendingListApi();
      setSpendingList(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSpending(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadPayments();
    loadSpendingList();
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-placeholder">
            {user?.user_profile?.name?.[0]?.toUpperCase() || "?"}
          </div>

          <div>
            <h2>{user?.user_profile?.name}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={saving}  className="save-btn">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* FORM */}
      <div className="form-section">
        <h3>Personal Details</h3>

        <div className="form-grid">
          <div className="form-field">
            <label>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span>{errors.name}</span>}
          </div>

          <div className="form-field">
            <label>Mobile</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
            {errors.mobile && <span>{errors.mobile}</span>}
          </div>

          <div className="form-field">
            <label>Email</label>
            <input value={formData.email} disabled />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="profile-tabs">
        <button
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => setActiveTab("payments")}
        >
          Payment History
        </button>

        <button
          className={activeTab === "spending" ? "active" : ""}
          onClick={() => setActiveTab("spending")}
        >
          Spending History
        </button>
      </div>

      {/* TAB CONTENT */}

      {activeTab === "payments" && (
        <div className="payment-section">

          {loadingPayments ? (
            <p>Loading payment history...</p>
          ) : payments.length === 0 ? (
            <p>No payment records found</p>
          ) : (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payment Type</th>
                  <th>Mode</th>
                  <th>Credits</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {[...payments].reverse().map((p) => (
                  <tr key={p.id}>
                    <td>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>

                    <td>{p.payment_type}</td>
                    <td>{p.payment_mode}</td>
                    <td>{p.credit}</td>

                    <td>
                      {p.currency} {p.amount}
                    </td>

                    <td>{p.transaction_id}</td>

                    <td>{p.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    {activeTab === "spending" && (
  <div className="payment-section">
    {loadingSpending ? (
      <p>Loading spending history...</p>
    ) : spendingList.length === 0 ? (
      <p>No spending records found</p>
    ) : (
      <table className="payment-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>Description</th>
            <th>Credit Spent</th>
            <th>Remaining Credit</th>
          </tr>
        </thead>

        <tbody>
          {[...spendingList].reverse().map((s) => (
            <tr key={s.id}>
              <td>
                {new Date(s.created_at).toLocaleDateString()}
              </td>

              <td className="capitalize">
                {s.event_name?.replaceAll("_", " ")}
              </td>

              <td>
                {s.description ? s.description : "-"}
              </td>

              <td>{s.credit_spent}</td>

              <td>{s.remaining_credit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}
    </div>
  );
};

export default ProfilePage;