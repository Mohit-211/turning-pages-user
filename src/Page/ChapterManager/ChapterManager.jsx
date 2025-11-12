import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  List,
  Button,
  Modal,
  Input,
  Spin,
  Tooltip,
  message,
  Popconfirm,
  Drawer,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
  RobotOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./ChapterManager.scss";
import { useLocation } from "react-router-dom";
import {
  CreateChapterApi,
  UpdateChapterApi,
  DeleteChapterApi,
  GenerateChapterContentAPI,
} from "../../api/operations/chapter.api";
import { GetBookByIdApi } from "../../api/operations/book.api";
import BackToDashboard from "../../component/BackToDashboard/BackToDashboard";

const { Sider, Content } = Layout;

export default function ChapterManager() {
  const location = useLocation();
  const bookId = location?.state?.bookId || 1;

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const saveTimer = useRef(null);

  useEffect(() => {
    if (bookId) fetchChapters();
  }, [bookId]);

  useEffect(() => {
    if (selectedId) loadChapterContent(selectedId);
  }, [selectedId]);

  async function fetchChapters() {
    setLoading(true);
    try {
      const response = await GetBookByIdApi(bookId);
      const bookData = response?.data?.data;
      if (bookData?.book_chapters?.length) {
        setChapters(bookData.book_chapters);
        setSelectedId(bookData.book_chapters[0].id);
      } else {
        setChapters([]);
        message.info("No chapters found for this book.");
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      message.error("Failed to load chapters");
    } finally {
      setLoading(false);
    }
  }

  async function loadChapterContent(chapterId) {
    setEditorLoading(true);
    try {
      const chapter = chapters.find((c) => c.id === chapterId);
      setEditorContent(chapter?.content || "");
    } catch (error) {
      console.error("Error loading chapter content:", error);
      message.error("Failed to load content");
    } finally {
      setEditorLoading(false);
    }
  }

  function openAddModal() {
    setNewTitle("");
    setIsModalOpen(true);
  }

  async function handleCreateChapter() {
    const title = (newTitle || "").trim();
    if (!title) return message.warning("Enter a chapter title");

    setCreateLoading(true);
    try {
      const response = await CreateChapterApi({ title, book_id: bookId });
      const createdChapter = response.data;

      setChapters((prev) => [...prev, createdChapter]);
      setSelectedId(createdChapter.id || createdChapter._id);
      setIsModalOpen(false);
      message.success("New chapter added");
      fetchChapters();
    } catch (error) {
      console.error(error);
      message.error("Failed to create chapter");
    } finally {
      setCreateLoading(false);
    }
  }

  async function saveChapterContent(id, content) {
    if (!id) return message.warning("No chapter selected");
    setSaving(true);
    try {
      const selectedChapter = chapters.find((ch) => ch.id === id);
      const payload = {
        title: selectedChapter?.title,
        book_id: bookId,
        chapter_id: id,
        content: content,
      };
      await UpdateChapterApi(payload);
      message.success("Chapter updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      message.error("Failed to update chapter");
    } finally {
      setSaving(false);
    }
  }
  const [aiLoading, setAiLoading] = useState(false);
const [apiKey, setApiKey] = useState("");
const [instruction, setInstruction] = useState("");


async function handleGenerateWithAI() {
  const selectedChapter = chapters.find((c) => c.id === selectedId);
  if (!selectedChapter) return message.warning("Please select a chapter first");
  if (!instruction.trim()) return message.warning("Please enter an instruction");

  const payload = {
    chapter_id: selectedChapter.id,
    instruction: instruction.trim(),
    context: selectedChapter?.content || "",
  };

  try {
    setAiLoading(true);
    const response = await GenerateChapterContentAPI(payload);
    const generatedText = response?.data?.content || "";

    if (!generatedText) {
      message.warning("No content returned from AI.");
      return;
    }

    setEditorContent((prev) => `${prev}\n\n${generatedText}`);
    message.success("AI generated content added to editor.");
  } catch (error) {
    console.error("AI generation error:", error);
    message.error("Failed to generate content with AI.");
  } finally {
    setAiLoading(false);
  }
}

  return (
    <Layout className="chapter-manager">
      {/* LEFT SIDE */}
      <Sider className="chapter-sider" width={280}>
        <BackToDashboard />
        <div className="sider-header">
          <h3>Chapters</h3>
          <Tooltip title="Add new chapter">
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={openAddModal}
              loading={createLoading}
            />
          </Tooltip>
        </div>

        {loading ? (
          <div className="spin-wrapper">
            <Spin />
          </div>
        ) : (
          <List
            className="chapter-list"
            dataSource={chapters}
            renderItem={(item) => (
              <List.Item
                className={item.id === selectedId ? "active" : ""}
                onClick={() => setSelectedId(item.id)}
                actions={[
                  <Popconfirm
                    title="Delete this chapter?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => console.log("delete")}
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={`${item.wordCount || 0} words`}
                />
              </List.Item>
            )}
          />
        )}
      </Sider>

      {/* RIGHT SIDE */}
      <Layout className="chapter-content-area">
        <div className="top-toolbar">
          <Button icon={<EditOutlined />}>Write Manually</Button>
          <Button icon={<UploadOutlined />}>Upload</Button>
          <Button
            icon={<RobotOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            AI Assistant
          </Button>
        </div>

        <Content className="editor-container">
          {editorLoading ? (
            <div className="spin-wrapper">
              <Spin />
            </div>
          ) : (
            <>
              <div className="editor-header">
                <h2>
                  {chapters.find((c) => c.id === selectedId)?.title ||
                    "Select a Chapter"}
                </h2>
                <Button
                  type="default"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={() => saveChapterContent(selectedId, editorContent)}
                >
                  Save
                </Button>
              </div>

              <div className="editor-wrapper">
                <CKEditor
                  editor={ClassicEditor}
                  data={
                    chapters.find((c) => c.id === selectedId)?.content || ""
                  }
                  onChange={(e, editor) => setEditorContent(editor.getData())}
                />
              </div>
            </>
          )}
        </Content>
      </Layout>

      {/* RIGHT DRAWER */}
  <Drawer
  title="AI Assistant"
  placement="right"
  width={380}
  open={drawerVisible}
  onClose={() => setDrawerVisible(false)}
>
  <div className="assistant-panel">
    <h3>{chapters.find((c) => c.id === selectedId)?.title || "Select a Chapter"}</h3>

    <Input.TextArea
      rows={4}
      placeholder="Enter your instruction (e.g. Continue the story where Arin enters the forest...)"
      value={instruction}
      onChange={(e) => setInstruction(e.target.value)}
      style={{ marginTop: 12 }}
    />

    

    <Button
      type="primary"
      icon={<ThunderboltOutlined />}
      block
      loading={aiLoading}
      onClick={handleGenerateWithAI}
      style={{ marginTop: 12 }}
    >
      Generate with AI
    </Button>
  </div>
</Drawer>



      {/* ADD CHAPTER MODAL */}
      <Modal
        title="Add Chapter"
        open={isModalOpen}
        onOk={handleCreateChapter}
        onCancel={() => setIsModalOpen(false)}
        okText="Create"
        confirmLoading={createLoading}
      >
        <Input
          placeholder="Chapter title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      </Modal>
    </Layout>
  );
}
