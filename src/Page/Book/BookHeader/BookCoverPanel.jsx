import React, { useEffect, useState } from "react";
import { Input, Button, Select, Spin, message, Modal } from "antd";
import {
  GenerateBookCoverApi,
  GetBookByIdApi,
  UpdateBookCoverApi,
  DeleteBookCoverApi,
} from "../../../api/operations/book.api";
import { GetAllGenreApi } from "../../../api/operations/genre.api";
import "./BookCoverPanel.scss";

const { Option } = Select;

export default function BookCoverPanel({ bookdetails, onClose, onUpdateBook, mode }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverFileName, setCoverFileName] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [genres, setGenres] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    genre: "",
    author: "",
    description: "",
  });

  useEffect(() => {
    if (!bookdetails) return;
    setForm({
      title: bookdetails?.title || "",
      genre: bookdetails?.genre_id || "",
      author: bookdetails?.author || "",
       description: bookdetails?.description || "",
    });
    if (bookdetails?.cover_img_name) {
      setCoverFileName(bookdetails.cover_img_name);
      setCoverImage(`${import.meta.env.VITE_BOOK_IMAGE_URL}${bookdetails.cover_img_name}`);
      setHasGenerated(true);
    }
  }, [bookdetails]);

  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch(() => {});
  }, []);

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
      message.error("Failed to generate cover");
    } finally {
      setLoading(false);
    }
  };

  const saveCover = async () => {
    if (!coverFileName) return message.warning("No cover to save");
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("book_id", bookdetails.id);
      formData.append("cover_img_name", coverFileName);
      formData.append("author", form.author);
      await UpdateBookCoverApi(formData);
      const res = await GetBookByIdApi(bookdetails.id);
      if (res?.data) onUpdateBook && onUpdateBook(res.data);
      setSaved(true);
      message.success("Cover saved successfully");
    } catch (error) {
      message.error("Failed to save cover");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!bookdetails?.id) return;
    try {
      setDeleting(true);
      await DeleteBookCoverApi(bookdetails.id);
      setCoverFileName(null);
      setCoverImage(null);
      setHasGenerated(false);
      setSaved(false);
      setDeleteConfirm(false);
      const res = await GetBookByIdApi(bookdetails.id);
      if (res?.data) onUpdateBook && onUpdateBook(res.data);
      message.success("Cover deleted successfully");
    } catch (error) {
      message.error("Failed to delete cover");
    } finally {
      setDeleting(false);
    }
  };

  const viewFullImage = () => {
    if (coverImage) window.open(coverImage, "_blank");
  };

  return (
    <div className="bcp-root">
      {/* ── LEFT PANEL ── */}
      <div className="bcp-form">
        <div className="bcp-form__header">
          <div className="bcp-form__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div>
            <h2 className="bcp-form__title">Cover Studio</h2>
            <p className="bcp-form__sub">AI-generated book cover</p>
          </div>
        </div>

        <div className="bcp-divider" />

        <div className="bcp-fields">
          <div className="bcp-field">
            <label className="bcp-label">
              Title
              <span className="bcp-required">*</span>
            </label>
            <Input
              className="bcp-input"
              placeholder="Enter book title…"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="bcp-field">
            <label className="bcp-label">
              Genre
              <span className="bcp-required">*</span>
            </label>
            <Select
              className="bcp-select"
              value={form.genre || undefined}
              placeholder="Select genre"
              onChange={(value) => setForm({ ...form, genre: value })}
            >
              {genres.map((g) => (
                <Option key={g.id} value={g.id}>{g.title}</Option>
              ))}
            </Select>
          </div>

          <div className="bcp-field">
            <label className="bcp-label">
              Author
              <span className="bcp-required">*</span>
            </label>
            <Input
              className="bcp-input"
              placeholder="Author name…"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>
          <div className="bcp-field">
              <label>
            Description{" "}
                          <span className="bcp-required">*</span>

          </label>
          <Input.TextArea
            placeholder="Brief synopsis or mood…"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          </div>
        </div>

        <div className="bcp-form__actions">
          <button
            className={`bcp-btn bcp-btn--primary${loading ? " bcp-btn--loading" : ""}`}
            onClick={generateCover}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="bcp-spinner" />
                Generating…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.02 12.02l.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M19.08 4.92l-.7.7"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
                {hasGenerated ? "Re-generate" : "Generate Cover"}
              </>
            )}
          </button>

          <button className="bcp-btn bcp-btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="bcp-preview">
        <div className="bcp-preview__inner">

          {/* Loading */}
          {loading && (
            <div className="bcp-preview__loading">
              <div className="bcp-loader">
                <div className="bcp-loader__ring" />
                <div className="bcp-loader__ring bcp-loader__ring--2" />
              </div>
              <p className="bcp-preview__loading-text">Crafting your cover…</p>
            </div>
          )}

          {/* Image */}
          {!loading && coverImage && (
            <div className="bcp-card">
              {saved && (
                <div className="bcp-card__badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Saved
                </div>
              )}

              <div className="bcp-card__frame">
                <img src={coverImage} alt="Book Cover" className="bcp-card__img" />
                <div className="bcp-card__overlay">
                  <button className="bcp-overlay-btn bcp-overlay-btn--save" onClick={saveCover} disabled={saving}>
                    {saving ? <span className="bcp-spinner bcp-spinner--sm" /> : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    )}
                    Save
                  </button>

                  <button className="bcp-overlay-btn" onClick={viewFullImage}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    View
                  </button>

                  <button className="bcp-overlay-btn" onClick={generateCover} disabled={loading}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Re-generate
                  </button>

                  <button className="bcp-overlay-btn bcp-overlay-btn--danger" onClick={() => setDeleteConfirm(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !coverImage && (
            <div className="bcp-empty">
              <div className="bcp-empty__art">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="6" width="26" height="36" rx="3" fill="currentColor" opacity="0.06"/>
                  <rect x="12" y="6" width="26" height="36" rx="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.3"/>
                  <circle cx="25" cy="22" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                  <path d="M22 22l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                </svg>
              </div>
              <p className="bcp-empty__title">No cover yet</p>
              <p className="bcp-empty__hint">Fill in the details and generate your cover</p>
            </div>
          )}
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteConfirm && (
        <div className="bcp-modal-backdrop" onClick={() => !deleting && setDeleteConfirm(false)}>
          <div className="bcp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bcp-modal__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 className="bcp-modal__title">Delete cover?</h3>
            <p className="bcp-modal__body">This will permanently remove the cover image. This action cannot be undone.</p>
            <div className="bcp-modal__actions">
              <button className="bcp-btn bcp-btn--ghost bcp-btn--sm" onClick={() => setDeleteConfirm(false)} disabled={deleting}>Cancel</button>
              <button className="bcp-btn bcp-btn--danger bcp-btn--sm" onClick={confirmDelete} disabled={deleting}>
                {deleting ? <><span className="bcp-spinner bcp-spinner--sm" /> Deleting…</> : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}