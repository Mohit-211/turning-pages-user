import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import "./ChapterManager.scss";

import ChapterList from "./chapterComponent/ChapterList";
import AddChapterModal from "./chapterComponent/AddChapterModal";
import UploadChapterModal from "./chapterComponent/UploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
import AIReportPanel from "./chapterComponent/AIReportPanel/AIReportPanel";
import PlagiarismModal from "./chapterComponent/PlagiarismModal/PlagiarismModal";
import FactCheckModal from "./chapterComponent/FactCheckModal/FactCheckModal";

import {
  GetBookByIdApi,
  GetBooksByStatusApi,
  GetBooksBySubmittion,
} from "../../api/operations/book.api";
import {
  CreateChapterApi,
  PlagiarismCheck,
  FactChecking,
  ConsistencyCheck,
  GenerateSummary,
  UpdateChapterApi,
  DeleteChapterApi,
} from "../../api/operations/chapter.api";

import { message, Modal } from "antd";
import Toolbar from "./chapterComponent/toolbar";
import ChapterEditor from "./chapterComponent/chapterEditor";
import PdfViewer from "./PdfViewer/PdfViewer";
import StripePayment from "../../component/StripePayment/StripePayment";
import AIToolsGuide from "./chapterComponent/AIToolsGuide";
import BookCoverPanel from "../Book/BookHeader/BookCoverPanel";
import { toast } from "react-toastify";

export default function ChapterManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookId } = useParams();

  // ── UI state ──────────────────────────────────────────────
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [showCoverChoice, setShowCoverChoice] = useState(false);
const [coverMode, setCoverMode] = useState(null); // "create" | "edit"
  const [showCoverPanel, setShowCoverPanel] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // ── Book / chapter state ──────────────────────────────────
  const [bookDetails, setBookDetails] = useState({});
  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [viewMode, setViewMode] = useState("edit");

  // ── Loading flags ─────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // ── Modals ────────────────────────────────────────────────
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // ── AI panel ─────────────────────────────────────────────
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [plagiarismModalOpen, setPlagiarismModalOpen] = useState(false);
  const [factModalOpen, setFactModalOpen] = useState(false);

  // ── Submission ────────────────────────────────────────────
  const [booksubmiition, setBookSubmitton] = useState();
  const [eventName, setEventName] = useState("");

  // ── AI results (persisted) ────────────────────────────────
  const [aiResults, setAiResults] = useState(() => {
    const stored = localStorage.getItem("aiResults");
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem("aiResults", JSON.stringify(aiResults));
  }, [aiResults]);

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchBookAndChapters();
  }, [bookId]);

  const fetchBookAndChapters = async () => {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      const data = res?.data?.data ?? {};

      setBookDetails(data);
      setChapters(data?.book_chapters ?? []);
      setSelectedId(data?.book_chapters?.[0]?.id ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sync editor content when chapter selection changes
  useEffect(() => {
    if (!selectedId) return;
    const chapter = chapters.find((c) => c.id === selectedId);
    setEditorContent(chapter?.content || "");
  }, [selectedId, chapters]);

  // ── Submission helpers ────────────────────────────────────
  // ── Submission helpers ────────────────────────────────────
const createBookSubmission = async (event_name) => {
  try {
    const res = await GetBooksBySubmittion({
      book_id: bookId,
      event_name,
    });

    const submissionId = res?.data?.data?.id;
    const messageText = res?.data?.message;

    if (!submissionId) {
      throw new Error("Submission failed");
    }

    if (res?.data?.status === 200) {
      message.success(messageText || "Action successful");

      // Redirect only for submit
      if (event_name === "submit") {
        setTimeout(() => {
          navigate("/dashboard/submissions");
        }, 1000);
      }
    }

    return submissionId;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
 const handleSubmitForEditing = async (event_name) => {
  try {
    if (event_name !== "submit") return;

    setSubmitLoading(true);

    await createBookSubmission("submit");

    toast.success("Book submitted for editing");
  } catch (error) {
    console.error(error);
    toast.error("Submit failed");
  } finally {
    setSubmitLoading(false);
  }
};
const handleMarkAsComplete = async (type) => {
  try {
    if (type !== "completed") return;

    setCompleteLoading(true);

    createBookSubmission("completed")
    toast.success("Book marked as complete");
  } catch (error) {
    console.error(error);
    toast.error("Failed to mark complete");
  } finally {
    setCompleteLoading(false);
  }
};
  // ── AI tools ──────────────────────────────────────────────
  const handleRunAITool = async (tool) => {
    if (!selectedId) {
      message.warning("Select a chapter first");
      return;
    }
    try {
      let response;
      switch (tool) {
        case "plagiarism":
          setPlagiarismModalOpen(true);
          return;
        case "fact":
          setFactModalOpen(true);
          return;
        case "consistency":
          setIsAIPanelOpen(true);
          setAiActiveTab(tool);
          setAiLoading(true);
          response = await ConsistencyCheck(Number(bookId));
          break;
        case "summary":
          setIsAIPanelOpen(true);
          setAiActiveTab(tool);
          setAiLoading(true);
          response = await GenerateSummary(Number(bookId), selectedId);
          break;
        default:
          return;
      }
      const resultData = response?.data?.data || null;
      setAiResults((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], [tool]: resultData },
      }));
    } catch {
    } finally {
      setAiLoading(false);
    }
  };

  const handlePlagiarismCheck = async (text) => {
    setPlagiarismModalOpen(false);
    setIsAIPanelOpen(true);
    setAiActiveTab("plagiarism");
    setAiLoading(true);
    try {
      const response = await PlagiarismCheck(text);
      const resultData = response?.data?.data || null;
      setAiResults((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], plagiarism: resultData },
      }));
    } catch {
    } finally {
      setAiLoading(false);
    }
  };

  const handleFactCheck = async (text) => {
    setFactModalOpen(false);
    setIsAIPanelOpen(true);
    setAiActiveTab("fact");
    setAiLoading(true);
    try {
      const response = await FactChecking(text);
      const resultData = response?.data?.data || null;
      setAiResults((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], fact: resultData },
      }));
    } catch {
    } finally {
      setAiLoading(false);
    }
  };

  // ── Save chapter ──────────────────────────────────────────
  const handleSaveChapter = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const chapter = chapters.find((c) => c.id === selectedId);
      await UpdateChapterApi({
        title: chapter?.title,
        book_id: bookId,
        chapter_id: selectedId,
        content: editorContent,
      });
      message.success("Chapter saved");
      fetchBookAndChapters();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  // ── Create chapter ────────────────────────────────────────
  const handleCreateChapter = async (payload) => {
    try {
      const res = await CreateChapterApi(payload);
      message.success(res?.data?.message || "Chapter created");
      setAddModalVisible(false);
      fetchBookAndChapters();
    } catch (error) {
    }
  };

  const currentAIData = aiResults[selectedId] || {};
  const onlyView = location.pathname.endsWith("/view");
