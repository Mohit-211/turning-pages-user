import React, { useEffect, useState } from "react";
import { Layout, Spin, message } from "antd";
import { useParams } from "react-router-dom";

import BackToDashboard from "../../component/BackToDashboard/BackToDashboard";
import "./ChapterManager.scss";

import ChapterEditor from "./chapterComponent/chapterEditor";
import PaginatedPreview from "./chapterComponent/PaginatedPreview";
import ChapterList from "./chapterComponent/chapterList";
import Toolbar from "./chapterComponent/toolbar";
import AIAssistantDrawer from "./chapterComponent/aIAssistantDrawer";
import AddChapterModal from "./chapterComponent/addChapterModal";
import UploadChapterModal from "./chapterComponent/uploadChapterModal";
import ChapterHeader from "./chapterComponent/ChapterHeader";

import BookHeader from "../Book/BookHeader/BookHeader";
import BookCoverPanel from "../../Page/Book/BookHeader/BookCoverPanel";

import { GetBookByIdApi } from "../../api/operations/book.api";
import {
  CreateChapterApi,
  UpdateChapterApi,
  DeleteChapterApi,
} from "../../api/operations/chapter.api";

const { Sider, Content } = Layout;

export default function ChapterManager() {
  /* ========================
     STATE
  ======================== */
  const [bookdetails, setBookDetails] = useState({});
  const [showCoverPanel, setShowCoverPanel] = useState(false);
  const [viewMode, setViewMode] = useState("edit");
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editorContent, setEditorContent] = useState("");

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const [saving, setSaving] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [instruction, setInstruction] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [bookName, setBookName] = useState("");

  const token = localStorage.getItem("book_publish_token");
  const { bookId } = useParams();
  const userHasPermission = false;

  /* ========================
     FETCH BOOK + CHAPTERS
  ======================== */
  useEffect(() => {
    fetchChapters();
  }, []);

  async function fetchChapters() {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      const data = res?.data?.data;
      setBookDetails(data || {});
      setBookName(data?.title || "");
      setChapters(data?.book_chapters || []);
    } catch {
      message.error("Failed to fetch chapters");
    } finally {
      setLoading(false);
    }
  }

  /* ========================
     EDIT BOOK COVER HANDLER
  ======================== */
  const handleEditBookCover = () => {
    setSelectedId(null);
    setEditorContent("");
    setViewMode("edit");
    setDrawerVisible(false);
    setUploadModalVisible(false);
    setShowCoverPanel(true);
  };

  /* ========================
     CHAPTER SELECT
  ======================== */
  const handleChapterSelect = (id) => {
    setShowCoverPanel(false);
    setSelectedId(id);
  };

  /* ========================
     LOAD SELECTED CHAPTER
  ======================== */
  useEffect(() => {
    if (!selectedId) return;
    const selected = chapters.find((c) => c.id === selectedId);
    setEditorContent(selected?.content || "");
  }, [selectedId, chapters]);

  /* ========================
     DELETE CHAPTER
  ======================== */
  async function handleChapterDelete(chapterId) {
    try {
      await DeleteChapterApi({ chapter_id: chapterId });
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      if (selectedId === chapterId) setSelectedId(null);
    } catch {
      message.error("Failed to delete chapter");
    }
  }

  /* ========================
     SAVE CHAPTER
  ======================== */
  async function saveChapterContent() {
    if (!selectedId) return message.warning("Select a chapter first");
    setSaving(true);
    try {
      const selected = chapters.find((c) => c.id === selectedId);
      await UpdateChapterApi({
        title: selected?.title,
        book_id: bookId,
        chapter_id: selectedId,
        content: editorContent,
      });
      message.success("Chapter saved");
      fetchChapters();
    } catch {
      message.error("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  }

  /* ========================
     CREATE CHAPTER
  ======================== */
  async function createChapter(title) {
    setCreateLoading(true);
    try {
      await CreateChapterApi({ title, book_id: bookId });
      fetchChapters();
      setModalVisible(false);
    } catch {
      message.error("Failed to create chapter");
    } finally {
      setCreateLoading(false);
    }
  }

  /* ========================
     AI GENERATION
  ======================== */
  const handleGenerateWithAI = async () => {
    if (!selectedId) return message.warning("Select a chapter first");
    if (!instruction.trim()) return message.warning("Enter instruction");

    setAiLoading(true);
    setStreamedText("");

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
            mode: "generate",
            context: editorContent,
          }),
        }
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamedText((prev) => prev + chunk);
      }
    } catch {
      message.error("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  /* ========================
     RENDER
  ======================== */
  console.log(chapters,"===>>")
  return (
    <Layout className="chapter-manager">
      {/* LEFT SIDEBAR */}
      <Sider width={280} className="chapter-sider">
        <BackToDashboard />
        {loading ? (
          <Spin />
        ) : (
          <ChapterList
            chapters={chapters}
            selectedId={selectedId}
            onSelect={handleChapterSelect}
            onAdd={() => setModalVisible(true)}
            onDelete={handleChapterDelete}
          />
        )}
      </Sider>

      {/* RIGHT CONTENT */}
      <Layout className="chapter-content-area">
        <BookHeader
          title={bookName}
          bookId={bookId}
          onEditCover={handleEditBookCover}
        />

        <Toolbar
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onOpenAIAssistant={() => {
            if (!selectedId) return message.warning("Select a chapter first");
            setDrawerVisible(true);
          }}
          onOpenUploadModal={() => {
            if (!selectedId) return message.warning("Select a chapter first");
            setUploadModalVisible(true);
          }}
        />

        <Content className="editor-container">
          {showCoverPanel ? (
            <BookCoverPanel
              // bookId={bookId}
              defaultTitle={bookName}
              onClose={() => setShowCoverPanel(false)}
              bookdetails={bookdetails}
            />
          ) : selectedId ? (
            <>
              <ChapterHeader
                chapter={chapters.find((c) => c.id === selectedId)}
                previewClick={() => setViewMode("preview")}
                editClick={() => setViewMode("edit")}
              />

              {viewMode === "edit" ? (
                <ChapterEditor
                  chapter={chapters.find((c) => c.id === selectedId)}
                  content={editorContent}
                  setContent={setEditorContent}
                  onSave={saveChapterContent}
                  saving={saving}
                  readOnly={!userHasPermission}
                />
              ) : (
                <PaginatedPreview html={editorContent} />
              )}
            </>
          ) : (
            <div className="spin-wrapper">
              <p>Select a chapter or edit book cover</p>
            </div>
          )}
        </Content>
      </Layout>

      {/* DRAWERS / MODALS */}
      <AIAssistantDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        instruction={instruction}
        setInstruction={setInstruction}
        aiLoading={aiLoading}
        onGenerate={handleGenerateWithAI}
        streamedText={streamedText}
        setStreamedText={setStreamedText}
      />

      <AddChapterModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={createChapter}
        loading={createLoading}
      />

      <UploadChapterModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUploadSuccess={(text) => setEditorContent(text)}
      />
    </Layout>
  );
}
