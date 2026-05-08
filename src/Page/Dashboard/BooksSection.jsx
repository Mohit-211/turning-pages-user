import React, { useState, useMemo, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Modal, Button, message } from "antd";

import "./BooksSection.scss";
import EmptyState from "../../component/EmptyState";

import { GetAllGenreApi } from "../../api/operations/genre.api";
import { UpdateBookCoverApi } from "../../api/operations/book.api";

/* ── Icons ── */
const SearchIcon = () => (
  <svg
    className="search-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
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

      <div
        className="skel-line"
        style={{
          height: 12,
          width: "85%",
          marginTop: 16,
        }}
      />

      <div className="skel-line" style={{ height: 12, width: "65%" }} />

      <div
        className="skel-line"
        style={{
          height: 40,
          width: "100%",
          marginTop: "auto",
          borderRadius: 10,
        }}
      />
    </div>
  </div>
);

/* ── Main Component ── */
const BooksSection = ({
  books = [],
  loading = false,
  onDeleteBook,
}) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [genres, setGenres] = useState([]);

  /* LOCAL BOOKS STATE */
  const [booksData, setBooksData] = useState([]);

  const [updateModal, setUpdateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [updatingBook, setUpdatingBook] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    genre_id: "",
    author: "",
    cover_img_name: null,
  });

  /* ── SYNC BOOKS ── */
  useEffect(() => {
    setBooksData(books);
  }, [books]);

  /* ── GET GENRES ── */
  useEffect(() => {
    GetAllGenreApi()
      .then((res) => {
        setGenres(res?.data?.data || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  /* ── FILTER ── */
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return booksData;

    return booksData.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.book_genre?.title?.toLowerCase().includes(q)
    );
  }, [booksData, searchQuery]);

  /* ── OPEN PROJECT ── */
  const handleOpenProject = (bookId) => {
    navigate(`/dashboard/chaptermanager/${bookId}`);
  };

  /* ── DELETE ── */
  const handleDelete = async (bookId) => {
    if (!onDeleteBook) return;

    try {
      await onDeleteBook(bookId);

      /* REMOVE FROM UI */
      setBooksData((prev) =>
        prev.filter((book) => book.id !== bookId)
      );

    } catch (err) {
      console.error(err);
    }
  };

  /* ── OPEN UPDATE MODAL ── */
  const openUpdateModal = (book) => {
    setSelectedBook(book);

    setUpdateForm({
      title: book.title || "",
      description: book.description || "",
      genre_id: book.genre_id || "",
      author: book.author || "",
      cover_img_name: null,
    });

    setUpdateModal(true);
  };

  /* ── UPDATE BOOK ── */
  const handleUpdateBook = async () => {
    try {
      setUpdatingBook(true);

      const formData = new FormData();

      formData.append("title", updateForm.title);
      formData.append("description", updateForm.description);
      formData.append("genre_id", updateForm.genre_id);
      formData.append("book_id", selectedBook.id);
      formData.append("author", updateForm.author);

      // if (updateForm.cover_img_name) {
      //   formData.append(
      //     "cover_img_name",
      //     updateForm.cover_img_name
      //   );
      // }

      const res = await UpdateBookCoverApi(formData);

      message.success(
        res?.data?.message || "Book updated successfully!"
      );

      /* FIND GENRE */
      const selectedGenre = genres.find(
        (g) => g.id === updateForm.genre_id
      );

      /* UPDATE UI */
      setBooksData((prev) =>
        prev.map((book) =>
          book.id === selectedBook.id
            ? {
                ...book,
                title: updateForm.title,
                description: updateForm.description,
                genre_id: updateForm.genre_id,
                author: updateForm.author,
                book_genre: selectedGenre || book.book_genre,
              }
            : book
        )
      );

      setUpdateModal(false);

    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          "Failed to update book"
      );
    } finally {
      setUpdatingBook(false);
    }
  };

  return (
    <>
      <section className="books-section-wrapper">

        {/* HEADER */}
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
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>

            <button
              className="add-book-btn"
              onClick={() => navigate("/create-book")}
            >
              <PlusIcon />
              Add book
            </button>

          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="books-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : booksData.length === 0 ? (
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
              <div
                key={book.id}
                className="book-card"
              >

                <div className="card-accent" />

                <div className="card-body">

                  {/* TOP */}
                  <div className="card-top">

                    <div>
                      <h4
                        className="book-title"
                        title={book.title}
                      >
                        {book.title || "Untitled book"}
                      </h4>

                      <p className="book-genre">
                        {book.book_genre?.title ||
                          "No genre"}
                      </p>
                    </div>

                    <div className="card-actions">

                      {book.status && (
                        <span
                          className={statusClass(book.status)}
                        >
                          {book.status === "in-editing"
                            ? "in-submission"
                            : book.status}
                        </span>
                      )}

                      <div className="dropdown-wrapper">

                        <button className="menu-btn">
                          <BsThreeDotsVertical />
                        </button>

                        <div className="dropdown-menu">

                          <button
                            className="dropdown-item danger"
                            onClick={() =>
                              handleDelete(book.id)
                            }
                          >
                            Delete book
                          </button>

                          <button
                            className="dropdown-item"
                            onClick={() =>
                              openUpdateModal(book)
                            }
                          >
                            Update book
                          </button>

                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-divider" />

                  {/* CHAPTERS */}
                  {book.chapters_count != null && (
                    <div className="meta-row">

                      <div className="meta-icon">
                        <ChaptersIcon />
                      </div>

                      <div>
                        <p className="meta-label">
                          Chapters
                        </p>

                        <p className="meta-value">
                          {book.chapters_count} chapters
                        </p>
                      </div>

                    </div>
                  )}

                  {/* UPDATED */}
                  <div className="meta-row">

                    <div className="meta-icon">
                      <ClockIcon />
                    </div>

                    <div>
                      <p className="meta-label">
                        Last updated
                      </p>

                      <p className="meta-value">
                        {book.updated_at
                          ? formatDistanceToNow(
                              new Date(book.updated_at),
                              { addSuffix: true }
                            )
                          : "Not started yet"}
                      </p>
                    </div>

                  </div>

                  {/* BUTTON */}
                  <button
                    className="open-button"
                    onClick={() =>
                      handleOpenProject(book.id)
                    }
                    disabled={
                      book.status === "in-editing"
                    }
                    style={{
                      opacity:
                        book.status === "in-editing"
                          ? 0.5
                          : 1,
                      cursor:
                        book.status === "in-editing"
                          ? "not-allowed"
                          : "pointer",
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

      {/* UPDATE MODAL */}
      <Modal
        open={updateModal}
        onCancel={() => setUpdateModal(false)}
        footer={null}
        centered
        width={700}
        className="cb-modal"
      >
        <div className="cb-modal__body">

          <div className="cb-card__head">
            <h2>Update book</h2>
            <p>Edit your book information</p>
          </div>

          <div className="cb-form">

            {/* TITLE */}
            <div className="cb-field">
              <label>Book title</label>

              <input
                type="text"
                value={updateForm.title}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Book title"
              />
            </div>

            {/* GENRE */}
            <div className="cb-field">
              <label>Genre</label>

              <select
                value={updateForm.genre_id}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    genre_id: Number(
                      e.target.value
                    ),
                  }))
                }
              >
                <option value="">
                  Select genre
                </option>

                {genres.map((g) => (
                  <option
                    key={g.id}
                    value={g.id}
                  >
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            {/* AUTHOR */}
            <div className="cb-field">
              <label>Author</label>

              <input
                type="text"
                value={updateForm.author}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    author: e.target.value,
                  }))
                }
                placeholder="Author name"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="cb-field">
              <label>Description</label>

              <textarea
                rows={5}
                value={updateForm.description}
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Book description"
              />
            </div>

            {/* COVER */}
            {/* <div className="cb-field">
              <label>Cover image</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setUpdateForm((prev) => ({
                    ...prev,
                    cover_img_name:
                      e.target.files?.[0],
                  }))
                }
              />
            </div> */}

            {/* BUTTON */}
            <Button
              type="primary"
              size="large"
              block
              loading={updatingBook}
              onClick={handleUpdateBook}
            >
              Update Book
            </Button>

          </div>
        </div>
      </Modal>
    </>
  );
};

export default BooksSection;