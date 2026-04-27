"use client";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Eye, Upload, XCircle, CheckCircle } from "lucide-react";
import { message, Modal } from "antd";
import "./Submissions.scss";
import {
  GetBookSubmittionHistoryApi,
  GetBooksBySubmittion,
} from "../../api/operations/book.api";
import EmptyState from "../../component/EmptyState";

const STATUS = {
  PENDING: "pending",
  IN_SUBMISSION: "in-submission",
  IN_FEEDBACK: "in-feedback",
  APPROVED: "approved",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  DRAFT: "draft",           // ✅ was missing
};

const STATUS_LABELS = {
  [STATUS.PENDING]: "Waiting for review",
  [STATUS.IN_SUBMISSION]: "In submission",
  [STATUS.IN_FEEDBACK]: "In feedback",
  [STATUS.APPROVED]: "Approved",
  [STATUS.REJECTED]: "Rejected",
  [STATUS.WITHDRAWN]: "Withdrawn",
  [STATUS.DRAFT]: "Draft",
};

const normalizeStatus = (status) => {
  if (!status) return STATUS.PENDING;
  const s = status.toLowerCase().trim();

  if (["in-editing", "in_editing", "editing"].includes(s)) return STATUS.IN_SUBMISSION;
  if (["feedback", "in-feedback", "in_feedback"].includes(s)) return STATUS.IN_FEEDBACK;   // ✅ fixed
  if (["pending", "waiting"].includes(s)) return STATUS.PENDING;
  if (s === "approved") return STATUS.APPROVED;
  if (s === "draft") return STATUS.DRAFT;
  if (s === "rejected") return STATUS.REJECTED;
  if (["withdraw", "withdrawn"].includes(s)) return STATUS.WITHDRAWN;
  if (["re-submit", "resubmit", "re_submit", "completed"].includes(s)) return STATUS.IN_SUBMISSION; // ✅ re-submit/completed map to a display state

  return STATUS.PENDING;
};

