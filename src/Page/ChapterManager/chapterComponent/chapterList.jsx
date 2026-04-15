import React from "react";
import { Plus, Trash2 } from "lucide-react";
import "./ChapterList.scss";
import { Popconfirm } from "antd";
import { DeleteChapterApi } from "../../../api/operations/chapter.api";

export default function ChapterList({
  chapters = [],
  selectedId,
  onSelect,
  onAdd,
  onDelete
}) {
const handleDelete = (chapterId) => {
  onDelete?.(chapterId);
};

  return (
    <div className="chapter-list-wrapper">
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

      {chapters.length === 0 ? (
        <div className="empty-list">
          <p>No chapters yet</p>
          <button className="add-first-btn" onClick={onAdd}>
            <Plus size={16} /> Create your first chapter
          </button>
        </div>
      ) : (
        <ul className="chapter-list">
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className={`chapter-item ${
                chapter.id === selectedId ? "active" : ""
              }`}
              onClick={() => onSelect(chapter.id)}
            >
              <div className="chapter-info">
                <span className="chapter-title">
                  {chapter.title || "Untitled Chapter"}
                </span>

                <span className="chapter-meta">
                  {chapter.word_count || 0} words
                </span>
              </div>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}