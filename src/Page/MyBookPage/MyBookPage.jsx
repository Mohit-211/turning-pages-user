import React, { useEffect, useState } from "react";
import BooksSection from "../Dashboard/BooksSection";
import { GetAllBooksApi, DeleteBookApi } from "../../api/operations/book.api";
import { message } from "antd";
import "../Dashboard/Dashboard.scss";

const MyBookPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ added

  // Load books
  const loadData = async () => {
    try {
      setLoading(true); // start loading
      const bookData = await GetAllBooksApi();
      setBooks(bookData?.data?.data || []);
    } catch (error) {
      console.error("Load books error:", error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  // Delete book
  const handleDeleteBook = async (bookId) => {
    try {
      await DeleteBookApi(bookId);
      message.success("Book deleted successfully!");
      loadData(); // refresh
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete book");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <BooksSection
      books={books}
      loading={loading} // ✅ now properly passed
      onDeleteBook={handleDeleteBook}
    />
  );
};

export default MyBookPage;