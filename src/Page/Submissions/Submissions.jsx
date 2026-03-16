import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Eye, Upload, XCircle, CheckCircle } from "lucide-react";
import { Modal } from "antd";
import "./Submissions.scss";
import {
  GetBookSubmittionHistoryApi,
  GetBooksBySubmittion,
} from "../../api/operations/book.api";
import StripePayment from "../../component/StripePayment/StripePayment";
export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [eventName, setEventName] = useState("");
  /* ================= STATUS NORMALIZE ================= */
  const normalizeStatus = (status) => {
    if (!status) return "Waiting for Admin's approval";
    const s = status.toLowerCase();
    if (["pending", "waiting", "inditing"].includes(s)) {
      return "Waiting for Admin's approval";
    }
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return "Waiting for Admin's approval";
  };
  /* ================= LOAD SUBMISSIONS ================= */
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await GetBookSubmittionHistoryApi();
      const data = res?.data?.data || [];
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching submission history", err);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSubmissions();
  }, []);
  /* ================= PAYMENT FLOW ================= */
  const handleSubmitForEditing = (bookId, event_name) => {
    setSelectedBookId(bookId);
    setEventName(event_name);
    setPaymentOpen(true);
  };
  const submitAfterPayment = async () => {
    try {
      await GetBooksBySubmittion({
        book_id: selectedBookId,
        event_name: eventName,
      });
      alert("Re-submit successful");
      loadSubmissions();
    } catch (error) {
      console.error("Action failed", error);
      alert("Action failed");
    }
  };
  /* ================= NORMAL ACTION ================= */
  const handleAction = async (bookId, event_name) => {
    if (event_name === "re-submit") {
      handleSubmitForEditing(bookId, event_name);
      return;
    }
    if (event_name === "withdraw") {
      const ok = window.confirm("Withdraw this submission?");
      if (!ok) return;
    }
    try {
      await GetBooksBySubmittion({
        book_id: bookId,
        event_name,
      });
      alert(`"${event_name}" action successful`);
      loadSubmissions();
    } catch (error) {
      console.error("Action failed", error);
      alert("Action failed");
    }
  };
  return (
    <div className="submissions-page">
      {/* HEADER */}
      <header className="page-header">
        <h1>Submissions</h1>
        <button
          className="refresh-btn"
          onClick={loadSubmissions}
          disabled={loading}
        >
          <RefreshCw size={18} />
        </button>
      </header>
      {/* LOADING */}
      {loading ? (
        <div className="skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="submission-card skeleton" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        /* EMPTY */
        <div className="empty-state">
          <p>No submissions yet</p>
          <Link to="/dashboard/books" className="start-btn">
            Submit your first book
          </Link>
        </div>
      ) : (
        /* GRID */
        <div className="submissions-grid">
          {submissions.map((item) => {
            const status = normalizeStatus(item.status);
            return (
              <div key={item.id} className="submission-card">
                {/* HEADER */}
                <div className="card-header">
                  <h3 className="book-title">
                    {item?.submission_book?.title || "—"}
                  </h3>
                  <span
                    className={`status-badge ${status
                      .replace(/\s/g, "")
                      .toLowerCase()}`}
                  >
                    {status}
                  </span>
                </div>
                {/* BODY */}
                <div className="card-body">
                  <div className="meta-row">
                    <span className="label">Last Submission:</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {/* ACTIONS */}
                <div className="card-actions">
                  {status === "Waiting for Admin's approval" && (
                    <div className="status-message">
                      Waiting for Admin's approval
                    </div>
                  )}
                  {status === "Rejected" && (
                    <button
                      className="action-btn resubmit-btn"
                      onClick={() => handleAction(item.id, "re-submit")}
                    >
                      <Upload size={16} /> Resubmit
                    </button>
                  )}
                  {status === "Approved" && (
                    <>
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleAction(item.id, "view")}
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        className="action-btn withdraw-btn"
                        onClick={() => handleAction(item.id, "withdraw")}
                      >
                        <XCircle size={16} /> Withdraw
                      </button>
                      <button
                        className="action-btn resubmit-btn"
                        onClick={() => handleAction(item.id, "re-submit")}
                      >
                        <Upload size={16} /> Resubmit
                      </button>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleAction(item.id, "completed")}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* STRIPE PAYMENT MODAL */}
      <Modal
        open={paymentOpen}
        footer={null}
        destroyOnClose
        onCancel={() => setPaymentOpen(false)}
        title="Complete Payment"
      >
        <StripePayment
          amount={40}
          payment_for="book_submission"
          book_submission_id={selectedBookId}
          onPaymentSuccess={() => {
            setPaymentOpen(false);
            submitAfterPayment();
          }}
          onCloseModal={() => setPaymentOpen(false)}
        />
      </Modal>
    </div>
  );
}