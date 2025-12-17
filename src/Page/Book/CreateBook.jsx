import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { Form, Input, Select, Button, message } from "antd";
import "./CreateBook.scss";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import { CreateBookApi } from "../../api/operations/book.api";

const { TextArea } = Input;

const CreateBook = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch((e) => console.error("Error fetching genres:", e));
  }, []);

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormValues((prev) => ({ ...prev, ...values })); // ✅ store values
      setCurrentStep((prev) => prev + 1);
    } catch {
      message.error("Please fill all required fields.");
    }
  };

  const handlePrevious = () => {
    const values = form.getFieldsValue();
    setFormValues((prev) => ({ ...prev, ...values }));
    setCurrentStep((prev) => prev - 1);
  };

  const handleCreateProject = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...formValues, ...values }; // ✅ merge cached + latest

      setLoading(true);
      const response =await CreateBookApi(payload);
      message.success(response?.data?.message);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      message.error("Failed to create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-book">
      {/* Header */}
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

      {/* Main */}
      <main className="container main-content">
        <h1 className="page-title">Create a New Book</h1>

        {/* Progress */}
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>

        <div className="card">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Book Details</h2>
              <p className="description">Provide some basic information to get started</p>

              <Form layout="vertical" form={form} initialValues={formValues}>
                <Form.Item
                  label="Book Title *"
                  name="title"
                  rules={[{ required: true, message: "Please enter a book title" }]}
                  preserve={true}
                >
                  <Input placeholder="Enter your book title" />
                </Form.Item>

                <Form.Item
                  label="Genre *"
                  name="genre_id"
                  rules={[{ required: true, message: "Please select a genre" }]}
                  preserve={true}
                >
                  <Select placeholder="Select a genre">
                    {genres.map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Short Description *"
                  name="description"
                  rules={[{ required: true, message: "Please provide a description" }]}
                  preserve={true}
                >
                  <TextArea
                    placeholder="Describe your book in a few sentences..."
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    maxLength={3000}
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
                <h3>
                  <FileText /> Book Details
                </h3>
                <p>
                  <strong>Title:</strong> {formValues.title}
                </p>
                <p>
                  <strong>Genre:</strong>{" "}
                  {genres.find((g) => g.id === formValues.genre_id)?.title}
                </p>
                <p>
                  <strong>Description:</strong> {formValues.description}
                </p>
              </div>

              <div className="center">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleCreateProject}
                  loading={loading}
                >
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="navigation">
          <Button onClick={handlePrevious} disabled={currentStep === 1} icon={<ArrowLeft />}>
            Previous
          </Button>

          {currentStep < totalSteps && (
            <Button type="primary" onClick={handleNext} icon={<ArrowRight />}>
              Next
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateBook;
