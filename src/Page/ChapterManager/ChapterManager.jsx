import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ChapterManager.scss";

import ChapterList from "./chapterComponent/ChapterList";
import AddChapterModal from "./chapterComponent/AddChapterModal";
import UploadChapterModal from "./chapterComponent/UploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
import TurnPreview from "./chapterComponent/PaginatedPreview";
import AIReportPanel from "./chapterComponent/AIReportPanel/AIReportPanel";
import PlagiarismModal from "./chapterComponent/PlagiarismModal/PlagiarismModal";
import FactCheckModal from "./chapterComponent/FactCheckModal/FactCheckModal";

import { GetBookByIdApi } from "../../api/operations/book.api";
import {
  CreateChapterApi,
  DeleteChapterApi,
  PlagiarismCheck,
  FactChecking,
  ConsistencyCheck,
  GenerateSummary,
  UpdateChapterApi,
} from "../../api/operations/chapter.api";

import { message } from "antd";
import Toolbar from "./chapterComponent/toolbar";
import ChapterEditor from "./chapterComponent/chapterEditor";
import PdfViewer from "./PdfViewer/PdfViewer";

export default function ChapterManager() {
  const { bookId } = useParams();

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
    } catch (err) {
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

  // 🔥 MAIN AI TOOL HANDLER
  const handleRunAITool = async (tool) => {
    if (!selectedId) {
      message.warning("Select a chapter first");
      return;
    }

    try {
      let response;
      let resultData = null;

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

      resultData = response?.data?.data || null;

      setAiResults((prev) => ({
        ...prev,
        [selectedId]: {
          ...prev[selectedId],
          [tool]: resultData,
        },
      }));
    } catch (err) {
      message.error("AI Tool failed");
    } finally {
      setAiLoading(false);
    }
  };

  // 🔥 PLAGIARISM HANDLER
  const handlePlagiarismCheck = async (text) => {
    setPlagiarismModalOpen(false);
    setIsAIPanelOpen(true);
    setAiActiveTab("plagiarism");
    setAiLoading(true);

    try {
      const response = await PlagiarismCheck(text);
      console.log(response,"response")
      const resultData = response?.data?.data || null;

      setAiResults((prev) => ({
        ...prev,
        [selectedId]: {
          ...prev[selectedId],
          plagiarism: resultData,
        },
      }));
    } catch (err) {
      message.error("Plagiarism check failed");
    } finally {
      setAiLoading(false);
    }
  };

  // 🔥 FACT CHECK HANDLER
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
    } catch (err) {
      message.error("Fact check failed");
    } finally {
      setAiLoading(false);
    }
  };

  const currentAIData = aiResults[selectedId] || {};
  const handleSaveChapter = async () => {
    if (!selectedId) return alert("No chapter selected");
    setSaving(true);
    try {
      const chapter = chapters.find((c) => c.id === selectedId);
      await UpdateChapterApi({
        title: chapter?.title,
        book_id: bookId,
        chapter_id: selectedId,
        content: editorContent,
      });
      alert("Chapter saved successfully");
      fetchBookAndChapters();
    } catch (err) {
      alert("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  };
 const handleCreateChapter = async (payload) => {
  try {
    const res = await CreateChapterApi(payload);

    const backendMessage =
      res?.data?.message || "Chapter created successfully";

    message.success(backendMessage);   // ✅ show backend message

    setAddModalVisible(false);

    await fetchBookAndChapters();      // ✅ auto refresh list

  } catch (error) {
    message.error(
      error?.response?.data?.message || "Failed to create chapter"
    );
  }
};
console.log(chapters,"chapters")
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
    </div>
  );
}
