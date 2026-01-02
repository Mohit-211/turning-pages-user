import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { Form, Input, Select, Button, message, Modal } from "antd";
import "./CreateBook.scss";

import { GetAllGenreApi } from "../../api/operations/genre.api";
import { CreateBookApi } from "../../api/operations/book.api";
import PricingCards from "../../Sections/PaymentPage/PricingPage";

const { TextArea } = Input;

const CreateBook = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openPricing, setOpenPricing] = useState(false);

  // ⚡ Track if retry after payment
  const [hasRetried, setHasRetried] = useState(false);

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    genre_id: "",
  });

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch(() => message.error("Failed to load genres"));
  }, []);

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormValues(values);
      setCurrentStep(2);
    } catch {
      message.error("Please fill all required fields.");
    }
  };

  const handlePrevious = () => setCurrentStep(1);

  const handleCreateBook = async () => {
    const payload = {
      title: formValues.title,
      description: formValues.description,
      genre_id: formValues.genre_id,
    };

    if (!payload.title || !payload.description || !payload.genre_id) {
      message.error("Missing required book details.");
      return;
    }

    try {
      setLoading(true);
      const response = await CreateBookApi(payload);
      message.success(response?.data?.message || "Book created successfully");
      navigate("/dashboard");
    } catch (error) {
      const apiMessage = error?.response?.data?.message;

      // 🔹 If insufficient credits and not retried yet, open pricing modal
      if (apiMessage === "Insufficient credit remaining." && !hasRetried) {
        setHasRetried(true);
        setOpenPricing(true);
      } else {
        message.error(apiMessage || "Failed to create book.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>

        <div className="card">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Book Details</h2>
              <p className="description">
                Provide some basic information to get started
              </p>

              <Form
                layout="vertical"
                form={form}
                initialValues={formValues}
                onValuesChange={(_, allValues) => setFormValues(allValues)}
              >
                <Form.Item
                  label="Book Title *"
                  name="title"
                  rules={[{ required: true, message: "Enter book title" }]}
                >
                  <Input placeholder="Enter your book title" />
                </Form.Item>

                <Form.Item
                  label="Genre *"
                  name="genre_id"
                  rules={[{ required: true, message: "Select genre" }]}
                >
                  <Select placeholder="Select a genre">
                    {genres.map((g) => (
                      <Select.Option key={g.id} value={g.id}>
                        {g.title}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Short Description *"
                  name="description"
                  rules={[{ required: true, message: "Enter description" }]}
                >
                  <TextArea
                    placeholder="Describe your book..."
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
              <p className="description">Confirm details and create your book</p>

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
                  loading={loading}
                  onClick={handleCreateBook}
                >
                  Create Project
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="navigation">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            icon={<ArrowLeft />}
          >
            Previous
          </Button>

          {currentStep < totalSteps && (
            <Button type="primary" onClick={handleNext} icon={<ArrowRight />}>
              Next
            </Button>
          )}
        </div>
      </main>

      <Modal
        open={openPricing}
        footer={null}
        onCancel={() => setOpenPricing(false)}
        width={900}
        destroyOnClose
      >
        <PricingCards
          onPaymentDone={() => {
            setOpenPricing(false);
            handleCreateBook(); // retry automatically
          }}
        />
      </Modal>
    </div>
  );
};

export default CreateBook;
