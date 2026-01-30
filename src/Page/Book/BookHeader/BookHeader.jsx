import React, { useRef } from "react";
import { Send, Image as ImageIcon, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import "./BookHeader.scss";

export default function BookHeader({
  bookId,
  title,
  onEditCover,
  bookIdDetails,
  onSubmit,
  loading,
}) {
  const printRef = useRef(null);

  const handleSave = (event_name) => {
    onSubmit(event_name);
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

  const isSubmitted = bookIdDetails?.book_submissions?.length > 0;

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
          className="action-btn submit-editing"
          onClick={() => handleSave("submit")}
          disabled={loading || isSubmitted}
        >
          <Send size={16} />
          {loading ? "Submitting..." : "Submit for Editing"}
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

      {/* Hidden print */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef} className="print-book">
          <section className="print-page cover-page">
            {coverUrl && <img src={coverUrl} alt="Book Cover" />}
            <h1>{title || "Untitled Book"}</h1>
            <h3>by {bookIdDetails?.author || "Author"}</h3>
          </section>

          {bookIdDetails?.book_chapters
            ?.filter((ch) => hasValidContent(ch.content))
            .map((chapter, idx) => (
              <section key={idx} className="print-page">
                <h2>
                  Chapter {idx + 1}
                  {chapter.title && ` – ${chapter.title}`}
                </h2>
                <div
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              </section>
            ))}
        </div>
      </div>
    </header>
  );
}
