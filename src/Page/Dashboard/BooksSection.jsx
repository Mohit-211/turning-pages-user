import React from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Tag,
  Skeleton,
  Dropdown,
  Menu,
  message,
} from "antd";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import "./BooksSection.scss";

const BooksSection = ({ books, onDeleteBook }) => {
  const navigate = useNavigate();
  const isLoading = !books || books.length === 0;

  const handleOpenProject = (bookId) => {
    navigate("/dashboard/chaptermanager", { state: { bookId } });
  };

  const handleDelete = async (bookId) => {
    if (!onDeleteBook) {
      message.warning("Delete handler not provided!");
      return;
    }

    try {
      await onDeleteBook(bookId);
    } catch (error) {
      console.error("Error deleting book:", error);
      message.error("Failed to delete book!");
    }
  };

  const menu = (bookId) => (
    <Menu>
      <Menu.Item key="delete" danger onClick={() => handleDelete(bookId)}>
        Delete Book
      </Menu.Item>
    </Menu>
  );

  const skeletonCards = Array.from({ length: 6 }, (_, i) => (
    <Col span={8} key={i}>
      <Card className="book-card">
        <Skeleton active title paragraph={{ rows: 4 }} />
      </Card>
    </Col>
  ));

  return (
    <>
      <div className="books-header">
        <h3>My Books</h3>
        <Input.Search placeholder="Search" style={{ width: 200 }} />
      </div>

      <Row gutter={[16, 16]} className="books-section">
        {isLoading
          ? skeletonCards
          : books.map((book) => (
              <Col span={8} key={book.id}>
                <Card className="book-card">
                  <div className="book-header">
                    <div>
                      <h4>{book?.title}</h4>
                      <p className="genre">{book?.book_genre?.title}</p>
                    </div>
                    <div className="book-actions">
                      {book.status && (
                        <Tag
                          className={`status-tag ${book?.status
                            .toLowerCase()
                            .replace(" ", "")}`}
                        >
                          {book.status}
                        </Tag>
                      )}
                      <Dropdown overlay={menu(book.id)} trigger={["click"]}>
                        <BsThreeDotsVertical className="menu-icon" />
                      </Dropdown>
                    </div>
                  </div>

                  <div className="progress-section">
                    <p>Progress</p>
                    <div className="book-meta">
                      <span>
                        Updated{" "}
                        {book.updated_at
                          ? formatDistanceToNow(new Date(book.updated_at), {
                              addSuffix: true,
                            })
                          : "Not started"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    block
                    className="open-btn"
                    onClick={() => handleOpenProject(book.id)}
                  >
                    Open Project
                  </Button>
                </Card>
              </Col>
            ))}
      </Row>
    </>
  );
};

export default BooksSection;
