import React, { useEffect, useState, useMemo } from "react";
import {
  UpdateUserProfileApi,
  UserProfileApi,
} from "../../api/users/users.api";
import {
  GetAllPaymentsApi,
  GetPaymentSpendingListApi,
} from "../../api/operations/paymentApi";
import "./ProfilePage.scss";

/* ── helpers ─────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtCurrency = (currency, amount) =>
  `${currency}\u00a0${Number(amount).toLocaleString("en-IN")}`;

const StatusPill = ({ value = "" }) => (
  <span className={`status-pill ${value.toLowerCase()}`}>{value}</span>
);

/* ── SearchIcon ──────────────────────────────────── */
const SearchIcon = () => (
  <svg
    className="search-icon"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="13"
    height="13"
    style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", opacity: 0.4, pointerEvents: "none" }}
  >
    <circle cx="6.5" cy="6.5" r="4.5" />
    <path d="M10.5 10.5L14 14" strokeLinecap="round" />
  </svg>
);

/* ── PaymentTable ────────────────────────────────── */
const PaymentTable = ({ payments, loading }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...payments].reverse().filter((p) => {
      const matchQ = !q || JSON.stringify(p).toLowerCase().includes(q);
      const matchS = !statusFilter || p.payment_status?.toLowerCase() === statusFilter;
      return matchQ && matchS;
    });
  }, [payments, search, statusFilter]);

  if (loading) return <p>Loading payment history…</p>;
  if (!payments.length) return <p>No payment records found.</p>;
console.log(filtered,"filtered")
// console.log(payment_status,"payment_status")
  return (
    <>
      <div className="filter-bar">
        <div className="search-wrap">
          <SearchIcon />
          <input
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="success">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p>No matching records.</p>
      ) : (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Credits</th>
              <th>Amount</th>
              <th>Transaction ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{fmtDate(p.created_at)}</td>
                <td className="capitalize">{p.payment_type}</td>
                <td className="capitalize">{p.payment_mode}</td>
                <td>{p.credit?.toLocaleString()}</td>
                <td className="amount">{fmtCurrency(p.currency, p.amount)}</td>
                <td>
                  <span className="mono">{p.transaction_id || "—"}</span>
                </td>
                <td>
                  <StatusPill value={p.payment_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

/* ── SpendingTable ───────────────────────────────── */
const SpendingTable = ({ spendingList, loading }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...spendingList]
      .reverse()
      .filter((s) => !q || JSON.stringify(s).toLowerCase().includes(q));
  }, [spendingList, search]);

  if (loading) return <p>Loading spending history…</p>;
  if (!spendingList.length) return <p>No spending records found.</p>;

  return (
    <>
      <div className="filter-bar">
        <div className="search-wrap">
          <SearchIcon />
          <input
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p>No matching records.</p>
      ) : (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Description</th>
              <th>Credits spent</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{fmtDate(s.created_at)}</td>
                <td className="capitalize">
                  {s.event_name?.replaceAll("_", " ") || "—"}
                </td>
                <td style={{ color: "var(--text-2)" }}>{s.description || "—"}</td>
                <td className="amount">{s.credit_spent}</td>
                <td>{s.remaining_credit?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

/* ── ProfilePage ─────────────────────────────────── */
const ProfilePage = () => {
  const [user, setUser]         = useState(null);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [payments, setPayments] = useState([]);
  const [spendingList, setSpendingList] = useState([]);
  const [activeTab, setActiveTab]       = useState("payments");
  const [loading, setLoading]           = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSpending, setLoadingSpending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState("idle"); // idle | saving | saved
  const [errors, setErrors] = useState({});

  /* ── loaders ─────────────────────────────────── */
  const loadProfile = async () => {
    try {
      const res  = await UserProfileApi();
      const data = res?.data?.data;
      setUser(data);
      setFormData({
        name:   data?.user_profile?.name   || "",
        mobile: data?.user_profile?.mobile || "",
        email:  data?.email                || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  /* ── validation ───────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.mobile.trim()) {
      e.mobile = "Mobile number required";
    } else if (!/^\+?[\d\s]{10,15}$/.test(formData.mobile)) {
      e.mobile = "Invalid mobile number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── handlers ─────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSavedState("saving");
    try {
      await UpdateUserProfileApi(formData);
      await loadProfile();
      setSavedState("saved");
      setTimeout(() => setSavedState("idle"), 2500);
    } catch (err) {
      console.error(err);
      setSavedState("idle");
    } finally {
      setSaving(false);
    }
  };

  /* ── derived stats ────────────────────────────── */
  const totalPaid = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const creditsSpent = spendingList
    .slice(-30)
    .reduce((sum, s) => sum + (s.credit_spent || 0), 0);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "—";

  const saveLabel =
    savedState === "saving" ? "Saving…" :
    savedState === "saved"  ? "✓ Saved"  :
    "Save changes";

  const saveCls = `save-btn${savedState === "saved" ? " save-btn--saved" : ""}`;

  /* ── loading ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state" />
      </div>
    );
  }

  const initials = user?.user_profile?.name?.[0]?.toUpperCase() || "?";

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-placeholder">{initials}</div>
          <div>
            <h2>{user?.user_profile?.name || "—"}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-header-right">
          <div className="credit-badge">
            <span className="credit-badge__label">Credits</span>
                        {user?.total_credit?.toLocaleString() || "—"}

          </div>
          <button
            className={saveCls}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saveLabel}
          </button>
        </div>
      </div>

 

      {/* FORM */}
      <div className="form-section">
        <p className="section-title">Personal details</p>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span>{errors.name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="mobile">Mobile number</label>
            <input
              id="mobile"
              name="mobile"
              placeholder="+91 XXXXX XXXXX"
              value={formData.mobile}
              onChange={handleChange}
            />
            {errors.mobile && <span>{errors.mobile}</span>}
          </div>

          <div className="form-field">
            <label>Email address</label>
            <input value={formData.email} disabled readOnly />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="profile-tabs">
        <button
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => setActiveTab("payments")}
        >
          Payment history
        </button>
        <button
          className={activeTab === "spending" ? "active" : ""}
          onClick={() => setActiveTab("spending")}
        >
          Spending history
        </button>
      </div>

      {/* PANEL */}
      <div className="payment-section">
        <div className="panel-header">
          <span className="panel-title">
            {activeTab === "payments" ? "Transactions" : "Credit usage"}
          </span>
          <span className="record-count">
            {activeTab === "payments" ? payments.length : spendingList.length} records
          </span>
        </div>

        {activeTab === "payments" ? (
          <PaymentTable payments={payments} loading={loadingPayments} />
        ) : (
          <SpendingTable spendingList={spendingList} loading={loadingSpending} />
        )}
      </div>

    </div>
  );
};

export default ProfilePage;