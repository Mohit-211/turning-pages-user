import React, { useState, useRef } from "react";
import "./BookHeader.scss";
import { Save, Send, Image, Download } from "lucide-react";
import { GetBooksByStatusApi } from "../../../api/operations/book.api";
import { message } from "antd";
import { useReactToPrint } from "react-to-print";

export default function BookHeader({ bookId, title, onEditCover, bookIdDetails }) {
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const handleSave = async (status) => {
    try {
      setLoading(true);
      await GetBooksByStatusApi({ book_id: bookId, status });
      message.success("Saved");
    } catch {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter out empty / coming soon content
  const hasValidContent = (html) => {
    if (!html) return false;

    const text = html
      .replace(/<[^>]*>/g, "") // remove HTML tags
      .replace(/&nbsp;/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!text) return false;

    if (
      text === "coming soon" ||
      text === "content coming soon" ||
      text.includes("coming soon")
    ) {
      return false;
    }

    return true;
  };

  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef, // ✅ v3 syntax
    documentTitle: title || "book",
  });

  const coverUrl = bookIdDetails?.cover_img_name
    ? `${import.meta.env.VITE_BOOK_IMAGE_URL}${bookIdDetails.cover_img_name}`
    : "";

  return (
    <div className="book-header">
      {/* HEADER UI */}
      <div className="book-title">
        <span className="book-icon">📘</span>
        <h3>{title}</h3>
      </div>

      <div className="actions">
        <button className="action-btn" onClick={onEditCover}>
          <Image size={16} />
          Edit Cover
        </button>

        <button
          className="action-btn"
          onClick={() => handleSave("draft")}
          disabled={loading}
        >
          <Save size={16} />
          Save Draft
        </button>

        <button
          className="submit-btn"
          onClick={() => handleSave("in-editing")}
          disabled={loading}
        >
          <Send size={16} />
          Submit for Editing
        </button>

        <button className="action-btn" onClick={handleDownloadPdf}>
          <Download size={16} />
          Download Book PDF
        </button>
      </div>

      {/* 🔒 PRINT CONTENT (ALWAYS MOUNTED) */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={printRef} className="print-book">
          {/* 📘 COVER PAGE */}
          <section className="print-page cover-page">
            {coverUrl && <img src={coverUrl} alt="Book Cover" />}
            <h1>{title}</h1>
            <h3>by {bookIdDetails?.author}</h3>
          </section>

          {/* 📖 CHAPTERS */}
          {bookIdDetails?.book_chapters
            ?.filter((chapter) => hasValidContent(chapter.content))
            .map((chapter, index) => (
              <section
                key={chapter.id || index}
                className="print-page chapter-page"
              >
                {chapter.title && (
                  <>
                    <h2>

                      Chapter {index + 1}
                    </h2>
                    <h2 className="chapter-title">

                      {chapter.title ? `${chapter.title}` : ""}
                    </h2>
                  </>
                )}
                <div
                  className="chapter-content"
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
