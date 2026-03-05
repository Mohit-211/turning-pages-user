import { useState, useRef, useEffect } from "react";
import "./ComposeBox.scss";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import { CreateFeedApi } from "../../api/operations/feed.api";

export default function ComposeBox({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [genreId, setGenreId] = useState("");
  const [genres, setGenres] = useState([]);

 
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileRef = useRef(null);

  const isReady = title.trim() && text.trim() && genreId && !loading;

  // ─────────────────────────────────
  // Load Genres API
  // ─────────────────────────────────

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await GetAllGenreApi();
        setGenres(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Genre fetch error", err);
      }
    };

    loadGenres();
  }, []);

  // ─────────────────────────────────
  // TAGS
  // ─────────────────────────────────


  // ─────────────────────────────────
  // IMAGE
  // ─────────────────────────────────

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);

    if (preview) URL.revokeObjectURL(preview);

    setPreview(null);

    if (fileRef.current) fileRef.current.value = "";
  };

  // ─────────────────────────────────
  // RESET
  // ─────────────────────────────────

  const resetForm = () => {
    setTitle("");
    setText("");
    setGenreId("");

    removeImage();
    setExpanded(false);
    setError("");
  };

  // ─────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────

  const handleSubmit = async () => {
    if (!isReady) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("content", text.trim());
      formData.append("genre_id", genreId);

      

      if (image) {
        formData.append("images", image, image.name);
      }

      const data = await CreateFeedApi(formData);

      setSuccess(true);
      resetForm();

      onPostCreated?.(data);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`compose-box${expanded ? " compose-box--expanded" : ""}`}>
      <div className="compose-box__inner">
        <div className="compose-box__avatar">EV</div>

        <div className="compose-box__body">
          {expanded && (
            <input
              className="compose-box__title"
              placeholder="Post title…"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}

          <textarea
            className="compose-box__textarea"
            placeholder="Share a manuscript milestone, writing insight, or cover preview…"
            rows={expanded ? 4 : 2}
            value={text}
            onFocus={() => setExpanded(true)}
            onChange={(e) => setText(e.target.value)}
          />

          {expanded && (
            <div className="compose-box__meta">
              {/* GENRE DROPDOWN */}
              <div className="compose-box__field">
                <label className="compose-box__label">
                  Genre <span className="compose-box__required">*</span>
                </label>

                <select
                  className="compose-box__select"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                >
                  <option value="">Select genre...</option>

                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGE */}
              <div className="compose-box__field">
                <label className="compose-box__label">
                  Image <span className="compose-box__optional">(optional)</span>
                </label>

                {preview ? (
                  <div className="compose-box__img-preview">
                    <img
                      src={preview}
                      alt="preview"
                      className="compose-box__img-thumb"
                    />

                    <button
                      type="button"
                      className="compose-box__img-remove"
                      onClick={removeImage}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="compose-box__img-btn"
                    onClick={() => fileRef.current?.click()}
                  >
                    📷 Choose image…
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          )}

          {error && <p className="compose-box__error">⚠ {error}</p>}
          {success && <p className="compose-box__success">✓ Post published!</p>}

          <div className="compose-box__footer">
            <div className="compose-box__actions">
              {expanded && (
                <button
                  type="button"
                  className="compose-box__cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                className={`compose-box__submit ${
                  !isReady ? "compose-box__submit--disabled" : ""
                }`}
                disabled={!isReady}
                onClick={handleSubmit}
              >
                {loading ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}