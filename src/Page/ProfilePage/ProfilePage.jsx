import React, { useEffect, useState } from "react";
import {
  UpdateUserProfileApi,
  UserProfileApi,
} from "../../api/users/users.api";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const loadProfile = async () => {
    try {
      const res = await UserProfileApi();
      const data = res?.data?.data;
      setUser(data);

      setFormData({
        name: data?.user_profile?.name || "",
        mobile: data?.user_profile?.mobile || "",
        email: data?.email || "",
      });
    } catch (error) {
      console.error("Failed to load profile", error);
      alert("Could not load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Invalid mobile number format";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await UpdateUserProfileApi(formData);
      alert("Profile updated successfully");
      loadProfile(); // refresh data
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page loading">
        <div className="skeleton-header" />
        <div className="skeleton-form">
          <div className="skeleton-line long" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Optional: subtle gradient cover instead of image */}
      {/* <div className="cover-photo" /> */}

      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-section">
            <div className="avatar-placeholder">
              {user?.user_profile?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <button className="edit-avatar" title="Change avatar (coming soon)">
              ✎
            </button>
          </div>

          <div className="user-details">
            <h2 className="username">
              {user?.user_profile?.name || "Your Name"}
            </h2>
            <p className="email-display">{user?.email || "—"}</p>
          </div>
        </div>

        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="form-section">
        <h3>Personal Details</h3>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={errors.mobile ? "input-error" : ""}
              />
              {errors.mobile && (
                <span className="error-text">{errors.mobile}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="input-disabled"
              />
            </div>
          </div>

          {/* Optional submit button at bottom for mobile */}
          <button
            type="submit"
            className="save-btn mobile-only"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
