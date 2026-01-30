import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import "./ChapterManager.scss";

import ChapterEditor from "./chapterComponent/ChapterEditor";
import PaginatedPreview from "./chapterComponent/PaginatedPreview";
import ChapterList from "./chapterComponent/ChapterList";
import Toolbar from "./chapterComponent/Toolbar";
import AIAssistantDrawer from "./chapterComponent/AIAssistantDrawer";
import AddChapterModal from "./chapterComponent/AddChapterModal";
import UploadChapterModal from "./chapterComponent/UploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
import BookCoverPanel from "../../Page/Book/BookHeader/BookCoverPanel";

import { GetBookByIdApi, GetBooksBySubmittion } from "../../api/operations/book.api";
import {
  CreateChapterApi,
  UpdateChapterApi,
  DeleteChapterApi,
} from "../../api/operations/chapter.api";
import TurnPreview from "./chapterComponent/PaginatedPreview";
import { message } from "antd";

export default function ChapterManager() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [bookDetails, setBookDetails] = useState({});
  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [viewMode, setViewMode] = useState("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCoverPanel, setShowCoverPanel] = useState(false);

  // Drawer & Modal states
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // AI states
  const [instruction, setInstruction] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const token = localStorage.getItem("book_publish_token");

  useEffect(() => {
    fetchBookAndChapters();
  }, [bookId]);

  const fetchBookAndChapters = async () => {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      const data = res?.data?.data || {};
      setBookDetails(data);
      setChapters(data.book_chapters || []);

      if (!selectedId && data.book_chapters?.length > 0) {
        setSelectedId(data.book_chapters[0].id);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to load book data");
    } finally {
      setLoading(false);
    }
  };

  // Load chapter content
  useEffect(() => {
    if (!selectedId) return;
    const chapter = chapters.find((c) => c.id === selectedId);
    setEditorContent(chapter?.content || "");
  }, [selectedId, chapters]);

  const handleChapterSelect = (id) => {
    setSelectedId(id);
    setShowCoverPanel(false);
  };

  const handleChapterDelete = async (chapterId) => {
    if (!window.confirm("Delete this chapter permanently?")) return;
    try {
      await DeleteChapterApi({ chapter_id: chapterId });
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      if (selectedId === chapterId) setSelectedId(null);
    } catch (err) {
      alert("Failed to delete chapter");
    }
  };

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

  const handleCreateChapter = async (title) => {
    try {
      await CreateChapterApi({ title, book_id: bookId });
      fetchBookAndChapters();
      setAddModalVisible(false);
    } catch (err) {
      alert("Failed to create chapter");
    }
  };

  const handleAIInsert = () => {
    if (!streamedText) return;
    setEditorContent((prev) => prev + "\n\n" + streamedText);
    setDrawerVisible(false);
    setStreamedText(""); // clear after insert
  };

  // ── AI Generation Handler ──
  const handleGenerateWithAI = async () => {
    if (!selectedId) return alert("Select a chapter first");
    if (!instruction.trim()) return alert("Enter an instruction");

    setAiLoading(true);
    setStreamedText(""); // reset output

    try {
      const response = await fetch(
        "https://api.turningpages.io:9090/api/v1/chapters/generate/chapter/content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            instruction,
            chapter_id: selectedId,
            context: editorContent || "",
          }),
        }
      );

      if (!response.ok) throw new Error("Request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace("data:", "").trim();
          try {
            const data = JSON.parse(jsonStr);
            if (data.token !== undefined) {
              fullText += data.token;
              setStreamedText((prev) => prev + data.token);
            }
          } catch {}
        }
      }

      if (fullText.trim()) {
        alert("AI generation completed!");
      } else {
        alert("AI returned no content");
      }
    } catch (err) {
      console.error("AI generation error:", err);
      alert("Failed to generate content");
    } finally {
      setAiLoading(false);
    }
  };
const handleSubmitBook = async (event_name) => {
  try {
    await GetBooksBySubmittion({
      book_id: bookId,
      event_name,
    });

    // ensure message renders
    message.success({
      content: "Saved successfully",
      duration: 2,
    });

    await new Promise((res) => setTimeout(res, 100));

    setLoading(true);

    await new Promise((res) => setTimeout(res, 2000));

    const response = await GetBookByIdApi(bookId);
    setBookDetails(response?.data?.data || response?.data || response);

  } catch (error) {
    console.error("Submit error:", error);
    message.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="chapter-manager">
      {/* Left Sidebar */}
      <aside className="chapter-sider">
        <div className="sider-header">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={18} /> Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-item" />
            ))}
          </div>
        ) : (
          <ChapterList
            chapters={chapters}
            selectedId={selectedId}
            onSelect={handleChapterSelect}
            onAdd={() => setAddModalVisible(true)}
            onDelete={handleChapterDelete}
          />
        )}
      </aside>

      {/* Main Content */}
      <main className="chapter-content-area">
        <BookHeader
          bookIdDetails={bookDetails}
          title={bookDetails.title || "Untitled Book"}
          bookId={bookId}
          onEditCover={() => setShowCoverPanel(true)}
           onSubmit={handleSubmitBook}
        />

        <Toolbar
          chapterTitle={chapters.find((c) => c.id === selectedId)}
          onSave={handleSaveChapter}
          saving={saving}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenAIAssistant={() => {
            if (!selectedId) return alert("Select a chapter first");
            setDrawerVisible(true);
          }}
          onOpenUploadModal={() => {
            if (!selectedId) return alert("Select a chapter first");
            setUploadModalVisible(true);
          }}
        />

        <div className="editor-container">
          {showCoverPanel ? (
            <BookCoverPanel
              bookdetails={bookDetails}
              onClose={() => setShowCoverPanel(false)}
            />
          ) : selectedId ? (
            viewMode === "edit" ? (
              <ChapterEditor
                chapter={chapters.find((c) => c.id === selectedId)}
                content={editorContent}
                setContent={setEditorContent}
                onSave={handleSaveChapter}
                saving={saving}
              />
            ) : (
             
              <TurnPreview html={editorContent} isOpen={true} onClose={() => {}}/>
            )
          ) : (
            <div className="empty-state">
              <p>Select a chapter to start editing</p>
              <button
                className="add-chapter-btn"
                onClick={() => setAddModalVisible(true)}
              >
                <Plus size={18} /> Add First Chapter
              </button>
            </div>
          )}
        </div>
      </main>

      {/* AI Drawer */}
      {/* <AIAssistantDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        instruction={instruction}
        setInstruction={setInstruction}
        aiLoading={aiLoading}
        onGenerate={handleGenerateWithAI}
        streamedText={streamedText}
        setStreamedText={setStreamedText}
        onInsertToEditor={() => {
          if (streamedText) {
            setEditorContent((prev) => prev + "\n\n" + streamedText);
            setStreamedText("");
            setDrawerVisible(false);
          }
        }}
      /> */}

      <AIAssistantDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        instruction={instruction}
        setInstruction={setInstruction}
        aiLoading={aiLoading}
        onGenerate={handleGenerateWithAI}
        streamedText={streamedText}
        setStreamedText={setStreamedText}
        onInsertToEditor={() => {
          if (streamedText) {
            setEditorContent((prev) => prev + "\n\n" + streamedText);
            setStreamedText("");
            setDrawerVisible(false);
          }
        }}
      />

      <AddChapterModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onCreate={handleCreateChapter}
      />

      <UploadChapterModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUploadSuccess={(text) => setEditorContent(text)}
      />
    </div>
  );
}
