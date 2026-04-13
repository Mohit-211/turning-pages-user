import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileText, BookOpen, Tag, AlignLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import { CreateBookApi } from "../../api/operations/book.api";
import PricingCards from "../../Sections/PaymentPage/PricingPage";
import "./CreateBook.scss";
import { Button, Modal, message } from "antd";

const TOTAL_STEPS = 2;

const CreateBook = () => {
  const navigate = useNavigate();

  const [creditModal, setCreditModal] = useState(false);
  const [step, setStep] = useState(1);
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [userCredit, setUserCredit] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    genre_id: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const progress = (step / TOTAL_STEPS) * 100;

  useEffect(() => {
    GetAllGenreApi()
      .then((res) => setGenres(res?.data?.data || []))
      .catch(() => message.error("Failed to load genres"))
      .finally(() => setLoadingGenres(false));
  }, []);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Book title is required";
    if (!formData.genre_id) newErrors.genre_id = "Please select a genre";
    if (!formData.description.trim()) newErrors.description = "Description is required";
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

const handleCreate = async () => {
  setLoadingCreate(true);

  try {
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      genre_id: formData.genre_id,
    };

    const res = await CreateBookApi(payload);

    message.success(
      res?.data?.message || "Book created successfully!"
    );

    navigate("/dashboard");

  } catch (err) {
    const msg = err?.response?.data?.message || "";

    // ✅ ONLY FOR INSUFFICIENT CREDIT → SHOW MODAL
    if (msg.toLowerCase().includes("insufficient credit remaining")) {
      setCreditModal(true);
    } 

  } finally {
    setLoadingCreate(false);
  }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectedGenre = genres.find((g) => g.id === formData.genre_id);

  return (
    <div className="create-book">


      {/* ── MAIN ── */}
      <main className="cb-main">


        {/* Stepper */}
        <div className="cb-stepper">
          {[
            { n: 1, label: "Book details" },
            { n: 2, label: "Review & publish" },
          ].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className={`cb-step ${step === n ? "is-active" : step > n ? "is-done" : ""}`}>
                <div className="cb-step__circle">
                  {step > n ? <CheckCircle2 size={14} /> : n}
                </div>
                <span className="cb-step__label">{label}</span>
              </div>
              {i < 1 && (
                <div className={`cb-step__connector ${step > 1 ? "is-done" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="cb-card">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="cb-form-step">
              <div className="cb-card__head">
                <h2>Book details</h2>
                <p>Fill in the basics — you can edit these later.</p>
              </div>

              {loadingGenres ? (
                <div className="cb-skeleton">
                  {[80, 60, 100].map((w, i) => (
                    <div key={i} className="cb-skeleton__line" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <form className="cb-form" onSubmit={(e) => e.preventDefault()}>

                  {/* Title */}
                  <div className={`cb-field ${errors.title ? "has-error" : ""}`}>
                    <label htmlFor="title">
                      <FileText size={14} />
                      Book title <span className="required">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. The Midnight Garden"
                      maxLength={100}
                      autoFocus
                    />
                    <div className="cb-field__meta">
                      {errors.title
                        ? <span className="cb-field__error">{errors.title}</span>
                        : <span className="cb-field__hint">Max 100 characters</span>
                      }
                      <span className="cb-field__count">{formData.title.length}/100</span>
                    </div>
                  </div>

                  {/* Genre */}
                  <div className={`cb-field ${errors.genre_id ? "has-error" : ""}`}>
                    <label htmlFor="genre">
                      <Tag size={14} />
                      Genre <span className="required">*</span>
                    </label>
                    <select
                      id="genre"
                      value={formData.genre_id}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, genre_id: Number(e.target.value) }));
                        if (errors.genre_id) setErrors((prev) => ({ ...prev, genre_id: "" }));
                      }}
                    >
                      <option value="">Select a genre…</option>
                      {genres.map((g) => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                    {errors.genre_id && (
                      <span className="cb-field__error">{errors.genre_id}</span>
                    )}
                  </div>

                  {/* Description */}
                  <div className={`cb-field ${errors.description ? "has-error" : ""}`}>
                    <label htmlFor="description">
                      <AlignLeft size={14} />
                      Short description <span className="required">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Give readers a glimpse of your book…"
                    />
                    {errors.description
                      ? <span className="cb-field__error">{errors.description}</span>
                      : <span className="cb-field__hint">Appears on the book listing page.</span>
                    }
                  </div>

                </form>
              )}
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="cb-review-step">
              <div className="cb-card__head">
                <h2>Review & publish</h2>
                <p>Double-check before publishing — this costs 1 credit.</p>
              </div>
{/* 
              <div className="cb-credit-notice">
                <AlertTriangle size={15} />
                <span>Publishing uses <strong>1 credit</strong> from your balance.</span>
              </div> */}

              <div className="cb-review">
                <div className="cb-review__row">
                  <span className="cb-review__key">Title</span>
                  <span className="cb-review__val">{formData.title || "—"}</span>
                </div>
                <div className="cb-review__row">
                  <span className="cb-review__key">Genre</span>
                  <span className="cb-review__val">
                    {selectedGenre
                      ? <span className="cb-badge">{selectedGenre.title}</span>
                      : "—"
                    }
                  </span>
                </div>
                <div className="cb-review__row">
                  <span className="cb-review__key">Description</span>
                  <span className="cb-review__val cb-review__val--desc">
                    {formData.description || "—"}
                  </span>
                </div>
              </div>

              <button
                className="cb-btn cb-btn--publish"
                onClick={handleCreate}
                disabled={loadingCreate}
              >
                {loadingCreate ? (
                  <>
                    <span className="cb-spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <BookOpen size={16} />
                    Create book
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Nav controls */}
        <div className="cb-nav">
          <button
            className="cb-btn cb-btn--ghost"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {step < TOTAL_STEPS && (
            <button className="cb-btn cb-btn--primary" onClick={handleNext}>
              Continue <ArrowRight size={16} />
            </button>
          )}
        </div>

      </main>

      {/* ── CREDIT MODAL ── */}
      <Modal
        open={creditModal}
        onCancel={() => setCreditModal(false)}
        footer={null}
        centered
        width={400}
        className="cb-modal"
      >
        <div className="cb-modal__body">
          <div className="cb-modal__icon">
            <AlertTriangle size={26} />
          </div>
          <h3>Not enough credits</h3>
          <p>
            You need at least <strong>1 credit</strong> to publish a book.
            Top up your account to continue.
          </p>
          <Button
            type="primary"
            size="large"
            block
            onClick={() => {
              setCreditModal(false);
              navigate("/dashboard/payment", { state: { from: "create_book" } });
            }}
          >
            Buy credits
          </Button>
          <button
            className="cb-modal__cancel"
            onClick={() => setCreditModal(false)}
          >
            Maybe later
          </button>
        </div>
      </Modal>

      {/* ── PRICING OVERLAY ── */}
      {showPricing && (
        <div className="cb-overlay">
          <div className="cb-overlay__modal">
            <button
              className="cb-overlay__close"
              onClick={() => setShowPricing(false)}
            >
              ✕
            </button>
            <PricingCards
              onPaymentDone={() => {
                setShowPricing(false);
                handleCreate();
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateBook;