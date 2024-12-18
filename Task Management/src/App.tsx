import React, { useState } from "react";
import "./styles/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "font-awesome/css/font-awesome.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import React Router
import AuthForm from "./components/SignupForm"; // This can be your login/signup form
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  const [isDarkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <Routes>
        {/* Route for Login */}
        <Route
          path="/login"
          element={<LoginForm isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Route for Signup */}
        <Route
          path="/signup"
          element={<AuthForm isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
        />

        {/* Route for Dashboard */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard />
            ) : (
              <LoginForm isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />

        {/* Main App Route */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <div
                className="app-container"
                style={{
                  display: "flex",
                  backgroundColor: isDarkMode ? "#121212" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#000000",
                  minHeight: "100vh",
                  transition: "background-color 0.3s, color 0.3s",
                }}
              >
                <Dashboard />
              </div>
            ) : (
              <LoginForm isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
