import React, { useEffect, useState } from "react";
import WelcomeSection from "./WelcomeSection";
import StatsSection from "./StatsSection";
import BooksSection from "./BooksSection";
import { UserProfileApi } from "../../api/users/users.api";
import { GetAllBooksApi } from "../../api/operations/book.api";
import "./Dashboard.scss";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch user
        const userRes = await UserProfileApi();
        setUser(userRes?.data?.data);

        // Fetch books
        const booksRes = await GetAllBooksApi();
        const bookList = booksRes?.data?.data || [];

        setBooks(bookList);

        // Calculate stats
        setStats([
          { title: "Total Books", value: bookList.length },
          {
            title: "In Progress",
            value: bookList.filter((b) =>
              ["Draft", "In Editing"].includes(b.status)
            ).length,
          },
          {
            title: "Completed",
            value: bookList.filter((b) => b.status === "Completed").length,
          },
          {
            title: "Total Words",
            value: bookList
              .reduce((acc, book) => {
                const words = parseInt(
                  book.wordCount?.replace(/[^0-9]/g, "") || "0",
                  10
                );
                return acc + words;
              }, 0)
              .toLocaleString(),
          },
        ]);
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNewBook = () => {
    window.location.href = "/create-book";
  };

  return (
    <div className="dashboard-page">
      <WelcomeSection user={user} onNewBook={handleNewBook} />

      <StatsSection stats={stats} isLoading={loading} />

      <BooksSection books={books} isLoading={loading} />
    </div>
  );
};

export default Dashboard;
