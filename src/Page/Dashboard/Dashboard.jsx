// Dashboard.jsx
import React, { useEffect, useState } from "react";
import WelcomeSection from "./WelcomeSection";
import StatsSection from "./StatsSection";
import BooksSection from "./BooksSection";
import { UserProfileApi } from "../../api/users/users.api";
import { GetAllBooksApi } from "../../api/operations/book.api";

const Dashboard = () => {
  const [user, setUser] = useState();
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const userData = await UserProfileApi();
      setUser(userData?.data?.data);

      const bookData = await GetAllBooksApi();
      const bookList = bookData?.data?.data || [];
      setBooks(bookList);

      setStats([
        { title: "Total Books", value: bookList.length },
        { title: "In Progress", value: bookList.filter(b => b.status === "Draft" || b.status === "In Editing").length },
        { title: "Completed", value: bookList.filter(b => b.status === "Completed").length },
        {
          title: "Total Words", value: bookList.reduce(
            (acc, book) => acc + parseInt(book.wordCount?.replace(",", "") || 0),
            0
          ).toLocaleString()
        },
      ]);
    };

    loadData();
  }, []);

  const handleRedirect = (url) => window.location.href = `/${url}`;

  return (
    <>
      <WelcomeSection user={user} onNewBook={() => handleRedirect("create-book")} />
      <StatsSection stats={stats} />
      <BooksSection books={books} />
    </>
  );
};

export default Dashboard;
