import React, { useState, useRef } from "react";
import { Save, Send, Image as ImageIcon, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { GetBooksByStatusApi } from "../../../api/operations/book.api";
import "./BookHeader.scss";

export default function BookHeader({
  bookId,
  title,
  onEditCover,
  bookIdDetails,
}) {
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const handleSave = async (status) => {
    setLoading(true);
    try {
      await GetBooksByStatusApi({ book_id: bookId, status });
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const hasValidContent = (html) => {
    if (!html) return false;
    const text = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    return !!text && !text.includes("coming soon");
  };

  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: title || "My Book",
  });

  const coverUrl = bookIdDetails?.cover_img_name
    ? `${import.meta.env.VITE_BOOK_IMAGE_URL}${bookIdDetails.cover_img_name}`
    : "";

  return (
    <header className="book-header">
      <div className="book-title">
        <span className="book-icon">📘</span>
        <h3>{title || "Untitled Book"}</h3>
      </div>

      <div className="actions">
        <button className="action-btn edit-cover" onClick={onEditCover}>
          <ImageIcon size={16} />
          Edit Cover
        </button>

        <button
          className="action-btn save-draft"
          onClick={() => handleSave("draft")}
          disabled={loading}
        >
          <Save size={16} />
          Save Draft
        </button>

        <button
          className="action-btn submit-editing"
          onClick={() => handleSave("in-editing")}
          disabled={loading}
        >
          <Send size={16} />
          Submit for Editing
        </button>

        <button
          className="action-btn download-pdf"
          onClick={handleDownloadPdf}
          disabled={loading}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Hidden print content */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef} className="print-book">
          {/* Cover Page */}
          <section className="print-page cover-page">
            {coverUrl && <img src={coverUrl} alt="Book Cover" />}
            <h1>{title || "Untitled Book"}</h1>
            <h3>by {bookIdDetails?.author || "Author"}</h3>
          </section>

          {/* Chapters */}
          {bookIdDetails?.book_chapters
            ?.filter((ch) => hasValidContent(ch.content))
            .map((chapter, idx) => (
              <section key={chapter.id || idx} className="print-page">
                <h2>
                  Chapter {idx + 1}
                  {chapter.title && ` – ${chapter.title}`}
                </h2>
                <div
                  className="chapter-content"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </section>
            ))}
        </div>
      </div>
    </header>
  );
}
