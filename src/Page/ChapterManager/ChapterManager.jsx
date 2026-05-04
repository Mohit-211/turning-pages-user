import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";
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
import { toast } from "react-toastify";

import ChapterEditor from "./chapterComponent/chapterEditor";
import PdfViewer from "./PdfViewer/PdfViewer";
import StripePayment from "../../component/StripePayment/StripePayment";
import AIToolsGuide from "./chapterComponent/AIToolsGuide";
import BookCoverPanel from "../Book/BookHeader/BookCoverPanel";

import Toolbar from "./chapterComponent/ToolBar/toolbar";
import InputModePanel from "./InputModePanel";

export default function ChapterManager() {
  const [hasPackage, setHasPackage] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { bookId } = useParams();

  // ── UI state ──────────────────────────────────────────────
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [coverMode, setCoverMode] = useState(null);
  const [showCoverPanel, setShowCoverPanel] = useState(false);
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

  // ── TAV AI panel ──────────────────────────────────────────
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [plagiarismModalOpen, setPlagiarismModalOpen] = useState(false);
  const [factModalOpen, setFactModalOpen] = useState(false);

  // ── Input mode panel: "write" | "upload" | "ai" | null ───
  const [activeModePanel, setActiveModePanel] = useState(null);

  // ── Submission ────────────────────────────────────────────
  const [booksubmiition, setBookSubmitton] = useState();

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

  // ── Panel toggle helpers ──────────────────────────────────
  const handleToggleAIPanel = () => {
    const opening = !isAIPanelOpen;
    setIsAIPanelOpen(opening);
    setShowAIGuide(false);
    if (opening) setActiveModePanel(null);
  };

  const handleModePanel = (mode) => {
    const next = activeModePanel === mode ? null : mode;
    setActiveModePanel(next);
    if (next === "ai") {
      setIsAIPanelOpen(false);
      setShowAIGuide(false);
    }
  };

  // ── Submission helpers ────────────────────────────────────
  const createBookSubmission = async (event_name) => {
    try {
      const res = await GetBooksBySubmittion({ book_id: bookId, event_name });
      const submissionId = res?.data?.data?.id;
      const messageText = res?.data?.message;

      if (!submissionId) throw new Error("Submission failed");

      if (res?.data?.status === 200) {
        message.success(messageText || "Action successful");
        if (event_name === "submit") {
          setTimeout(() => navigate("/dashboard/submissions"), 1000);
        }
      }
      return submissionId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSubmitForEditing = async () => {
    try {
      setSubmitLoading(true);
      await createBookSubmission("submit");
      toast.success("Book submitted for editing");
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || error?.message || "";
      if (errorMessage === "Please purchase a package to submit a book") {
        setShowPurchaseModal(true);
      } else {
        toast.error(errorMessage || "Submit failed");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      setCompleteLoading(true);
      await createBookSubmission("completed");
      toast.success("Book marked as complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark complete");
    } finally {
      setCompleteLoading(false);
    }
  };

  // ── AI tools ──────────────────────────────────────────────
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleRunAITool = async (tool) => {
    if (aiLoading) {
      message.info("TAV analysis is already running, please wait...");
      return;
    }
    if (!selectedId) {
      message.warning("Select a chapter first");
      return;
    }

    try {
      let response;
      const openPanel = () => {
        setIsAIPanelOpen(true);
        setActiveModePanel(null);
        setAiActiveTab(tool);
        setAiLoading(true);
      };

      switch (tool) {
        case "plagiarism":
          setPlagiarismModalOpen(true);
          return;
        case "fact":
          setFactModalOpen(true);
          return;
        case "consistency":
          openPanel();
          await delay(400);
          response = await ConsistencyCheck(Number(bookId), { timeout: 300000 });
          break;
        case "summary":
          openPanel();
          await delay(400);
          response = await GenerateSummary(Number(bookId), selectedId, { timeout: 300000 });
          break;
        default:
          return;
      }

      const resultData = response?.data?.data || null;
      if (!resultData) {
        message.warning("No data received from AI");
        return;
      }

      setAiResults((prev) => ({
        ...prev,
        [selectedId]: { ...(prev[selectedId] || {}), [tool]: resultData },
      }));

      message.success("TAV analysis completed ✅");
    } catch (error) {
      console.error("TAV Tool Error:", error);
      if (error.code === "ECONNABORTED") {
        message.error("Request taking too long. Please try again.");
      } else if (error.response) {
        message.error(error.response?.data?.message || "Server error");
      } else {
        message.error("Network issue. Check your connection.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handlePlagiarismCheck = async (text) => {
    setPlagiarismModalOpen(false);
    setIsAIPanelOpen(true);
    setActiveModePanel(null);
    setAiActiveTab("plagiarism");
    setAiLoading(true);

    try {
      const response = await PlagiarismCheck(text);
      const resultData = response?.data?.data || null;
      setAiResults((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], plagiarism: resultData },
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleFactCheck = async (text) => {
    setFactModalOpen(false);
    setIsAIPanelOpen(true);
    setActiveModePanel(null);
    setAiActiveTab("fact");
    setAiLoading(true);

    try {
      const response = await FactChecking(text);
      const resultData = response?.data?.data || null;
      setAiResults((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], fact: resultData },
      }));
    } catch (error) {
      console.error(error);
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
      message.success("Chapter saved successfully");
      fetchBookAndChapters();
    } catch (error) {
      console.error(error);
      message.error("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  };

  // ── Create & Delete Chapter ───────────────────────────────
  const handleCreateChapter = async (payload) => {
    try {
      const res = await CreateChapterApi(payload);
      message.success(res?.data?.message || "Chapter created");
      setAddModalVisible(false);
      fetchBookAndChapters();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (chapterId) => {
    try {
      await DeleteChapterApi({ chapter_id: chapterId });
      message.success("Chapter deleted");
      fetchBookAndChapters();
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Failed to delete chapter");
    }
  };

  const currentAIData = aiResults[selectedId] || {};
  const onlyView = location.pathname.endsWith("/view");

  return (
    <div className="chapter-manager">
      {/* Sidebar */}
      <aside className="chapter-sider">
        <div className="sider-header">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="sider-section-label">Chapters</div>

        <div className="sider-list">
          {loading ? (
            <div className="sider-loading">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skel-item" style={{ animationDelay: `${i * 80}ms` }} />
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
      </aside>

      {/* Main Content */}
      <main className="chapter-content-area">
        <div className="content-top">
          <BookHeader
            bookIdDetails={bookDetails}
            title={bookDetails?.title || "Untitled Book"}
            bookId={bookId}
            onEditCover={() => setShowCoverPanel(true)}
            bookcover={bookDetails?.cover_img_name || null}
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
            onToggleAIPanel={handleToggleAIPanel}
            isAIPanelOpen={isAIPanelOpen}
            onRunAITool={handleRunAITool}
            activeTool={aiActiveTab}
            onOpenAIGuide={() => {
              setIsAIPanelOpen(true);
              setActiveModePanel(null);
              setShowAIGuide(true);
            }}
            onlyView={onlyView}
            activeMode={activeModePanel}
            onWriteManually={() => handleModePanel("write")}
            onOpenUploadModal={() => handleModePanel("upload")}
            onOpenAIAssistant={() => handleModePanel("ai")}
          />
        </div>

        <div className="content-layout">
          {/* Editor Area */}
          {activeModePanel !== "upload" && (
            <div className="editor-container">
              {chapters.length === 0 && !loading ? (
                <div className="empty-state">
                  <div className="empty-state__icon">
                    <BookOpen size={28} />
                  </div>
                  <p className="empty-state__title">No chapters yet</p>
                  <p className="empty-state__desc">
                    Add your first chapter to start writing your book.
                  </p>
                  <button
                    className="empty-state__cta"
                    onClick={() => setAddModalVisible(true)}
                  >
                    <Plus size={14} />
                    Add first chapter
                  </button>
                </div>
              ) : viewMode === "edit" ? (
                <ChapterEditor
                  chapter={chapters.find((c) => c.id === selectedId)}
                  content={editorContent}
                  setContent={setEditorContent}
                  onlyView={onlyView}
                />
              ) : (
                <PdfViewer htmlContent={editorContent} />
              )}
            </div>
          )}

          {/* Upload Mode Panel */}
          {activeModePanel === "upload" && (
            <div className="editor-container">
              <InputModePanel
                activeMode="upload"
                onClose={() => setActiveModePanel(null)}
                onSwitchToManual={() => setActiveModePanel(null)}
                selectedId={selectedId}
                onInsertContent={setEditorContent}
                onReplaceContent={setEditorContent}
                editorContent={editorContent}
              />
            </div>
          )}

          {/* AI Assistant Mode Panel */}
          {activeModePanel === "ai" && (
            <InputModePanel
              activeMode="ai"
              onClose={() => setActiveModePanel(null)}
              onSwitchToManual={() => setActiveModePanel(null)}
              selectedId={selectedId}
              onInsertContent={setEditorContent}
              onReplaceContent={setEditorContent}
              editorContent={editorContent}
            />
          )}

          {/* TAV AI Report Panel */}
          {isAIPanelOpen && !activeModePanel && (
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

      {/* Modals */}
      <AddChapterModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onCreate={handleCreateChapter}
        bookId={bookId}
      />

      <UploadChapterModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUploadSuccess={(text) => {
          if (!text) return;
          const html = `<p>${text.replace(/\n/g, "</p><p>")}</p>`;
          setEditorContent(html);
        }}
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

      {/* Payment & Upgrade Modals */}
      <Modal open={paymentOpen} footer={null} onCancel={() => setPaymentOpen(false)} title="Complete payment">
        <StripePayment
          amount={40}
          payment_for="book_submission"
          book_submission_id={booksubmiition}
          onPaymentSuccess={() => setPaymentOpen(false)}
          onCloseModal={() => setPaymentOpen(false)}
        />
      </Modal>

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

      {/* Book Cover Panel */}
      {showCoverPanel && (
        <div className="cover-modal-overlay" onClick={() => setShowCoverPanel(false)}>
          <div className="cover-modal" onClick={(e) => e.stopPropagation()}>
            <BookCoverPanel
              mode={coverMode}
              bookdetails={bookDetails}
              onClose={() => setShowCoverPanel(false)}
              onUpdateBook={fetchBookAndChapters}
            />
          </div>
        </div>
      )}
    </div>
  );
}