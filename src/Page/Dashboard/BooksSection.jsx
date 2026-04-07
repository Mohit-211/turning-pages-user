import React, { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import "./BooksSection.scss";

const BooksSection = ({ books = [], onDeleteBook }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = books.length === 0;

  /* ================= SEARCH FILTER ================= */
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return books;

    return books.filter((book) =>
      book.title?.toLowerCase().includes(q) ||
      book.book_genre?.title?.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  /* ================= HANDLERS ================= */
  const handleOpenProject = (bookId) => {
    navigate(`/dashboard/chaptermanager/${bookId}`);
  };

  const handleDelete = async (bookId) => {
    if (!onDeleteBook) {
      alert("Delete handler not provided!");
      return;
    }
    try {
      await onDeleteBook(bookId);
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book!");
    }
  };

  /* ================= UI ================= */
  return (
    <section className="books-section-wrapper">
      {/* Header */}
      <div className="books-header">
        <h3>My Books</h3>

        <div className="books-header-right">
          <input
            type="search"
            placeholder="Search books..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            className="add-book-btn"
            onClick={() => navigate("/create-book")}
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="books-grid">
        {isLoading ? (
          /* Skeleton */
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="book-card skeleton">
              <div className="skeleton-overlay">
                <div className="skeleton-title" />
                <div className="skeleton-text" />
                <div className="skeleton-text short" />
                <div className="skeleton-status" />
                <div className="skeleton-button" />
              </div>
            </div>
          ))
        ) : filteredBooks.length > 0 ? (
          /* Books List */
          filteredBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-content">
                {/* Header */}
                <div className="book-header">
                  <div className="book-info">
                    <h4 className="book-title">
                      {book.title || "Untitled Book"}
                    </h4>
                    <p className="book-genre">
                      {book.book_genre?.title || "No genre"}
                    </p>
                  </div>

                  <div className="book-actions">
                    {book.status && (
                      <span
                        className={`status-tag status-${book.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {book.status}
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
                          Delete Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-section">
                  <p className="progress-label">Last updated</p>
                  <p className="last-updated">
                    {book.updated_at
                      ? formatDistanceToNow(new Date(book.updated_at), {
                          addSuffix: true,
                        })
                      : "Not started yet"}
                  </p>
                </div>

                {/* Action */}
                <button
                  className="open-button"
                  onClick={() => handleOpenProject(book.id)}
                >
                  Open Project
                </button>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="no-books">
            <p>No books found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BooksSection;