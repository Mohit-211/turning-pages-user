import React, { useEffect, useState } from "react";
import { Layout, Spin, message } from "antd";
import BackToDashboard from "../../component/BackToDashboard/BackToDashboard";
import "./ChapterManager.scss";
import ChapterEditor from "./chapterComponent/chapterEditor";
import { GetBookByIdApi } from "../../api/operations/book.api";
import { CreateChapterApi, UpdateChapterApi } from "../../api/operations/chapter.api";
import ChapterList from "./chapterComponent/chpaterList";
import Toolbar from "./chapterComponent/toolbar";
import AIAssistantDrawer from "./chapterComponent/aIAssistantDrawer";
import AddChapterModal from "./chapterComponent/addChapterModal";
import UploadChapterModal from "./chapterComponent/uploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
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
  const bookId = 1;
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
      message.error("Failed to save chapter");
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
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.replace("data:", "").trim();
          try {
            const data = JSON.parse(jsonStr);
            if (data.token !== undefined) {
              fullText += data.token;
              setStreamedText((prev) => prev + data.token);
            }
          } catch {
            // ignore malformed chunks
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
      message.error("AI content generation failed");
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
          />
        )}
      </Sider>
      <Layout className="chapter-content-area">
        <BookHeader title={bookname}  bookId={bookId}/>
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