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
} from "antd";
import {
    PlusOutlined,
    SaveOutlined,
    UploadOutlined,
    RobotOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./ChapterManager.scss";
import { useLocation } from "react-router-dom";
import {
    CreateChapterApi,
    UpdateChapterApi,
    DeleteChapterApi,
} from "../../api/operations/chapter.api";
import { GetBookByIdApi } from "../../api/operations/book.api";

const { Sider, Content } = Layout;

export default function ChapterManager() {
    const location = useLocation();
    const bookId = location?.state?.bookId;

    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [editorLoading, setEditorLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [manualLoading, setManualLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const saveTimer = useRef(null);

    useEffect(() => {
        if (bookId) fetchChapters();
    }, [bookId]);

    useEffect(() => {
        if (selectedId) loadChapterContent(selectedId);
    }, [selectedId]);

    // ✅ Fetch chapters from API
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

    // ✅ Load chapter content dynamically
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

    // ✅ Open Add Chapter Modal
    function openAddModal() {
        setNewTitle("");
        setIsModalOpen(true);
    }

    // ✅ Create a new chapter
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

    // ✅ Delete chapter
    async function handleDeleteChapter(id) {
        if (!id) return;
        setLoading(true);
        try {
            const response = await DeleteChapterApi({ chapter_id: id });
            message.success(response?.data?.message)
            fetchChapters()

        } catch (error) {
            message.error("Failed to delete chapter");
        } finally {
            setLoading(false);
        }
    }

    // ✅ Schedule Auto Save
    function scheduleAutoSave() {
        if (!selectedId) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveChapterContent(selectedId, editorContent, true);
        }, 1000);
    }

    // ✅ Save chapter content
    async function saveChapterContent(id, content, silent = false) {
        if (!id) return message.warning("No chapter selected");
        setSaving(true);
        try {
            const selectedChapter = chapters.find((ch) => ch.id === id);
            const payload = {
                title: selectedChapter?.title,
                book_id: bookId,
                chapter_id: id,
                content,
            };

            await UpdateChapterApi(payload);

            const wordCount = content
                .replace(/<[^>]+>/g, "")
                .split(/\s+/)
                .filter(Boolean).length;

            setChapters((prev) =>
                prev.map((ch) => (ch.id === id ? { ...ch, wordCount, content } : ch))
            );

            if (!silent) message.success("Chapter updated successfully");
        } catch (error) {
            console.error("Update failed:", error);
            message.error("Failed to update chapter");
        } finally {
            setSaving(false);
        }
    }

    // Dummy handlers
    const handleManualClick = async () => {
        setManualLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        setManualLoading(false);
        message.info("Manual writing mode activated");
    };

    const handleUploadClick = async () => {
        setUploadLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        setUploadLoading(false);
        message.info("Upload feature coming soon");
    };

    const handleAIClick = async () => {
        setAiLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        setAiLoading(false);
        message.info("AI Assistant launching soon!");
    };

    return (
        <Layout className="chapter-manager">
            {/* LEFT SIDE */}
            <Sider className="chapter-sider" width={280}>
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
                                        onConfirm={() => handleDeleteChapter(item.id)}
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
                    <Button
                        icon={<EditOutlined />}
                        loading={manualLoading}
                        onClick={handleManualClick}
                    >
                        Write Manually
                    </Button>
                    <Button
                        icon={<UploadOutlined />}
                        loading={uploadLoading}
                        onClick={handleUploadClick}
                    >
                        Upload
                    </Button>
                    <Button
                        icon={<RobotOutlined />}
                        loading={aiLoading}
                        onClick={handleAIClick}
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
                                <div>
                                    <h2>
                                        {chapters.find((c) => c.id === selectedId)?.title ||
                                            "Select a Chapter"}
                                    </h2>
                                </div>
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
                                    data={editorContent}
                                    onChange={(e, editor) => {
                                        setEditorContent(editor.getData());
                                        scheduleAutoSave();
                                    }}
                                    config={{ placeholder: "Write chapter content here..." }}
                                />
                            </div>
                        </>
                    )}
                </Content>
            </Layout>

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
                    onPressEnter={handleCreateChapter}
                />
            </Modal>
        </Layout>
    );
}
