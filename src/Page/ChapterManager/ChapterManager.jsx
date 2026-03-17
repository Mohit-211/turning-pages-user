import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ChapterManager.scss";

import ChapterList from "./chapterComponent/ChapterList";
import AddChapterModal from "./chapterComponent/AddChapterModal";
import UploadChapterModal from "./chapterComponent/UploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
import AIReportPanel from "./chapterComponent/AIReportPanel/AIReportPanel";
import PlagiarismModal from "./chapterComponent/PlagiarismModal/PlagiarismModal";
import FactCheckModal from "./chapterComponent/FactCheckModal/FactCheckModal";

import { GetBookByIdApi, GetBooksBySubmittion } from "../../api/operations/book.api";
import {
  CreateChapterApi,
  DeleteChapterApi,
  PlagiarismCheck,
  FactChecking,
  ConsistencyCheck,
  GenerateSummary,
  UpdateChapterApi,
} from "../../api/operations/chapter.api";

import { message, Modal } from "antd";
import Toolbar from "./chapterComponent/toolbar";
import ChapterEditor from "./chapterComponent/chapterEditor";
import PdfViewer from "./PdfViewer/PdfViewer";
import StripePayment from "../../component/StripePayment/StripePayment";

export default function ChapterManager() {

  const { bookId } = useParams();

  const [booksubmiition, setBookSubmitton] = useState();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [eventName, setEventName] = useState("");

  const [bookDetails, setBookDetails] = useState({});
  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [viewMode, setViewMode] = useState("edit");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [plagiarismModalOpen, setPlagiarismModalOpen] = useState(false);
  const [factModalOpen, setFactModalOpen] = useState(false);

  const [aiResults, setAiResults] = useState(() => {
    const stored = localStorage.getItem("aiResults");
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem("aiResults", JSON.stringify(aiResults));
  }, [aiResults]);

  useEffect(() => {
    fetchBookAndChapters();
  }, [bookId]);

  const fetchBookAndChapters = async () => {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      const data = res?.data?.data || {};

      setBookDetails(data);
      setChapters(data?.book_chapters || []);

      if (data?.book_chapters?.length > 0) {
        setSelectedId(data.book_chapters[0].id);
      }

    } catch {
      message.error("Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    const chapter = chapters.find((c) => c.id === selectedId);
    setEditorContent(chapter?.content || "");
  }, [selectedId, chapters]);

  /* ================= CREATE SUBMISSION (Reusable) ================= */

  const createBookSubmission = async (event_name) => {
    try {

      const res = await GetBooksBySubmittion({
        book_id: bookId,
        event_name: event_name,
      });

      const submissionId = res?.data?.data?.id;

      if (!submissionId) {
        message.error("Submission failed");
        return null;
      }

      return submissionId;

    } catch (error) {


      return null;
    }
  };

  /* ================= SUBMIT BOOK ================= */

  const handleSubmitForEditing = async (event_name) => {

    try {

      setSubmitLoading(true);

      const submissionId = await createBookSubmission(event_name);

      if (!submissionId) return;

      setBookSubmitton(submissionId);
      setEventName(event_name);

      setPaymentOpen(true);

    } finally {

      setSubmitLoading(false);

    }
  };

  // const submitBookAfterPayment = async () => {

  //   try {

  //     setSubmitLoading(true);

  //     await createBookSubmission(eventName);

  //     message.success("Book submitted successfully");

  //     fetchBookAndChapters();

  //   } finally {

  //     setSubmitLoading(false);

  //   }
  // };

  /* ================= AI TOOLS ================= */

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
        [selectedId]: {
          ...prev[selectedId],
          [tool]: resultData,
        },
      }));

    } catch {

      message.error("AI Tool failed");

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
        [selectedId]: {
          ...prev[selectedId],
          plagiarism: resultData,
        },
      }));

    } catch {

      message.error("Plagiarism check failed");

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
        [selectedId]: {
          ...prev[selectedId],
          fact: resultData,
        },
      }));

    } catch {

      message.error("Fact check failed");

    } finally {

      setAiLoading(false);

    }
  };

  const currentAIData = aiResults[selectedId] || {};

  /* ================= SAVE CHAPTER ================= */

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

    } catch {

      message.error("Failed to save chapter");

    } finally {

      setSaving(false);

    }
  };

  const handleCreateChapter = async (payload) => {

    try {

      const res = await CreateChapterApi(payload);

      message.success(res?.data?.message || "Chapter created successfully");

      setAddModalVisible(false);
      fetchBookAndChapters();

    } catch (error) {

      message.error(
        error?.response?.data?.message || "Failed to create chapter"
      );

    }
  };

  return (
    <div className="chapter-manager">

      <aside className="chapter-sider">

        <div className="sider-header">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={18} /> Dashboard
          </Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <ChapterList
            chapters={chapters}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => setAddModalVisible(true)}
            onDelete={DeleteChapterApi}
          />
        )}

      </aside>

      <main className="chapter-content-area">

        <BookHeader
          bookIdDetails={bookDetails}
          title={bookDetails?.title || "Untitled Book"}
          bookId={bookId}
          onSubmit={handleSubmitForEditing}
          loading={submitLoading}
        />

        <Toolbar
          chapterTitle={chapters.find((c) => c.id === selectedId)}
          saving={saving}
          onSave={handleSaveChapter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onToggleAIPanel={() => setIsAIPanelOpen(!isAIPanelOpen)}
          isAIPanelOpen={isAIPanelOpen}
          onRunAITool={handleRunAITool}
          activeTool={aiActiveTab}
          onOpenUploadModal={() => setUploadModalVisible(true)}
        />

        <div className="content-layout">

          <div className="editor-container">
            {viewMode === "edit" ? (
              <ChapterEditor
                content={editorContent}
                setContent={setEditorContent}
              />
            ) : (
              <PdfViewer htmlContent={editorContent} />
            )}
          </div>

          {isAIPanelOpen && (
            <div className="report-section">
              <AIReportPanel
                activeTab={aiActiveTab}
                setActiveTab={setAiActiveTab}
                data={currentAIData}
                loading={aiLoading}
              />
            </div>
          )}

        </div>

      </main>

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
          book_submission_id={booksubmiition}
          onPaymentSuccess={() => {
            setPaymentOpen(false);
            // submitBookAfterPayment();
          }}
          onCloseModal={() => setPaymentOpen(false)}
        />
      </Modal>

    </div>
  );
}