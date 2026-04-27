import React, { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import "./BooksSection.scss";
import EmptyState from "../../component/EmptyState";

/* ── Icons ── */
const SearchIcon = () => (
  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ChaptersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M9 9h6M9 13h4" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" />
    <path d="M4 11h16" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

/* ── Helpers ── */
const statusClass = (status = "") =>
  "status-pill status-" + status.toLowerCase().replace(/\s+/g, "-");

/* ── Skeleton ── */
const SkeletonCard = () => (
  <div className="book-card skeleton">
    <div className="card-accent" />
    <div className="card-body">
      <div className="skel-line" style={{ height: 16, width: "70%" }} />
      <div className="skel-line" style={{ height: 12, width: "45%" }} />
      <div className="skel-line" style={{ height: 12, width: "85%", marginTop: 16 }} />
      <div className="skel-line" style={{ height: 12, width: "65%" }} />
      <div
        className="skel-line"
        style={{ height: 40, width: "100%", marginTop: "auto", borderRadius: 10 }}
      />
    </div>
  </div>
);

/* ── Main Component ── */
const BooksSection = ({ books = [], loading = false, onDeleteBook }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  /* Filter */
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.book_genre?.title?.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  /* Handlers */
  const handleOpenProject = (bookId) => {
    navigate(`/dashboard/chaptermanager/${bookId}`);
  };

  const handleDelete = async (bookId) => {
    if (!onDeleteBook) return;
    try {
      await onDeleteBook(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="books-section-wrapper">
      {/* Header */}
      <div className="books-header">
        <h3>My books</h3>

        <div className="books-header-right">
          <div className="search-wrap">
            <SearchIcon />
            <input
              type="search"
              className="search-input"
              placeholder="Search books…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="add-book-btn" onClick={() => navigate("/create-book")}>
            <PlusIcon />
            Add book
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="books-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={<EmptyIcon />}
          title="No books available right now"
          description="Create a new book to get started with your writing"
          onButtonClick={() => navigate("/create-book")}
        />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={<EmptyIcon />}
          title="No results found"
          description={`No books match "${searchQuery}"`}
        />
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="card-accent" />

              <div className="card-body">
                {/* Top */}
                <div className="card-top">
                  <div>
                    <h4 className="book-title">{book.title || "Untitled book"}</h4>
                    <p className="book-genre">{book.book_genre?.title || "No genre"}</p>
                  </div>

                  <div className="card-actions">
                    {book.status && (
                      <span className={statusClass(book.status)}>
                        {book.status === "in-editing" ? "in-submission" : book.status}
                      </span>
                    )}

                    <div className="dropdown-wrapper">
                      <button className="menu-btn">
                        <BsThreeDotsVertical />
                      </button>

                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item danger"
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-divider" />

                {/* Chapters */}
                {book.chapters_count != null && (
                  <div className="meta-row">
                    <div className="meta-icon">
                      <ChaptersIcon />
                    </div>
                    <div>
                      <p className="meta-label">Chapters</p>
                      <p className="meta-value">{book.chapters_count} chapters</p>
                    </div>
                  </div>
                )}

                {/* Last updated */}
                <div className="meta-row">
                  <div className="meta-icon">
                    <ClockIcon />
                  </div>
                  <div>
                    <p className="meta-label">Last updated</p>
                    <p className="meta-value">
                      {book.updated_at
                        ? formatDistanceToNow(new Date(book.updated_at), { addSuffix: true })
                        : "Not started yet"}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className="open-button"
                  onClick={() => handleOpenProject(book.id)}
                  disabled={book.status === "in-editing"}
                  style={{
                    opacity: book.status === "in-editing" ? 0.5 : 1,
                    cursor: book.status === "in-editing" ? "not-allowed" : "pointer",
                  }}
                >
                  Open project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default BooksSection;