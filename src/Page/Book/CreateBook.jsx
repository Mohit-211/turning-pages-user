import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText, X } from "lucide-react";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import { CreateBookApi } from "../../api/operations/book.api";
import PricingCards from "../../Sections/PaymentPage/PricingPage"; // keep your component
import "./CreateBook.scss";

const CreateBook = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [hasRetried, setHasRetried] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    genre_id: "",
 
    description: "",
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    GetAllGenreApi()
      .then((res) => {
        setGenres(res?.data?.data || []);
      })
      .catch(() => alert("Failed to load genres"))
      .finally(() => setLoadingGenres(false));
  }, []);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Book title is required";
    if (!formData.genre_id) newErrors.genre_id = "Please select a genre";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handlePrevious = () => setStep(1);
console.log(formData,"formData")
  const handleCreate = async () => {
    setLoadingCreate(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre_id: formData.genre_id,
      };

      const res = await CreateBookApi(payload);
      alert(res?.data?.message || "Book created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create book";

      if (msg.includes("Insufficient credit") && !hasRetried) {
        setHasRetried(true);
        setShowPricing(true);
      } else {
        alert(msg);
      }
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="create-book">
      <header className="header">
        <div className="header-container">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <div className="logo-title">
            <span className="emoji">📖</span>
            <span>Turning Pages</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h1>Create a New Book</h1>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="wizard-card">
          {step === 1 && (
            <div className="step">
              <h2>Book Details</h2>
              <p className="step-desc">Let's start with the basics</p>

              {loadingGenres ? (
                <div className="skeleton-form">
                  <div className="skeleton-line long" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line long" />
                </div>
              ) : (
                <form className="book-form">
                  <div className="form-field">
                    <label>Book Title *</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter book title"
                      className={errors.title ? "input-error" : ""}
                    />
                    {errors.title && (
                      <span className="error">{errors.title}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>Genre *</label>
                    <select
  value={formData.genre_id}
  onChange={(e) => {
    const selected = genres.find(
      (g) => g.id === Number(e.target.value)
    );

    setFormData({
      ...formData,
      genre_id: selected.id,
      genre_title: selected.title
    });
  }}
>
  <option value="">Select Genre</option>

  {genres.map((g) => (
    <option key={g.id} value={g.id}>
      {g.title}
    </option>
  ))}
</select>
                    {errors.genre_id && (
                      <span className="error">{errors.genre_id}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>Short Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your book in a few sentences..."
                      rows={5}
                      maxLength={3000}
                      className={errors.description ? "input-error" : ""}
                    />
                    {errors.description && (
                      <span className="error">{errors.description}</span>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="step">
              <h2>Review & Create</h2>
              <p className="step-desc">Confirm everything looks good</p>

              <div className="review-box">
                <div className="review-item">
                  <FileText size={18} />
                  <div>
                    <strong>Title</strong>
                    <p>{formData.title || "—"}</p>
                  </div>
                </div>

                <div className="review-item">
                  <strong>Genre</strong>
                  <p>
                    {genres.find((g) => g.id === formData.genre_id)?.title ||
                      "—"}
                  </p>
                </div>

                <div className="review-item">
                  <strong>Description</strong>
                  <p>{formData.description || "—"}</p>
                </div>
              </div>

              <div className="create-action">
                <button
                  className="btn-create"
                  onClick={handleCreate}
                  disabled={loadingCreate}
                >
                  {loadingCreate ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-controls">
          <button
            className="btn-nav prev"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {step < totalSteps && (
            <button className="btn-nav next" onClick={handleNext}>
              Next <ArrowRight size={18} />
            </button>
          )}
        </div>
      </main>

      {/* Pricing overlay */}
      {showPricing && (
        <div className="pricing-overlay">
          <div className="pricing-modal">
            <button
              className="close-pricing"
              onClick={() => setShowPricing(false)}
            >
              <X size={24} />
            </button>
            <PricingCards
              onPaymentDone={() => {
                setShowPricing(false);
                handleCreate(); // retry
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBook;
