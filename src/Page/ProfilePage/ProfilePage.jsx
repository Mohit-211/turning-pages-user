import React, { useEffect, useState, useMemo } from "react";
import {
  UpdateUserProfileApi,
  UserProfileApi,
} from "../../api/users/users.api";
import {
  GetAllPaymentsApi,
  GetPaymentSpendingListApi,
  GetAllPaymentListApi,
  GetUserSubscriptionsApi,
  CancelSubscriptionApi,
} from "../../api/operations/paymentApi";
import "./ProfilePage.scss";
import { Button, message, Popconfirm, Tooltip } from "antd";
import { Info } from "lucide-react";

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
    style={{
      position: "absolute",
      left: 9,
      top: "50%",
      transform: "translateY(-50%)",
      opacity: 0.4,
      pointerEvents: "none",
    }}
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
      const matchS =
        !statusFilter || p.payment_status?.toLowerCase() === statusFilter;
      return matchQ && matchS;
    });
  }, [payments, search, statusFilter]);

  if (loading) return <p>Loading payment history…</p>;
  if (!payments.length) return <p>No payment records found.</p>;

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
              {/* <th>Credits</th> */}
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
                {/* <td>{p.credit?.toLocaleString()}</td> */}
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

  if (loading) return <p>Loading Credit Usage History…</p>;
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
              {/* <th>Description</th> */}
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
                {/* <td style={{ color: "var(--text-2)" }}>
                  {s.description || "—"}
                </td> */}
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

/* ── SubscriptionTable ───────────────────────────── */
const SubscriptionTable = ({ subscriptions, loading }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...subscriptions].reverse().filter((s) => {
      const matchQ = !q || JSON.stringify(s).toLowerCase().includes(q);
      const matchS =
        !statusFilter || s.payment_status?.toLowerCase() === statusFilter;
      return matchQ && matchS;
    });
  }, [subscriptions, search, statusFilter]);

  if (loading) return <p>Loading subscription details…</p>;
  if (!subscriptions.length) return <p>No subscription records found.</p>;
