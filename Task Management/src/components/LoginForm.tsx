import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/App.css";

interface LoginFormProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setIsLoggedIn: (value: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  isDarkMode,
  toggleDarkMode,
  setIsLoggedIn,
}) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/login/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      localStorage.setItem("userData", JSON.stringify(response.data));
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.detail || "An error occurred. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className={`login-dark ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <form onSubmit={handleSubmit}>
        <div className="illustration">
          <i className="fa fa-user-circle"></i>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
            placeholder="Username"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
        <a href="/signup" className="forgot">
        Don't Have an Account? Sign Up
        </a>
      </form>
      <button className="btn dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? (
          <i className="fa fa-sun-o"></i>
        ) : (
          <i className="fa fa-moon-o"></i>
        )}
      </button>
    </div>
  );
};

export default LoginForm;
