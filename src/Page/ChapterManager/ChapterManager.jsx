import React, { useEffect, useState } from "react";
import { Layout, Spin, message } from "antd";
import BackToDashboard from "../../component/BackToDashboard/BackToDashboard";
import "./ChapterManager.scss";
import ChapterEditor from "./chapterComponent/chapterEditor";
import { GetBookByIdApi } from "../../api/operations/book.api";
import { CreateChapterApi, DeleteChapterApi, UpdateChapterApi } from "../../api/operations/chapter.api";
import ChapterList from "./chapterComponent/chpaterList";
import Toolbar from "./chapterComponent/toolbar";
import AIAssistantDrawer from "./chapterComponent/aIAssistantDrawer";
import AddChapterModal from "./chapterComponent/addChapterModal";
import UploadChapterModal from "./chapterComponent/uploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
import { useParams } from "react-router-dom";
import config from "../../constants/config";
import { Chapter_ENDPOINTS } from "../../api/endpoints";
import { forceLogout } from "../../errors/ApiErrorHandler";
const { Sider, Content } = Layout;
export default function ChapterManager() {
  const token = localStorage.getItem("book_publish_token");
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
  const [bookname, setBookName] = useState()
  const { bookId } = useParams()
  // Fetch chapters
  useEffect(() => {
    fetchChapters();
  }, []);
  async function fetchChapters() {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      setBookName(res?.data?.data?.title)
      const chaps = res?.data?.data?.book_chapters || [];
      setChapters(chaps);
    } catch {
      message.error("Failed to fetch chapters");
    } finally {
      setLoading(false);
    }
  }
  // Load selected chapter
  useEffect(() => {
    if (!selectedId) return;
    const selected = chapters.find((c) => c.id === selectedId);
    setEditorContent(selected?.content || "");
  }, [selectedId, chapters]);
  // Save chapter
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
      message.success(`Chapter "${selected?.title}" saved successfully`);
      await fetchChapters();
    } catch {
      // Error toast comes from the API client; unsaved text stays in the editor.
    } finally {
      setSaving(false);
    }
  }
  // Create new chapter
  async function createChapter(title) {
    setCreateLoading(true);
    try {
      await CreateChapterApi({ title, book_id: bookId });
      await fetchChapters();
      setModalVisible(false);
      message.success("New chapter created successfully");
    } catch {
      message.error("Failed to create chapter");
    } finally {
      setCreateLoading(false);
    }
  }

  // Delete chapter
   async function handleChapterDelete(chapterId) {
  try {
    await DeleteChapterApi({ chapter_id: chapterId });

    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));

    // optional: reset selected chapter
    setSelectedId((prev) => (prev === chapterId ? null : prev));
  } catch {
    message.error("Failed to delete chapter");
  }}
  // Upload file content
  const handleUploadSuccess = (uploadedText) => {
    if (!selectedId) {
      message.warning("Please select a chapter first.");
      return;
    }
    setEditorContent(uploadedText);
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === selectedId ? { ...ch, content: uploadedText } : ch
      )
    );
    message.success("Uploaded file content added to selected chapter");
    setUploadModalVisible(false);
  };
  // ✅ AI Streaming Logic (ChatGPT-style)
  const handleGenerateWithAI = async () => {
    if (!selectedId) return message.warning("Select a chapter first");
    if (!instruction.trim())
      return message.warning("Enter an instruction for AI");
    setAiLoading(true);
    setStreamedText("");
    try {
      const response = await fetch(
        `${config.API_BASE_URL}${Chapter_ENDPOINTS.GenerateChapterContent}`,
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
      if (response.status === 401) return forceLogout();
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "AI content generation failed");
      }
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      // An SSE event can be split across network chunks, so keep the incomplete tail for the next read.
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace("data:", "").trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          let data;
          try {
            data = JSON.parse(jsonStr);
          } catch {
            continue; // ignore malformed events
          }
          if (data.type === "error") throw new Error(data.token);
          if (data.type === "final") {
            // The final event repeats the whole reply; use it instead of appending.
            fullText = data.token;
            setStreamedText(data.token);
          } else if (data.token !== undefined) {
            fullText += data.token;
            setStreamedText((prev) => prev + data.token);
          }
        }
      }
      // ✅ Show success only if text was generated
      if (fullText.trim().length > 0) {
        message.success("AI generation completed!");
      } else {
        message.warning("AI did not return any content.");
      }
    } catch (error) {
      console.error("AI stream error:", error);
      message.error(error.message || "AI content generation failed");
    } finally {
      setAiLoading(false);
    }
  };
  // ✅ Insert streamed text into editor
  const handleInsertToEditor = () => {
    if (!streamedText) return;
    setEditorContent((prev) => `${prev}\n${streamedText}`);
    setDrawerVisible(false);
    message.success("AI content inserted into editor");
  };
  const userHasPermission = false; // ❌ cannot edit
  // const userHasPermission = true; // ✔ can edit

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
        <BookHeader title={bookname} bookId={bookId} />
        <Toolbar
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
            <div className="editor-scroll-container">
              <ChapterEditor
                chapter={chapters.find((c) => c.id === selectedId)}
                content={editorContent}
                setContent={setEditorContent}
                onSave={saveChapterContent}
                saving={saving}
                readOnly={!userHasPermission}   // ⬅️ ADD THIS

              />
            </div>
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