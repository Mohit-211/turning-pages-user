import React, { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import "./ChapterList.scss";
import { Popconfirm, Modal, Input, Button, message } from "antd";

import { UpdateChapterApi } from "../../../api/operations/chapter.api";

export default function ChapterList({
  chapters = [],
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}) {
  const [editModal, setEditModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(false);

  /* DELETE */
  const handleDelete = (chapterId) => {
    onDelete?.(chapterId);
  };

  /* OPEN EDIT MODAL */
  const handleOpenEdit = (chapter) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title || "");
    setEditModal(true);
  };

  /* UPDATE CHAPTER */
  const handleUpdateChapter = async () => {
    if (!chapterTitle.trim()) {
      message.error("Chapter title is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        book_id: chapters[0]?.book_id,
        chapter_id: editingChapter.id,
        title: chapterTitle,
      };

      const res = await UpdateChapterApi(payload);

      message.success(
        res?.data?.message || "Chapter updated successfully"
      );

      /* UPDATE LOCAL UI */
      editingChapter.title = chapterTitle;

      /* CLOSE MODAL */
      setEditModal(false);

      /* RELOAD PAGE */
      window.location.reload();

    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to update chapter"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chapter-list-wrapper">

        {/* HEADER */}
        <div className="sider-header">

          <h3>Chapters</h3>

          <button
            className="add-chapter-btn"
            onClick={onAdd}
            title="Add new chapter"
            aria-label="Add new chapter"
            style={{ width: "fit-content" }}
          >
            <Plus size={18} />
          </button>

        </div>

        {/* EMPTY */}
        {chapters.length === 0 ? (
          <div className="empty-list">

            <p>No chapters yet</p>

            <button className="add-first-btn" onClick={onAdd}>
              <Plus size={16} />
              Create your first chapter
            </button>

          </div>
        ) : (

          /* CHAPTER LIST */
          <ul className="chapter-list">

            {chapters.map((chapter) => (
              <li
                key={chapter.id}
                className={`chapter-item ${
                  chapter.id === selectedId ? "active" : ""
                }`}
                onClick={() => onSelect(chapter.id)}
              >

                {/* INFO */}
                <div className="chapter-info">

                  <span
                    className="chapter-title"
                    title={chapter.title || "Untitled Chapter"}
                  >
                    {chapter.title || "Untitled Chapter"}
                  </span>

                  <span className="chapter-meta">
                    {chapter.word_count || 0} words
                  </span>

                </div>

                {/* ACTIONS */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >

                  {/* EDIT BUTTON */}
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(chapter);
                    }}
                    title="Edit chapter"
                    aria-label="Edit chapter"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* DELETE BUTTON */}
                  <Popconfirm
                    title="Delete this chapter permanently?"
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDelete(chapter.id)}
                  >
                    <button
                      className="delete-btn"
                      onClick={(e) => e.stopPropagation()}
                      title="Delete chapter"
                      aria-label="Delete chapter"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Popconfirm>

                </div>

              </li>
            ))}

          </ul>
        )}
      </div>

      {/* EDIT MODAL */}
      <Modal
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={null}
        centered
        width={450}
      >
        <div style={{ paddingTop: 10 }}>

          <h2
            style={{
              marginBottom: 8,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Update Chapter
          </h2>

          <p
            style={{
              marginBottom: 20,
              color: "#666",
            }}
          >
            Edit your chapter title
          </p>

          {/* INPUT */}
          <div style={{ marginBottom: 20 }}>

            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Chapter title
            </label>

            <Input
              placeholder="Enter chapter title"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              maxLength={100}
              onPressEnter={handleUpdateChapter}
            />

          </div>

          {/* BUTTON */}
          <Button
            type="primary"
            block
            loading={loading}
            onClick={handleUpdateChapter}
          >
            Update Chapter
          </Button>

        </div>
      </Modal>
    </>
  );
}