import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { Form, Input, Select, Button, message } from "antd";
import "./CreateBook.scss";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import { CreateBookApi } from "../../api/operations/book.api";

const { TextArea } = Input;

const CreateBook = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookData, setBookData] = useState({
    title: "",
    genre_id: null,
    description: ""
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch((e) => console.log(e, "error fetching genres"));
  }, []);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreateProject = async () => {
    if (!bookData.title || !bookData.genre_id || !bookData.description) {
      message.error("Please fill all fields before creating the book.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: bookData.title,
        description: bookData.description,
        genre_id: bookData.genre_id
      };
      const response = await CreateBookApi(payload);
      message.success(`Project Created! "${bookData.title}" has been added to your library.`);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      message.error("Failed to create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = bookData.title && bookData.genre_id && bookData.description;

  return (
    <div className="create-book">
      <header className="header">
        <div className="container header-container">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft className="icon" /> Back to Dashboard
          </Link>
          <div className="title">
            <span className="emoji">📖</span>
            <span className="text">Turning Pages</span>
          </div>
        </div>
      </header>

      <main className="container main-content">
        <h1 className="page-title">Create a New Book</h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="card">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Book Details</h2>
              <p className="description">Provide some basic information to get started</p>

              <Form layout="vertical">
                <Form.Item label="Book Title *">
                  <Input
                    placeholder="Enter your book title"
                    value={bookData.title}
                    onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                  />
                </Form.Item>

                <Form.Item label="Genre *">
                  <Select
                    placeholder="Select a genre"
                    value={bookData.genre_id}
                    onChange={(value) => setBookData({ ...bookData, genre_id: value })}
                  >
                    {genres.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Short Description *">
                  <TextArea
                    placeholder="Describe your book in a few sentences..."
                    value={bookData.description}
                    onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                    rows={4}
                  />
                </Form.Item>
              </Form>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h2>Review Your Project</h2>
              <p className="description">Confirm the details and create your book project</p>

              <div className="review-section">
                <h3><FileText /> Book Details</h3>
                <p><strong>Title:</strong> {bookData.title}</p>
                <p><strong>Genre:</strong> {genres.find((g) => g.id === bookData.genre_id)?.title}</p>
                <p><strong>Description:</strong> {bookData.description}</p>
              </div>

              <div className="center">
                <Button type="primary" size="large" onClick={handleCreateProject} loading={loading}>
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="navigation">
          <Button onClick={handlePrevious} disabled={currentStep === 1} icon={<ArrowLeft />}>
            Previous
          </Button>
          {currentStep < totalSteps && (
            <Button
              onClick={handleNext}
              disabled={!isStep1Valid}
              icon={<ArrowRight />}
              type="primary"
            >
              Next
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateBook;
