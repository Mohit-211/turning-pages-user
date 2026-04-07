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
  const downloadStatsCSV = () => {
    if (!stats || stats.length === 0) return;

    const header = "Title,Value\n";

    const rows = stats
      .map((item) => {
        const title = `"${item.title}"`;
        const value = `"${item.value}"`;
        return `${title},${value}`;
      })
      .join("\n");

    const csvContent = header + rows;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "dashboard-stats.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="dashboard-page">
     <button
  onClick={downloadStatsCSV}
  style={{
    background: "#1E3A5F",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "600",
    width: "fit-content",
    display: "flex",
    alignSelf: "flex-end",
    margin: "20px",
  }}
>
  Download Stats
</button>
      <WelcomeSection user={user} onNewBook={handleNewBook} />

      <StatsSection stats={stats} isLoading={loading} />

      <BooksSection books={books} isLoading={loading} />
    </div >
  );
};

export default Dashboard;