const handleDelete = async (chapterId) => {
  try {
    const payload = { chapter_id: chapterId };

    console.log(payload, "payload");

    await DeleteChapterApi(payload);

    console.log("Chapter deleted successfully");

    // refresh list after delete
    fetchBookAndChapters();
  } catch (error) {
    console.error("Delete failed:", error);
  }
};
  // ── Render ────────────────────────────────────────────────
  return (
    <div className="chapter-manager">

      {/* ── Sidebar ── */}
      <aside className="chapter-sider">
        <div className="sider-header">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={15} />
            Dashboard
          </Link>
        </div>

        <div className="sider-section-label">Chapters</div>

        <div className="sider-list">
          {loading ? (
            <div className="sider-loading">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skel-item" />
              ))}
            </div>
          ) : (
           <ChapterList
  chapters={chapters}
  selectedId={selectedId}
  onSelect={setSelectedId}
  onAdd={() => setAddModalVisible(true)}
  onDelete={handleDelete}
/>
          )}
        </div>

        <div className="sider-footer">
          <button className="add-chapter-btn" onClick={() => setAddModalVisible(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add chapter
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="chapter-content-area">

        <BookHeader
          bookIdDetails={bookDetails}
          title={bookDetails?.title || "Untitled Book"}
          bookId={bookId}
          // onEditCover={() => setShowCoverPanel(true)}
          onEditCover={() => {
  if (bookDetails?.cover_img_name) {
    setShowCoverChoice(true);
  } else {
    setCoverMode("create");
    setShowCoverPanel(true);
  }
}}
          onSubmit={handleSubmitForEditing}
          onMarkComplete={handleMarkAsComplete}
          isCompleted={isCompleted}
          loading={submitLoading || completeLoading}

        />

        <Toolbar
          chapterTitle={chapters.find((c) => c.id === selectedId)}
          saving={saving}
          onSave={handleSaveChapter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onToggleAIPanel={() => {
            setIsAIPanelOpen(!isAIPanelOpen);
            setShowAIGuide(false);
          }}
          isAIPanelOpen={isAIPanelOpen}
          onRunAITool={handleRunAITool}
          activeTool={aiActiveTab}
          onOpenUploadModal={() => setUploadModalVisible(true)}
          onOpenAIGuide={() => {
            setIsAIPanelOpen(true);
            setShowAIGuide(true);
          }}
          onlyView={onlyView}

        />

        <div className="content-layout">

          {/* Editor */}
          <div className="editor-container">
            {chapters.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <BookOpen size={22} />
                </div>
                <p className="empty-state__title">No chapters yet</p>
                <p className="empty-state__desc">
                  Add your first chapter to start writing your book.
                </p>
                <button
                  className="add-chapter-btn"
                  onClick={() => setAddModalVisible(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ width: 14, height: 14 }}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add chapter
                </button>
              </div>
            ) : viewMode === "edit" ? (
              <ChapterEditor
                content={editorContent}
                setContent={setEditorContent}
                onlyView={onlyView}

              />
            ) : (
              <PdfViewer htmlContent={editorContent} />
            )}
          </div>

          {/* AI Panel */}
          {isAIPanelOpen && (
            <div className="report-section">
              {showAIGuide ? (
                <AIToolsGuide />
              ) : (
                <AIReportPanel
                  activeTab={aiActiveTab}
                  setActiveTab={setAiActiveTab}
                  data={currentAIData}
                  loading={aiLoading}
                />
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── Modals ── */}
      <AddChapterModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onCreate={handleCreateChapter}
        bookId={bookId}
      />

      <UploadChapterModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUploadSuccess={(text) => setEditorContent(text)}
      />

      <PlagiarismModal
        open={plagiarismModalOpen}
        onClose={() => setPlagiarismModalOpen(false)}
        chapterText={editorContent}
        onCheckPlagiarism={handlePlagiarismCheck}
      />

      <FactCheckModal
        open={factModalOpen}
        onClose={() => setFactModalOpen(false)}
        chapterText={editorContent}
        onCheckFact={handleFactCheck}
      />

      {/* Stripe payment modal */}
      <Modal
        open={paymentOpen}
        footer={null}
        destroyOnClose
        onCancel={() => setPaymentOpen(false)}
        title="Complete payment"
      >
        <StripePayment
          amount={40}
          payment_for="book_submission"
          book_submission_id={booksubmiition}
          onPaymentSuccess={() => setPaymentOpen(false)}
          onCloseModal={() => setPaymentOpen(false)}
        />
      </Modal>

      {/* Purchase / upgrade modal */}
      <Modal
        open={showPurchaseModal}
        onCancel={() => setShowPurchaseModal(false)}
        footer={null}
        centered
        width={420}
      >
        <div className="upgrade-modal-body">
          <div className="upgrade-modal-body__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Upgrade required</h2>
          <p>Purchase a package to submit your book for professional editing.</p>
          <button
            className="upgrade-modal-btn"
            onClick={() => {
              setShowPurchaseModal(false);
              navigate("/dashboard/publish-payment", {
                state: { from: location.pathname },
              });
            }}
          >
            Purchase package
          </button>
        </div>
      </Modal>

    {/* Cover Choice Modal */}
{showCoverChoice && (
  <div
    className="cover-modal-overlay"
    onClick={() => setShowCoverChoice(false)}
  >
    <div
      className="cover-choice-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Select Cover Option</h3>

      <div className="cover-choice-actions">
        <button
          className="bh-btn bh-btn--primary"
          onClick={() => {
            setCoverMode("create");
            setShowCoverChoice(false);
            setShowCoverPanel(true);
          }}
        >
          Create New Cover
        </button>

        <button
          className="bh-btn bh-btn--ghost-blue"
          onClick={() => {
            setCoverMode("edit");
            setShowCoverChoice(false);
            setShowCoverPanel(true);
          }}
        >
          Edit Existing Cover
        </button>
      </div>
    </div>
  </div>
)}


{/* Book cover panel */}
{showCoverPanel && (
  <div
    className="cover-modal-overlay"
    onClick={() => {
      setShowCoverPanel(false);
      setCoverMode(null); // ✅ reset when closing
    }}
  >
    <div
      className="cover-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <BookCoverPanel
        mode={coverMode} // ✅ important
        bookdetails={bookDetails}
        onClose={() => {
          setShowCoverPanel(false);
          setCoverMode(null); // ✅ reset here also
        }}
        onUpdateBook={fetchBookAndChapters}
      />
    </div>
  </div>
)}

    </div>
  );
}