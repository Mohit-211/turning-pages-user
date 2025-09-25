import React from "react";
import { Layout, Card, Row, Col, Progress, Button, Input, Tag } from "antd";

import "./Dashboard.scss";
import DashboardSidebar from "../../component/DashboardSidebar/DashboardSidebar";
import DashboardHeader from "../../component/DashboardHeader/DashboardHeader";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

// Mock Data
const user = {
  name: "Sarah Chen",
  avatar: null,
};

const stats = [
  { title: "Total Books", value: 6 },
  { title: "In Progress", value: 4 },
  { title: "Completed", value: 2 },
  { title: "Total Words", value: "233,790" },
];

const books = [
  {
    id: 1,
    title: "The Digital Revolution",
    genre: "Technology",
    progress: 100,
    words: "47,250",
    updated: "2 hours ago",
    status: "Completed",
  },
  {
    id: 2,
    title: "Love in the Time of AI",
    genre: "Romance",
    progress: 78,
    words: "67,890",
    updated: "1 day ago",
    status: "In Editing",
  },
  {
    id: 3,
    title: "Cooking with Heart",
    genre: "Cookbook",
    progress: 100,
    words: "45,200",
    updated: "3 days ago",
    status: "Completed",
  },
  {
    id: 4,
    title: "Mystery of the Lost Code",
    genre: "Thriller",
    progress: 0,
    words: "0",
    updated: "",
    status: "Draft",
  },
  {
    id: 5,
    title: "Startup Success Stories",
    genre: "Business",
    progress: 0,
    words: "0",
    updated: "",
    status: "In Editing",
  },
  {
    id: 6,
    title: "Children's Garden Tales",
    genre: "Children's",
    progress: 0,
    words: "0",
    updated: "",
    status: "Draft",
  },
];
const Dashboard = () => {
  const navigate = useNavigate()

  const handleRedirect = (url) => {
    console.log(url)
    navigate(`/${url}`)
  }
  return (
    <Layout className="dashboard">
      <DashboardSidebar />
      <Layout>
        <DashboardHeader user={user} notifications={[]} unreadCount={2} />
        <Content className="dashboard-content">
          <div className="welcome-section">
            <h2>Welcome back, {user.name}</h2>
            <p>Continue writing your next masterpiece</p>
            <Button type="primary" className="new-book-btn" onClick={() => { handleRedirect("create-book") }}>
              + Start a New Book
            </Button>
          </div>

          {/* Stats */}
          <Row gutter={16} className="stats-section">
            {stats.map((stat, index) => (
              <Col span={6} key={index}>
                <Card className="stat-card">
                  <p className="stat-title">{stat.title}</p>
                  <h2 className="stat-value">{stat.value}</h2>
                </Card>
              </Col>
            ))}
          </Row>

          {/* My Books */}
          <div className="books-header">
            <h3>My Books</h3>
            <Input.Search placeholder="Search" style={{ width: 200 }} />
          </div>

          <Row gutter={[16, 16]} className="books-section">
            {books.map((book) => (
              <Col span={8} key={book.id}>
                <Card className="book-card">
                  <div className="book-header">
                    <div>
                      <h4>{book.title}</h4>
                      <p className="genre">{book.genre}</p>
                    </div>
                    {book.status && (
                      <Tag
                        className={`status-tag ${book.status.toLowerCase()}`}
                      >
                        {book.status}
                      </Tag>
                    )}
                  </div>
                  <div className="progress-section">
                    <p>Progress</p>
                    <Progress percent={book.progress} showInfo={false} />
                    <div className="book-meta">
                      <span>{book.words} words</span>
                      <span>
                        {book.updated && `Updated ${book.updated}`}
                      </span>
                    </div>
                  </div>
                  <Button type="primary" block className="open-btn">
                    Open Project
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
