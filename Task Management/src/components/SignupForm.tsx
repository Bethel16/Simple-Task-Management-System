import React, { useState } from "react";
import axios from "axios";

interface AuthFormProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// CSRF token utility function
const getCSRFToken = (): string | null => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return csrfToken ? csrfToken.split("=")[1] : null;
};

const AuthForm: React.FC<AuthFormProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");

  const formBg = isDarkMode ? "#1e1e2f" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const inputBg = isDarkMode ? "#2a2a3e" : "#f8f9fa";
  const inputTextColor = isDarkMode ? "#ffffff" : "#000000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match for Sign-Up
    if (formData.password !== formData.password2) {
      setError("Passwords do not match!");
      return;
    }

    const csrfToken = getCSRFToken();
    const url = "http://localhost:8000/api/register/";

    try {
      // Make the API request
      const response = await axios.post(
        url,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
        }
      );

      console.log("User registered:", response.data);
      setError(""); // Clear previous errors
      alert("Registration successful! You can now log in.");
    } catch (err) {
      // Improved error handling
      if (axios.isAxiosError(err) && err.response) {
        console.error("Error Response:", err.response.data);
        setError(err.response.data.error || "An error occurred. Please try again.");
      } else {
        console.error("Unexpected Error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundColor: formBg,
        color: textColor,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Form Title */}
      <h2 className="auth-title">Create Your Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* First Name and Last Name fields */}
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
            style={{ backgroundColor: inputBg, color: inputTextColor }}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
            style={{ backgroundColor: inputBg, color: inputTextColor }}
            placeholder="Enter your last name"
            required
          />
        </div>

        {/* Username and Email fields */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            style={{ backgroundColor: inputBg, color: inputTextColor }}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            style={{ backgroundColor: inputBg, color: inputTextColor }}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password fields */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            style={{ backgroundColor: inputBg, color: inputTextColor }}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            name="password2"
            className="form-control"
            value={formData.password2}
            onChange={handleChange}
            style={{ backgroundColor: inputBg, color: inputTextColor }}
            placeholder="Confirm your password"
            required
          />
        </div>

        {/* Error message */}
        {error && <p className="error-message text-danger">{error}</p>}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary auth-btn">
          Sign Up
        </button>
      </form>


      <p className="auth-toggle-text">
       "Already have an account?
        <button
          className="btn btn-link auth-toggle-btn"
          
        >
          <a href="/login"> Login</a>
        </button>
      </p>

      {/* Dark mode toggle */}
      <button className="btn dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <i className="fa fa-sun-o"></i> : <i className="fa fa-moon-o"></i>}
      </button>
    </div>
  );
};

export default AuthForm;
