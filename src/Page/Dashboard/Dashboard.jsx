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

        const totalWords = bookList.reduce((acc, book) => {
          const w = parseInt(book.wordCount?.replace(/[^0-9]/g, "") || "0", 10);
          return acc + w;
        }, 0);

        setStats([
          { title: "Total Books",        value: bookList.length,                                                              sub: "All manuscripts",   color: "#1a2e44", barColor: "#1a2e44", pct: 100 },
          { title: "In Progress",        value: bookList.filter(b => ["Draft","In Editing"].includes(b.status)).length,       sub: "Active drafts",     color: "#ed1c24", barColor: "#f59e0b", pct: 0   },
          { title: "Completed",          value: bookList.filter(b => b.status === "Completed").length,                        sub: "Published works",   color: "#ed1c24", barColor: "#16a34a", pct: 0   },
          { title: "Total Words Written",value: totalWords.toLocaleString(),                                                  sub: "Across all books",  color: "#ed1c24", barColor: "#7c3aed", pct: 0   },
        ]);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNewBook = () => { window.location.href = "/create-book"; };

  const downloadStatsCSV = () => {
    if (!stats.length) return;
    const csv = "Title,Value\n" + stats.map(s => `"${s.title}","${s.value}"`).join("\n");
    const link = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })),
      download: `turning-pages-stats-${new Date().toISOString().slice(0,10)}.csv`,
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
console.log(user?.user_profile?.name,"user")
  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">Welcome back, {user?.user_profile?.name}</h1>
          <p className="welcome-sub">Continue shaping your next story</p>
        </div>
        <div className="header-actions">
          <button className="btn-navy" onClick={downloadStatsCSV}>
            📊 Download Stats (CSV)
          </button>
          <button className="btn-red" onClick={handleNewBook}>
            + Start a New Book
          </button>
        </div>
      </div>

      {/* Plan banner */}
      <div className="plan-banner">
        <div className="plan-info">
          <div className="plan-icon">💳</div>
          <div>
            <div className="plan-title">Hi {user?.user_profile?.name}, manage your plan</div>
            {/* <div className="plan-desc">Upgrade to unlock more books and features</div> */}
          </div>
        </div>
        <button className="btn-orange" onClick={() => window.location.href = "/dashboard/payment"}>
          ✨ Purchase or Upgrade Plan
        </button>
      </div>

      {/* Stats */}
      <div className="section">
        <h2 className="section-title">📈 Publishing Overview</h2>
        <StatsSection stats={stats} isLoading={loading} />
      </div>

    </div>
  );
};

export default Dashboard;