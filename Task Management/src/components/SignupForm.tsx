import React, { useState } from "react";
import axios from "axios";
import { Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

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
      setShowToast(true); // Show the success toast
      navigate("/login");

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
    <div className={`login-dark ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <form onSubmit={handleSubmit}>
        <h2 className="auth-title">Create Your Account</h2>

        {/* First Name and Last Name fields */}
        <div className="form-group">
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
        </div>

        {/* Username and Email fields */}
        <div className="form-group">
          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>

        {/* Password fields */}
        <div className="form-group">
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password2"
            className="form-control"
            value={formData.password2}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
        </div>

        {/* Error message */}
        {error && <div className="error-message text-danger">{error}</div>}

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>

        {/* Toggle between Login and Sign-Up */}
        <p className="auth-toggle-text">
          Already have an account?
          <a href="/login" className="auth-toggle-btn">Login</a>
        </p>
      </form>

      {/* Dark Mode Toggle */}
      <button className="btn dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <i className="fa fa-sun-o"></i> : <i className="fa fa-moon-o"></i>}
      </button>

      {/* Toast Container */}
      <ToastContainer position="top-center" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg="success"
          delay={3000}
          autohide
          style={{ minWidth: "300px", width: "fit-content" }}
        >
          <Toast.Body>Registration successful! You can now log in.</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AuthForm;
