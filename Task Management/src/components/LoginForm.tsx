import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setIsLoggedIn: (value: boolean) => void; // Pass it as a function
}

const LoginForm: React.FC<LoginFormProps> = ({ isDarkMode, toggleDarkMode, setIsLoggedIn }) => {
  const formBg = isDarkMode ? "#1e1e2f" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const inputBg = isDarkMode ? "#2a2a3e" : "#f8f9fa";
  const inputTextColor = isDarkMode ? "#ffffff" : "#000000";

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8000/api/login/', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
  
      // Store user data and redirect to dashboard
      localStorage.setItem('userData', JSON.stringify(response.data));
      console.log(response.data);
      
      // Set logged-in state to true
      setIsLoggedIn(true); // Update state to indicate the user is logged in
      
      navigate('/dashboard');
    } catch (err: unknown) {
      // Check if it's an Axios error and handle it
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.detail || 'An error occurred. Please try again.');
      } else {
        // Handle generic errors
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundColor: formBg,
        color: textColor,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2 className="login-title">Welcome Back</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Username Input */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
            style={{
              backgroundColor: inputBg,
              color: inputTextColor,
            }}
            placeholder="Enter your username"
            required
          />
        </div>
        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            style={{
              backgroundColor: inputBg,
              color: inputTextColor,
            }}
            placeholder="Enter your password"
            required
          />
        </div>
        {/* Error message */}
        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
        {/* Submit Button */}
        <button type="submit" className="btn btn-primary login-btn">
          Login
        </button>
      </form>
      {/* Dark Mode Toggle */}
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