const PUBLISH_NAME_MAP = {
  publish_ready: "Publish Ready",
  professional_publish: "Professional Publish",
  author_brand_launch: "Author Brand Launch",
};
  return (
    <>
      <div className="filter-bar">
        <div className="search-wrap">
          <SearchIcon />
          <input
            placeholder="Search subscriptions…"
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
              <th>Plan</th>
              <th>Package Name</th>
              <th>Amount</th>
              {/* <th>Credits</th> */}
              <th>Transaction ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{fmtDate(s.created_at)}</td>
                <td className="capitalize">
                  {s.plan_name || s.payment_type || "—"}
                </td>
               <td>{PUBLISH_NAME_MAP[s.package_name] || s.package_name || "—"}</td>
                <td className="amount">{fmtCurrency(s.currency, s.amount)}</td>
                {/* <td>{s.valid_until ? fmtDate(s.valid_until) : "—"}</td> */}
                <td>
                  <span className="mono">{s.transaction_id || "—"}</span>
                </td>
                <td>
                  <StatusPill value={s.payment_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

/* ── MySubscriptionsTab ──────────────────────────── */

const PLAN_PALETTE = {
  starter: { bg: "#e8f1fb", color: "#1a5fa8" },
  author: { bg: "#e6f7f2", color: "#0d9973" },
  pro_author: { bg: "#fef3c7", color: "#b45309" },
  studio: { bg: "#fdecea", color: "#c0392b" },
};

const PLANS = [
  { id: "starter", value: "starter", name: "Starter", price: 29, credits: 5 },
  { id: "author", value: "author", name: "Author", price: 59, credits: 12 },
  { id: "pro", value: "pro_author", name: "Pro Author", price: 99, credits: 25 },
  { id: "studio", value: "studio", name: "Studio", price: 179, credits: 50 },
];

// ✅ palette
const getPalette = (sub) => {
  const key = (sub.package_name || sub.plan_name || "")
    .toLowerCase()
    .replace(/\s+/g, "_");

  return PLAN_PALETTE[key] || PLAN_PALETTE.starter;
};

// ✅ FINAL: return full plan OR fallback
const getPlanDetails = (value) => {
  const plan = PLANS.find((p) => p.value === value);
  if (plan) return plan;

  const publishMap = {
    publish_ready: { name: "Publish Ready" },
    professional_publish: { name: "Professional Publish" },
    author_brand_launch: { name: "Author Brand Launch" },
  };

  return publishMap[value] || { name: value || "—" };
};
const handleCancel = async (id) => {
  try {
    const res = await CancelSubscriptionApi();
console.log(res,"res")
    if (res?.data?.success) {
      message.success(res.data?.data.message || "Subscription cancelled");
      // 🔄 refresh list
      // window.location.reload(); // OR call your API again
    } else {
      message.error("Cancel failed");
    }
  } catch (err) {
    console.error(err);
    message.error("Something went wrong");
  }
};
const MySubscriptionsTab = ({ userSubscriptions, loading }) => {
  if (loading)
    return <p style={{ padding: "24px 20px" }}>Loading your subscriptions…</p>;

  if (!userSubscriptions.length)
    return (
      <p
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--text-3)",
        }}
      >
        No active subscriptions found.
      </p>
    );

  return (
    <div className="my-subscriptions">
      {userSubscriptions.map((sub) => {
        const palette = getPalette(sub);

        const isActive =
          sub.is_active === true ||
          sub.status?.toLowerCase() === "active";

        const planDetails = getPlanDetails(
          sub.package_name || sub.plan_name
        );

        return (
          <div key={sub.id} className="sub-card">

            {/* accent */}
            <div
              className="sub-card__accent"
              style={{ background: palette.color }}
            />

            <div className="sub-card__body">

              {/* top */}
              <div className="sub-card__top">
                <div>
                  <div className="sub-card__plan-name">
                    {planDetails.name}
                  </div>

                  <div className="sub-card__meta">
                    Subscribed on{" "}
                    {sub.created_at ? fmtDate(sub.created_at) : "—"}
                  </div>
                </div>

                <span
                  className={`status-pill ${
                    isActive ? "active" : "inactive"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* stats */}
              <div className="sub-card__stats">

                {/* Credits */}
                <div className="sub-card__stat">
                  <span className="sub-card__stat-label">Credits</span>
                  <span className="sub-card__stat-value">
                    {(sub.total_credit ??
                      sub.credit ??
                      planDetails.credits)?.toLocaleString() ?? "—"}
                  </span>
                </div>

                {/* Amount */}
                <div className="sub-card__stat">
                  <span className="sub-card__stat-label">Amount paid</span>
                  <span className="sub-card__stat-value">
                    {sub.amount != null
                      ? fmtCurrency(sub.currency || "₹", sub.amount)
                      : planDetails.price
                      ? fmtCurrency("$", planDetails.price)
                      : "—"}
                  </span>
                </div>

                {/* Validity */}
                <div className="sub-card__stat">
                  <span className="sub-card__stat-label">Valid until</span>
                  <span className="sub-card__stat-value">
                   {(sub.valid_until || sub.expires_at || sub.current_period_end)
  ? fmtDate(
      sub.valid_until ||
      sub.expires_at ||
      sub.current_period_end
    )
  : "—"}
                  </span>
                </div>

            {/* Cancel Button */}
{isActive && (
  <div style={{ marginTop: "16px", textAlign: "right" }}>
    {/* <Button
      danger
      onClick={() => handleCancel()}
    >
      Cancel Subscription
    </Button> */}
    {sub?.is_cancelled===true?
  <Button  disabled>Canceled Subscription</Button>
    :
    <Popconfirm
  title="Are you sure you want to cancel?"
  onConfirm={() => handleCancel()}
>
  
  <Button danger>Cancel Subscription</Button>
</Popconfirm>
      }
  </div>
)}

              </div>
            </div>

            {/* badge */}
            <div
              className="sub-card__badge"
              style={{ background: palette.bg, color: palette.color }}
            >
              {planDetails.name}
            </div>

          </div>
        );
      })}
    </div>
  );
};
/* ── ProfilePage ─────────────────────────────────── */
const ProfilePage = () => {
  const [user, setUser]         = useState(null);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [payments, setPayments] = useState([]);
  const [spendingList, setSpendingList]             = useState([]);
  const [subscriptions, setSubscriptions]           = useState([]);
  const [userSubscriptions, setUserSubscriptions]   = useState([]);
  const [activeTab, setActiveTab]                   = useState("spending");
  console.log(activeTab,"activeTab")
  const [loading, setLoading]                       = useState(true);
  const [loadingPayments, setLoadingPayments]       = useState(true);
  const [loadingSpending, setLoadingSpending]       = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions]         = useState(true);
  const [loadingUserSubscriptions, setLoadingUserSubscriptions] = useState(true);
  const [saving, setSaving]         = useState(false);
  const [savedState, setSavedState] = useState("idle");
  const [errors, setErrors]         = useState({});

  /* ── loaders ─────────────────────────────────── */
  const loadProfile = async () => {
    try {
      const res  = await UserProfileApi();
      const data = res?.data?.data;
      setUser(data);
      localStorage.setItem("userId", data?.role_id);
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

  const loadSubscriptionList = async () => {
    try {
      setLoadingSubscriptions(true);
      const res = await GetAllPaymentListApi();
      setSubscriptions(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      setLoadingUserSubscriptions(true);
      const res = await GetUserSubscriptionsApi();
      console.log(res,"res")
      setUserSubscriptions(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserSubscriptions(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadPayments();
    loadSpendingList();
    loadSubscriptionList();
    loadUserSubscriptions();
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

  /* ── panel meta ───────────────────────────────── */
  const panelTitle =
    activeTab === "payments"          ? "Transactions"           :
    activeTab === "spending"          ? "Credit usage"           :
    activeTab === "subscriptions"     ? "Subscription history"   :
    "My Subscription";

  const recordCount =
    activeTab === "payments"          ? payments.length          :
    activeTab === "spending"          ? spendingList.length       :
    activeTab === "subscriptions"     ? subscriptions.length      :
    userSubscriptions.length;

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
          <button className={saveCls} onClick={handleSubmit} disabled={saving}>
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
  {/* Credit Usage */}
  <button
    className={activeTab === "spending" ? "active" : ""}
    onClick={() => setActiveTab("spending")}
  >
    Credit Usage History

    <Tooltip title="View how your credits are used across different actions">
      <Info
        className="tab-info-icon"
        onClick={(e) => e.stopPropagation()}
      />
    </Tooltip>
  </button>

  {/* Payment History */}
  <button
    className={activeTab === "subscriptions" ? "active" : ""}
    onClick={() => setActiveTab("subscriptions")}
  >
    Payment History

    <Tooltip title="View all your payment transactions and history">
      <Info
        className="tab-info-icon"
        onClick={(e) => e.stopPropagation()}
      />
    </Tooltip>
  </button>

  {/* My Subscription */}
  <button
    className={activeTab === "my-subscriptions" ? "active" : ""}
    onClick={() => setActiveTab("my-subscriptions")}
  >
    My Subscription

    <Tooltip title="Manage and view your active subscription plans">
      <Info
        className="tab-info-icon"
        onClick={(e) => e.stopPropagation()}
      />
    </Tooltip>
  </button>
</div>

      {/* PANEL */}
      <div className="payment-section">
        <div className="panel-header">
          <span className="panel-title">{panelTitle}</span>
          <span className="record-count">{recordCount} records</span>
        </div>

        {activeTab === "spending" ? (
          <SpendingTable spendingList={spendingList} loading={loadingSpending} />
        ) : activeTab === "subscriptions" ? (
          <SubscriptionTable
            subscriptions={subscriptions}
            loading={loadingSubscriptions}
          />
        ) : (
          <MySubscriptionsTab
            userSubscriptions={userSubscriptions}
            loading={loadingUserSubscriptions}
          />
        )}
      </div>

    </div>
  );
};

export default ProfilePage;