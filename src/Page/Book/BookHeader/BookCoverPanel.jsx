import React, { useEffect, useState } from "react";
import { Input, Button, Select, Spin, message } from "antd";
import {
  GenerateBookCoverApi,
  GetBookByIdApi,
  UpdateBookCoverApi,
} from "../../../api/operations/book.api";
import { GetAllGenreApi } from "../../../api/operations/genre.api";
import "./BookCoverPanel.scss";

const { Option } = Select;

export default function BookCoverPanel({ bookdetails, onClose,onUpdateBook  }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [coverFileName, setCoverFileName] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [genres, setGenres] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [form, setForm] = useState({
    title: "",
    genre: "",
    author: "",
    description: "",
  });

  /* ── Load initial book data ── */
  useEffect(() => {
    if (!bookdetails) return;

    setForm({
      title: bookdetails?.title || "",
      genre: bookdetails?.genre_id || "",
      author: bookdetails?.author || "",
      description: bookdetails?.description || "",
    });
console.log(bookdetails,"bookdetails")
    if (bookdetails?.cover_img_name) {
      setCoverFileName(bookdetails.cover_img_name);
      setCoverImage(
        `${import.meta.env.VITE_BOOK_IMAGE_URL}${bookdetails.cover_img_name}`
      );
      setHasGenerated(true);
    }
  }, [bookdetails]);

  /* ── Load genres ── */
  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch(() => message.error("Failed to load genres"));
  }, []);

  /* ── Generate cover ── */
  const generateCover = async () => {
    if (!form.title || !form.genre || !form.author) {
      return message.warning("Title, genre, and author are required");
    }

    try {
      setLoading(true);
      setSaved(false);

      const res = await GenerateBookCoverApi({
        title: form.title,
        genre: form.genre,
        author: form.author,
        size: "1024x1536",
        direction: "vertical",
      });

      const fileName = res?.data?.fileName;

      if (fileName) {
        setCoverFileName(fileName);
        setCoverImage(`${import.meta.env.VITE_BOOK_IMAGE_URL}${fileName}`);
        setHasGenerated(true);
      }

      message.success(hasGenerated ? "Cover regenerated" : "Cover generated");
    } catch {
      message.error("Cover generation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── Save cover ── */
const saveCover = async () => {
  if (!coverFileName) return message.warning("No cover to save");

  try {
    setSaving(true);

    const formData = new FormData();
    formData.append("book_id", bookdetails.id);
    formData.append("cover_img_name", coverFileName);
    formData.append("author", form.author);

    await UpdateBookCoverApi(formData);

    // ✅ Call GetBookByIdApi after update
    const res = await GetBookByIdApi(bookdetails.id);

    if (res?.data) {
      // update parent or local state
      // Example:
      // setBookDetails(res.data);
      // OR call parent callback if exists
      onUpdateBook && onUpdateBook(res.data);
    }

    setSaved(true);
    message.success("Cover saved successfully");
  } catch (error) {
    console.error(error);
    message.error("Failed to save cover");
  } finally {
    setSaving(false);
  }
};

  const viewFullImage = () => {
    if (coverImage) window.open(coverImage, "_blank");
  };

  /* ── Render ── */
  return (
    <div className="book-cover-panel">

      {/* ── LEFT: Form ── */}
      <div className="cover-form">
        <div className="form-header">
          <h2 className="panel-title">Generate cover</h2>
          <p className="panel-sub">Fill in the details to create your book cover</p>
        </div>

        <div className="field-group">
          <label>Title</label>
          <Input
            placeholder="e.g. The Forgotten Garden"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label>Genre</label>
          <Select
            placeholder="Select genre…"
            value={form.genre || undefined}
            style={{ width: "100%" }}
            onChange={(value) => setForm({ ...form, genre: value })}
          >
            {genres.map((g) => (
              <Option key={g.id} value={g.id}>
                {g.title}
              </Option>
            ))}
          </Select>
        </div>

        <div className="field-group">
          <label>Author</label>
          <Input
            placeholder="e.g. Jane Doe"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label>
            Description{" "}
            <span className="optional-tag">optional</span>
          </label>
          <Input.TextArea
            placeholder="Brief synopsis or mood…"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <Button
          type="primary"
          block
          loading={loading}
          onClick={generateCover}
          className="btn-generate"
        >
          {hasGenerated ? "Re-generate cover" : "Generate cover"}
        </Button>

        <Button block onClick={onClose} className="btn-close">
          Close
        </Button>
      </div>

      {/* ── RIGHT: Preview ── */}
      <div className="cover-preview">

        {/* Loading */}
        {loading && (
          <div className="preview-loading">
            <Spin size="large" />
            <p>Generating your cover…</p>
          </div>
        )}

        {/* Cover image */}
        {!loading && coverImage && (
          <div className="image-wrapper">
            <img src={coverImage} alt="Book Cover" className="cover-image" />

            {saved && <span className="saved-badge">Saved</span>}

            <div className="cover-overlay">
              <Button
                className="overlay-btn primary"
                onClick={saveCover}
                loading={saving}
              >
                Save cover
              </Button>
              <Button className="overlay-btn" onClick={viewFullImage}>
                View full size
              </Button>
              <Button
                className="overlay-btn"
                loading={loading}
                onClick={generateCover}
              >
                Re-generate
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !coverImage && (
          <div className="preview-empty">
            <div className="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <p className="empty-title">Cover preview</p>
            <p className="empty-hint">Fill in the details and click generate</p>
          </div>
        )}
      </div>
    </div>
  );
}