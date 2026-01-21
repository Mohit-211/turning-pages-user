import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Eye, Upload, XCircle, CheckCircle } from "lucide-react";
import "./Submissions.scss";

// Mock data (replace with real API)
const mockSubmissions = [
  {
    id: 1,
    bookTitle: "The Silent Echo",
    lastSubmission: "2025-12-15",
    lastReversal: "2025-12-20",
    status: "Pending", // Waiting for admin
  },
  {
    id: 2,
    bookTitle: "Whispers of the Moon",
    lastSubmission: "2025-11-02",
    lastReversal: "—",
    status: "Rejected",
  },
  {
    id: 3,
    bookTitle: "Broken Compass",
    lastSubmission: "2026-01-05",
    lastReversal: "2026-01-10",
    status: "Approved",
  },
];

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Replace with real API call
        // const data = await fetchSubmissions();
        const data = mockSubmissions;
        setSubmissions(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleWithdraw = (id) => {
    if (window.confirm("Withdraw this submission?")) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      alert("Submission withdrawn");
    }
  };

  const handleResubmit = (id) => {
    alert(`Resubmit requested for submission #${id}`);
  };

  const handleApprove = (id) => {
    alert(`Approved submission #${id}`);
  };

  const handleView = (id) => {
    alert(`Viewing submission #${id}`);
  };

  return (
    <div className="submissions-page">
      <header className="page-header">
        <h1>Submissions</h1>
        <button
          className="refresh-btn"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 800);
          }}
          disabled={loading}
          aria-label="Refresh"
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
          {submissions.map((sub) => (
            <div key={sub.id} className="submission-card">
              <div className="card-header">
                <h3 className="book-title">{sub.bookTitle}</h3>
                <span className={`status-badge ${sub.status.toLowerCase()}`}>
                  {sub.status}
                </span>
              </div>

              <div className="card-body">
                <div className="meta-row">
                  <span className="label">Last Submission:</span>
                  <span>{sub.lastSubmission}</span>
                </div>
                <div className="meta-row">
                  <span className="label">Last Reversal:</span>
                  <span>{sub.lastReversal}</span>
                </div>
              </div>

              <div className="card-actions">
                {sub.status === "Pending" && (
                  <div className="status-message">
                    Waiting for Admin's approval
                  </div>
                )}

                {sub.status === "Rejected" && (
                  <div className="status-message rejected">
                    Submission not approved by admin
                    <button
                      className="action-btn resubmit-btn"
                      onClick={() => handleResubmit(sub.id)}
                    >
                      <Upload size={16} /> Resubmit
                    </button>
                  </div>
                )}

                {sub.status === "Approved" && (
                  <>
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleView(sub.id)}
                    >
                      <Eye size={16} /> View
                    </button>

                    <button
                      className="action-btn withdraw-btn"
                      onClick={() => handleWithdraw(sub.id)}
                    >
                      <XCircle size={16} /> Withdraw
                    </button>

                    <button
                      className="action-btn resubmit-btn"
                      onClick={() => handleResubmit(sub.id)}
                    >
                      <Upload size={16} /> Resubmit
                    </button>

                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleApprove(sub.id)}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
