// src/components/WorkerForm.jsx
// UPDATED: Uses services[] string array instead of workerTypes{} boolean object
import React, { useState } from "react";
import axios from "axios";
import "./WorkerForm.css";
import { useNavigate } from "react-router-dom";

const SERVICES = [
  { key: "Electrician", label: "Electrician", desc: "Wiring & fixture installation" },
  { key: "Plumber", label: "Plumber", desc: "Pipes & sanitation systems" },
  { key: "Carpenter", label: "Carpenter", desc: "Woodwork & furniture repair" },
  { key: "Daily Labour", label: "Daily Labour", desc: "General daily work support" },
  { key: "Skilled Labour", label: "Skilled Labour", desc: "Specialized skilled tasks" },
  { key: "Driver", label: "Driver", desc: "Vehicle driving services" },
  { key: "AC Technician", label: "AC Technician", desc: "Cooling system services" },
  { key: "Security", label: "Security", desc: "Security guard services" },
  { key: "Watchman", label: "Watchman", desc: "Night watch & premises guard" },
  { key: "Office Boy", label: "Office Boy", desc: "Office support & errands" },
  { key: "Housekeeping", label: "Housekeeping", desc: "Cleaning & maintenance" },
];

const WorkerForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    services: [],
    address: "",
    city: "",
    state: "",
    email: "",
    age: "",
    gender: "",
    country: "",
    costPerHour: "",
    aadharNumber: "",
    panNumber: "",
    profilePhoto: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (serviceKey) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceKey);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== serviceKey)
          : [...prev.services, serviceKey],
      };
    });
  };

  // Handle file input for profile photo
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profilePhoto: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate Aadhar
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12 || !/^\d{12}$/.test(formData.aadharNumber)) {
      setError("Aadhar number must be exactly 12 digits.");
      return;
    }

    // Validate PAN (optional — only check format if a value was entered)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.panNumber && !panRegex.test(formData.panNumber)) {
      setError("PAN number format must be: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).");
      return;
    }

    // Prepare form data (multipart) to include file and text fields
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("services", JSON.stringify(formData.services));
    data.append("address", formData.address);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("country", formData.country);
    data.append("email", formData.email);
    data.append("age", formData.age);
    data.append("gender", formData.gender);
    data.append("costPerHour", formData.costPerHour);
    data.append("aadharNumber", formData.aadharNumber);
    data.append("panNumber", formData.panNumber);
    if (formData.profilePhoto) {
      data.append("profilePhoto", formData.profilePhoto);
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/worker-form`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/workers-dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Submission failed. Please check all fields.");
    }
  };

  return (
    <div className="worker-form-container">
      <div className="form-header">
        <div className="header-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h1>Professional Profile Setup</h1>
        <p>Register your service details to start getting clients</p>
      </div>

      <form className="worker-form" onSubmit={handleSubmit}>

        {/* ── Inline error ── */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#ef4444',
            fontSize: '13px',
            marginBottom: '20px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ex: Michael Chen"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Ex: +91 98765 43210"
              required
            />
          </div>
        </div>

        <fieldset className="skills-section">
          <legend>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            Offered Services
          </legend>
          <div className="checkbox-grid">
            {SERVICES.map((svc) => (
              <label
                key={svc.key}
                className={`checkbox-label ${formData.services.includes(svc.key) ? "checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={formData.services.includes(svc.key)}
                  onChange={() => handleServiceToggle(svc.key)}
                />
                <span className="checkmark"></span>
                <span className="service-title">{svc.label}</span>
                <span className="service-desc">{svc.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-group">
          <label>Service Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ex: 123 Main St, Apt 4B | Include landmarks if needed"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex: Hyderabad"
              required
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Ex: Telangana"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Ex: India"
            required
          />
        </div>

        <div className="form-group">
          <label>Professional Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ex: contact@services.com"
            required
          />
        </div>

        {/* ── Aadhar Number ── */}
        <div className="form-row">
          <div className="form-group">
            <label>Aadhar Number *</label>
            <input
              type="text"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                setError("");
                setFormData(prev => ({ ...prev, aadharNumber: val }));
              }}
              placeholder="Enter 12-digit Aadhar number"
              maxLength={12}
              required
            />
            <span className="wf-hint">{formData.aadharNumber.length}/12 digits</span>
          </div>

          {/* ── PAN Number (optional) ── */}
          <div className="form-group">
            <label>PAN Card Number </label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={e => {
                const val = e.target.value.toUpperCase().slice(0, 10);
                setError("");
                setFormData(prev => ({ ...prev, panNumber: val }));
              }}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}

            />
            <span className="wf-hint">Format: 5 letters, 4 digits, 1 letter</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Ex: 28"
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Complete Professional Profile
          <svg className="arrow-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default WorkerForm;
