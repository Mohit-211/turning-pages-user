import React, { useEffect, useState } from "react";
import BooksSection from "../Dashboard/BooksSection";
import { GetAllBooksApi, DeleteBookApi } from "../../api/operations/book.api";
import { Layout, message } from "antd";
import DashboardSidebar from "../../component/DashboardSidebar/DashboardSidebar";
import "../Dashboard/Dashboard.scss";
const { Content } = Layout;
const MyBookPage = () => {
  const [books, setBooks] = useState([]);
  // ✅ Load all books
  const loadData = async () => {
    try {
      const bookData = await GetAllBooksApi();
      setBooks(bookData?.data?.data || []);
    } catch (error) {
      console.error("Load books error:", error);
    }
  };
  // ✅ Handle delete
  const handleDeleteBook = async (bookId) => {
    try {
      await DeleteBookApi(bookId);
      message.success("Book deleted successfully!");
      // Refresh the list
      loadData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  return (
          <BooksSection books={books} onDeleteBook={handleDeleteBook} />
  );
};
export default MyBookPage;