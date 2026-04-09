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

        const userRes = await UserProfileApi();
        setUser(userRes?.data?.data);

        const booksRes = await GetAllBooksApi();
        const bookList = booksRes?.data?.data || [];

        setBooks(bookList);

        // Enhanced Stats
        setStats([
          { 
            title: "Total Books", 
            value: bookList.length,
            icon: "📚"
          },
          {
            title: "In Progress",
            value: bookList.filter((b) => ["Draft", "In Editing"].includes(b.status)).length,
            icon: "✍️"
          },
          {
            title: "Completed",
            value: bookList.filter((b) => b.status === "Completed").length,
            icon: "✅"
          },
          {
            title: "Total Words Written",
            value: bookList
              .reduce((acc, book) => {
                const words = parseInt(book.wordCount?.replace(/[^0-9]/g, "") || "0", 10);
                return acc + words;
              }, 0)
              .toLocaleString(),
            icon: "📝"
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
    const rows = stats.map(item => `"${item.title}","${item.value}"`).join("\n");
    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `book-dashboard-stats-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-page">
      {/* Enhanced Download Button */}
      <button
        onClick={downloadStatsCSV}
        className="download-btn"
      >
        📊 Download Stats (CSV)
      </button>

      <WelcomeSection 
        user={user} 
        onNewBook={handleNewBook} 
      />

      <div className="section">
        <h2 className="section-title">📈 Publishing Overview</h2>
        <StatsSection stats={stats} isLoading={loading} />
      </div>

      {/* <div className="section">
        <div className="books-header">
          <h2 className="section-title">📖 My Books & Manuscripts</h2>
          <button onClick={handleNewBook} className="new-book-btn">
            ✨ Create New Book
          </button>
        </div>
        <BooksSection books={books} isLoading={loading} />
      </div> */}
    </div>
  );
};

export default Dashboard;