const ACCENT_COLORS = {
  [STATUS.PENDING]: "#f59e0b",
  [STATUS.IN_SUBMISSION]: "#2563eb",
  [STATUS.IN_FEEDBACK]: "#8b5cf6",
  [STATUS.APPROVED]: "#22c55e",
  [STATUS.REJECTED]: "#ef4444",
  [STATUS.WITHDRAWN]: "#94a3b8",
  [STATUS.DRAFT]: "#64748b",   // ✅ distinct color for draft
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);

  const navigate = useNavigate();

  /* ─── Fetch ─── */
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await GetBookSubmittionHistoryApi();
      const data = res?.data?.data || [];
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  /* ─── Common API Handler ─── */
  const handleSubmissionEvent = async (bookId, eventName) => {
    try {
      const res = await GetBooksBySubmittion({
        book_id: bookId,
        event_name: eventName,
      });

      const messageText = res?.data?.message;

      if (res?.data?.status === 200) {
        message.success(messageText || `${eventName} successful`);
        loadSubmissions();
      } else {
      }
    } catch (err) {
      console.error(`${eventName} failed`, err);
    }
  };

  /* ─── Confirm Modal ─── */
  const confirmAction = (bookId, eventName, label) => {
    Modal.confirm({
      title: `Are you sure you want to ${label}?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () => handleSubmissionEvent(bookId, eventName),
    });
  };

  /* ─── Actions ─── */
  const handleAction = (item, action) => {
    const bookId = item.submission_book?.id;

    if (action === "re-submit") {
      setSelectedBookId(bookId);
      setNote("");
      setNoteModalOpen(true);
      return;
    }

    if (action === "view") {
      navigate(`/dashboard/chaptermanager/${bookId}/view`);
      return;
    }

    if (action === "withdraw") {
      confirmAction(bookId, "withdraw", "withdraw this submission");
      return;
    }

    if (action === "completed") {
      confirmAction(bookId, "completed", "mark this submission as completed");  // ✅ clearer label
      return;
    }
  };

  /* ─── Re-submit note ─── */
  const handleSubmitNote = async () => {
    if (!note.trim()) return message.warning("Please enter a note");

    setNoteLoading(true);
    try {
      const res = await GetBooksBySubmittion({
        book_id: selectedBookId,
        event_name: "re-submit",
        note,
      });

      if (res?.data?.status === 200) {
        message.success(res?.data?.message || "Resubmitted successfully");
        setNoteModalOpen(false);
        setNote("");
        setSelectedBookId(null);
        loadSubmissions();
      } else {
      }
    } catch (err) {
      console.error("Resubmit failed", err);
    } finally {
      setNoteLoading(false);
    }
  };

  /* ─── Render Actions ─── */
  const renderCardActions = (item, statusKey) => {
    switch (statusKey) {
      case STATUS.DRAFT:
        return (
          <>
            <button
              className="action-btn view-btn"
              onClick={() => handleAction(item, "view")}
            >
              <Eye size={15} /> View
            </button>
            <button
              className="action-btn resubmit-btn"
              onClick={() => handleAction(item, "re-submit")}
            >
              <Upload size={15} /> Submit
            </button>
          </>
        );

      case STATUS.PENDING:
        return <p className="status-message">Waiting for admin's approval</p>;

      case STATUS.IN_SUBMISSION:
        return (
            <>
            <button
              className="action-btn view-btn"
              onClick={() => handleAction(item, "view")}
            >
              <Eye size={15} /> View
            </button>
            <button
              className="action-btn withdraw-btn"
              onClick={() => handleAction(item, "withdraw")}
            >
              <XCircle size={15} /> Withdraw
            </button>
            {/* <button
              className="action-btn resubmit-btn"
              onClick={() => handleAction(item, "re-submit")}
            >
              <Upload size={15} /> Resubmit
            </button> */}
            {/* <button
              className="action-btn approve-btn"
              onClick={() => handleAction(item, "completed")}
            >
              <CheckCircle size={15} /> Approve
            </button> */}
          </>
        );                          // ✅ allow withdraw while in submission

      case STATUS.IN_FEEDBACK:
        return (
          <>
            <button
              className="action-btn view-btn"
              onClick={() => handleAction(item, "view")}
            >
              <Eye size={15} /> View
            </button>
            <button
              className="action-btn withdraw-btn"
              onClick={() => handleAction(item, "withdraw")}
            >
              <XCircle size={15} /> Withdraw
            </button>
            <button
              className="action-btn resubmit-btn"
              onClick={() => handleAction(item, "re-submit")}
            >
              <Upload size={15} /> Resubmit
            </button>
            <button
              className="action-btn approve-btn"
              onClick={() => handleAction(item, "completed")}
            >
              <CheckCircle size={15} /> Approve
            </button>
          </>
        );

      case STATUS.APPROVED:
        return (
          <>
            <button
              className="action-btn view-btn"
              onClick={() => handleAction(item, "view")}
            >
              <Eye size={15} /> View
            </button>
            <button
              className="action-btn withdraw-btn"
              onClick={() => handleAction(item, "withdraw")}
            >
              <XCircle size={15} /> Withdraw
            </button>
            <button
              className="action-btn resubmit-btn"
              onClick={() => handleAction(item, "re-submit")}
            >
              <Upload size={15} /> Resubmit
            </button>
          </>
        );                           // ✅ approved: no "Approve" button (already approved)

      case STATUS.REJECTED:
        return (
          <>
            <button
              className="action-btn view-btn"
              onClick={() => handleAction(item, "view")}
            >
              <Eye size={15} /> View
            </button>
            <button
              className="action-btn resubmit-btn"
              onClick={() => handleAction(item, "re-submit")}
            >
              <Upload size={15} /> Resubmit
            </button>
          </>
        );                           // ✅ also show View on rejected

      case STATUS.WITHDRAWN:
        return (
          <>
            <p className="status-message">Submission withdrawn</p>
            <button
              className="action-btn resubmit-btn"
              onClick={() => handleAction(item, "re-submit")}
            >
              <Upload size={15} /> Resubmit
            </button>
          </>
        );                           // ✅ allow resubmit after withdrawal

      default:
        return null;
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
          <RefreshCw size={17} />
        </button>
      </header>

      {/* CONTENT */}
      {loading ? (
        <div className="skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="submission-card skeleton" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
  icon={<Upload size={40} />}
  title="No submissions yet"
  description="Start by submitting your first book"
  buttonText="Submit book"
  onButtonClick={() => navigate("/dashboard/books")}
/>
      ) : (
        <div className="submissions-grid">
          {submissions.map((item) => {
            const statusKey = normalizeStatus(item.submission_book?.status);

            return (
              <div key={item.id} className="submission-card">
                <div
                  className="card-accent-bar"
                  style={{ background: ACCENT_COLORS[statusKey] }}
                />

                <div className="card-header">
                  <h3>{item?.submission_book?.title || "—"}</h3>
                  <span className={`status-badge status-${statusKey}`}>
                    {STATUS_LABELS[statusKey]}
                  </span>
                </div>

                <div className="card-body">
                  <div className="meta-row">
                    <span>Last submitted</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  {renderCardActions(item, statusKey)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NOTE MODAL */}
      <Modal
        open={noteModalOpen}
        onCancel={() => setNoteModalOpen(false)}
        onOk={handleSubmitNote}
        confirmLoading={noteLoading}
        okButtonProps={{ disabled: !note.trim() }}
        title="Add resubmission note"
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: 10 }}
        />
      </Modal>
    </div>
  );
}