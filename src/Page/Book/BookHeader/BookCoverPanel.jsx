import React, { useEffect, useState } from "react";
import { Input, Button, Select, Spin, message } from "antd";
import {
  GenerateBookCoverApi,
  UpdateBookCoverApi,
} from "../../../api/operations/book.api";
import { GetAllGenreApi } from "../../../api/operations/genre.api";
import "./BookCoverPanel.scss";

const { Option } = Select;

export default function BookCoverPanel({ bookdetails, onClose }) {
  console.log(bookdetails, "bookdetails===>>>");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [coverFileName, setCoverFileName] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [showButtons, setShowButtons] = useState(false);
  const [genres, setGenres] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [form, setForm] = useState({
    title: "",
    genre: "",
    author: "",
    description: "",
  });

  /* =========================
     LOAD INITIAL BOOK DATA
  ========================= */
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
      setCoverImage(
        bookdetails.cover_img_uri
          ? bookdetails.cover_img_uri
          : `${import.meta.env.VITE_BOOK_IMAGE_URL}${bookdetails.cover_img_name}`
      );
      setHasGenerated(true);
      setShowButtons(true);
    }
  }, [bookdetails]);

  /* =========================
     LOAD GENRES
  ========================= */
  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch(() => message.error("Failed to load genres"));
  }, []);

  /* =========================
     GENERATE COVER
  ========================= */
  const generateCover = async () => {
    if (!form.title || !form.genre || !form.author) {
      return message.warning("All fields are required");
    }

    try {
      setLoading(true);
      setShowButtons(false);

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
        setCoverImage(
          `${import.meta.env.VITE_BOOK_IMAGE_URL}${fileName}`
        );
        setHasGenerated(true);
        setTimeout(() => setShowButtons(true), 1500);
      }

      message.success(hasGenerated ? "Cover regenerated" : "Cover generated");
    } catch {
      message.error("Cover generation failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAVE COVER
  ========================= */
  const saveCover = async () => {
    if (!coverFileName) {
      return message.warning("No cover to save");
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("book_id", bookdetails.id);
      formData.append("cover_img_name", coverFileName);
      formData.append("author", form.author);

      await UpdateBookCoverApi(formData);

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

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="book-cover-panel">
      {/* LEFT FORM */}
      <div className="cover-form">
        <h2 className="panel-title">Generate Book Cover</h2>

        <Input
          placeholder="Book Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <Select
          placeholder="Select Genre"
          value={form.genre || undefined}
          style={{ width: "100%", marginTop: 16 }}
          onChange={(value) =>
            setForm({ ...form, genre: value })
          }
        >
          {genres.map((g) => (
            <Option key={g.id} value={g.id}>
              {g.title}
            </Option>
          ))}
        </Select>

        <Input
          placeholder="Author Name"
          style={{ marginTop: 16 }}
          value={form.author}
          onChange={(e) =>
            setForm({ ...form, author: e.target.value })
          }
        />

        <Button
          type="primary"
          block
          loading={loading}
          onClick={generateCover}
          style={{ marginTop: 24 }}
        >
          {hasGenerated ? "Re-Generate Cover" : "Generate Cover"}
        </Button>

        <Button block style={{ marginTop: 12 }} onClick={onClose}>
          Close
        </Button>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="cover-preview">
        {loading && (
          <div className="spin-overlay">
            <Spin size="large" />
          </div>
        )}

        {!loading && coverImage && (
          <div className="image-wrapper">
            <img
              src={coverImage}
              alt="Book Cover"
              className="cover-image"
            />

            {showButtons && (
              <div className="overlay-buttons fade-in">
                <Button
                  onClick={saveCover}
                  loading={saving}
                  style={{ marginRight: 8 }}
                >
                  Save Cover
                </Button>

                <Button onClick={viewFullImage}>
                  View Full Image
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && !coverImage && (
          <p className="placeholder-text">
            Generated cover will appear here
          </p>
        )}
      </div>
    </div>
  );
}
