import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Eye, Upload, XCircle, CheckCircle } from "lucide-react";
import "./Submissions.scss";
import { GetBookSubmittionHistoryApi } from "../../api/operations/book.api";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Normalize backend status
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

  const handleWithdraw = (id) => {
    if (window.confirm("Withdraw this submission?")) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      alert("Submission withdrawn");
    }
  };

  return (
    <div className="submissions-page">
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

      {loading ? (
        <div className="skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="submission-card skeleton" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <p>No submissions yet</p>
          <Link to="/dashboard/books" className="start-btn">
            Submit your first book
          </Link>
        </div>
      ) : (
        <div className="submissions-grid">
          {submissions.map((item) => {
            const status = normalizeStatus(item.status);

            return (
              <div key={item.id} className="submission-card">
                <div className="card-header">
                  <h3 className="book-title">
                    {item?.submission_book?.title || "—"}
                  </h3>

                  <span className={`status-badge ${status.replace(/\s/g, "").toLowerCase()}`}>
                    {status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="meta-row">
                    <span className="label">Last Submission:</span>
                    <span>{item.created_at || "—"}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {status === "Waiting for Admin's approval" && (
                    <div className="status-message">
                      Waiting for Admin's approval
                    </div>
                  )}

                  {status === "Rejected" && (
                    <button className="action-btn resubmit-btn">
                      <Upload size={16} /> Resubmit
                    </button>
                  )}

                  {status === "Approved" && (
                    <>
                      <button className="action-btn view-btn">
                        <Eye size={16} /> View
                      </button>

                      <button
                        className="action-btn withdraw-btn"
                        onClick={() => handleWithdraw(item.id)}
                      >
                        <XCircle size={16} /> Withdraw
                      </button>

                      <button className="action-btn resubmit-btn">
                        <Upload size={16} /> Resubmit
                      </button>

                      <button className="action-btn approve-btn">
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
    </div>
  );
}
