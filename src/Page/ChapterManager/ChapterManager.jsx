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
import GrammarAssistant from "./chapterComponent/GrammarAssistant";
import BookHeader from "../Book/BookHeader/BookHeader";
import { GetBookByIdApi } from "../../api/operations/book.api";
import {
  CreateChapterApi,
  UpdateChapterApi,
} from "../../api/operations/chapter.api";
import ChapterHeader from "./chapterComponent/ChapterHeader";
const { Sider, Content } = Layout;
export default function ChapterManager() {
  // ========================
  // STATE
  // ========================
  const [viewMode, setViewMode] = useState("edit"); // edit | preview
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
  const userHasPermission = false; // toggle later via roles
  // ========================
  // FETCH CHAPTERS
  // ========================
  useEffect(() => {
    fetchChapters();
  }, []);
  async function fetchChapters() {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      const data = res?.data?.data;
      setBookName(data?.title || "");
      setChapters(data?.book_chapters || []);
    } catch {
      message.error("Failed to fetch chapters");
    } finally {
      setLoading(false);
    }
  }

    async function handleChapterDelete(chapterId) {
  try {
    await DeleteChapterApi({ chapter_id: chapterId });

    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));

    // optional: reset selected chapter
    setSelectedId((prev) => (prev === chapterId ? null : prev));
  } catch {
    message.error("Failed to delete chapter");
  }}
  // ========================
  // LOAD SELECTED CHAPTER
  // ========================
  useEffect(() => {
    if (!selectedId) return;
    const selected = chapters.find((c) => c.id === selectedId);
    setEditorContent(selected?.content || "");
  }, [selectedId, chapters]);
  // ========================
  // SAVE CHAPTER
  // ========================
  const handlePreviewClick = () => {
    console.log("Preview")
    setViewMode("preview");
  }
  const handleEditClick = () => {
    console.log("edit")
    setViewMode("edit");
  }
  async function saveChapterContent() {
    if (!selectedId) return message.warning("Please select a chapter first");
    setSaving(true);
    try {
      const selected = chapters.find((c) => c.id === selectedId);
      await UpdateChapterApi({
        title: selected?.title,
        book_id: bookId,
        chapter_id: selectedId,
        content: editorContent,
      });
      message.success(`Chapter "${selected?.title}" saved`);
      await fetchChapters();
    } catch {
      message.error("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  }
  // ========================
  // CREATE CHAPTER
  // ========================
  async function createChapter(title) {
    setCreateLoading(true);
    try {
      await CreateChapterApi({ title, book_id: bookId });
      await fetchChapters();
      setModalVisible(false);
      message.success("Chapter created");
    } catch {
      message.error("Failed to create chapter");
    } finally {
      setCreateLoading(false);
    }
  }
  // ========================
  // UPLOAD CONTENT
  // ========================
  const handleUploadSuccess = (uploadedText) => {
    if (!selectedId) {
      message.warning("Select a chapter first");
      return;
    }
    setEditorContent(uploadedText);
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === selectedId ? { ...ch, content: uploadedText } : ch
      )
    );
    setUploadModalVisible(false);
    message.success("Content uploaded");
  };
  // ========================
  // AI GENERATION / EDITING
  // ========================
  const handleGenerateWithAI = async () => {
    if (!selectedId) return message.warning("Select a chapter first");
    if (!instruction.trim()) return message.warning("Enter an instruction");
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
            mode: window.__TP_SELECTED_TEXT__ ? "edit" : "generate",
            context: window.__TP_SELECTED_TEXT__ || editorContent,
          }),
        }
      );
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = JSON.parse(line.replace("data:", "").trim());
          if (data.token) {
            fullText += data.token;
            setStreamedText((prev) => prev + data.token);
          }
        }
      }
      if (!fullText.trim()) {
        message.warning("AI returned no content");
      } else {
        message.success("AI response ready");
      }
    } catch {
      message.error("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };
  // ========================
  // APPLY AI SUGGESTION
  // ========================
  const handleInsertToEditor = () => {
    if (!streamedText) return;
    const selected = window.__TP_SELECTED_TEXT__;
    if (selected) {
      setEditorContent((prev) => prev.replace(selected, streamedText));
    } else {
      setEditorContent((prev) => `${prev}\n${streamedText}`);
    }
    window.__TP_SELECTED_TEXT__ = "";
    setDrawerVisible(false);
    message.success("AI suggestion applied");
  };
  // ========================
  // RENDER
  // ========================
  return (
    <Layout className="chapter-manager">
      <Sider width={280} className="chapter-sider">
        <BackToDashboard />
        {loading ? (
          <div className="spin-wrapper">
            <Spin />
          </div>
        ) : (
          <ChapterList
            chapters={chapters}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => setModalVisible(true)}
            onDelete={handleChapterDelete}
          />
        )}
      </Sider>
      <Layout className="chapter-content-area">
        <BookHeader title={bookName} bookId={bookId} />
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
          {selectedId ? (
            <>
            <ChapterHeader
              chapter={chapters.find((c) => c.id === selectedId)}
              previewClick={handlePreviewClick}
              editClick={handleEditClick}
            />
              <div className="editor-scroll-container">
                {viewMode === "edit" ? (
                  <>
                    <ChapterEditor
                      chapter={chapters.find((c) => c.id === selectedId)}
                      content={editorContent}
                      setContent={setEditorContent}
                      onSave={saveChapterContent}
                      saving={saving}
                      readOnly={!userHasPermission}
                      viewMode={viewMode}
                    />
                    {/* <GrammarAssistant
                    text={editorContent}
                    setText={setEditorContent}
                    token={token}
                  /> */}
                  </>
                ) : (
                  <PaginatedPreview html={editorContent} />
                )}
              </div>
            </>
          ) : (
            <div className="spin-wrapper">
              <p>Please select a chapter to start editing</p>
            </div>
          )}
        </Content>
      </Layout>
      <AIAssistantDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        instruction={instruction}
        setInstruction={setInstruction}
        aiLoading={aiLoading}
        onGenerate={handleGenerateWithAI}
        streamedText={streamedText}
        setStreamedText={setStreamedText}
        onInsertToEditor={handleInsertToEditor}
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
        onUploadSuccess={handleUploadSuccess}
      />
    </Layout>
  );
}