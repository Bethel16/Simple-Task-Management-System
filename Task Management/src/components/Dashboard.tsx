import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "font-awesome/css/font-awesome.min.css";
import NavBar from "./NavBar";
import SideBar from "./SideBar";
import TaskCards from "./TaskList";
import { Modal, Button, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loginToast, setLoginToast] = useState(false);
  const [taskToast, setTaskToast] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    date: "",
    is_important: false,
    status: "Incomplete",
  });

  useEffect(() => {
    // Show the login success toast when Dashboard loads
    setLoginToast(true);
    const timeout = setTimeout(() => {
      setLoginToast(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []); // Run only when the component mounts

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  const sidebarWidth = isSidebarCollapsed ? 80 : 250;

  const handleAddTask = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setTaskData({
        ...taskData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setTaskData({
        ...taskData,
        [name]: value,
      });
    }
  };

  const handleSaveTask = async () => {
    try {
      // Retrieve the user data from localStorage
      const userData = localStorage.getItem('userData');
      
      // Check if userData exists
      if (userData) {
        const parsedUserData = JSON.parse(userData);
  
        if (parsedUserData && parsedUserData.id) {
          const userId = parsedUserData.id;
  
          // Create task request
          const response = await axios.post("http://localhost:8000/api/create-task/", {
            ...taskData,
            created_by: userId,
          });
          if (response.status === 201) {
            setTaskToast(true); // Show success toast for task creation
            setTimeout(() => {
              setTaskToast(false); // Hide the toast after 3 seconds
              setShowModal(false); // Close the modal
              setTaskData({
                title: "",
                description: "",
                date: "",
                is_important: false,
                status: "Incomplete",
              });
            }, 3000); // Toast delay time
          }
        } else {
          alert("User ID not found. Please log in.");
        }
      } else {
        alert("No user data found. Please log in.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };
  
  
  
  return (
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
      {/* Sidebar */}
      <SideBar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Navbar */}
      <NavBar sidebarWidth={sidebarWidth} isDarkMode={isDarkMode} />

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          marginLeft: `${sidebarWidth}px`,
          marginTop: "56px",
          transition: "margin-left 0.3s, margin-top 0.3s",
          width: "100%",
        }}
      >
        {/* Add Task Button */}
        <div className="container mt-4">
          <button
            className="btn btn-success add-task-btn"
            onClick={handleAddTask}
          >
            <i className="fa fa-plus me-2"></i> Add Task
          </button>
        </div>

        {/* Task Cards */}
        <TaskCards />

        {/* Modal for Add Task */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              {/* Title */}
              <div className="mb-3">
                <label htmlFor="task-title" className="form-label">
                  Task Title
                </label>
                <input
                  type="text"
                  id="task-title"
                  name="title"
                  className="form-control"
                  placeholder="Enter task title"
                  value={taskData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="task-desc" className="form-label">
                  Description
                </label>
                <textarea
                  id="task-desc"
                  name="description"
                  className="form-control"
                  rows={3}
                  placeholder="Enter task description"
                  value={taskData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* Date */}
              <div className="mb-3">
                <label htmlFor="task-date" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  id="task-date"
                  name="date"
                  className="form-control"
                  value={taskData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Mark as Important */}
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="task-important"
                  name="is_important"
                  checked={taskData.is_important}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="task-important">
                  Mark as Important
                </label>
              </div>

              {/* Status */}
              <div className="mb-3">
                <label htmlFor="task-status" className="form-label">
                  Status
                </label>
                <select
                  id="task-status"
                  name="status"
                  className="form-control"
                  value={taskData.status}
                  onChange={handleInputChange}
                >
                  <option value="Incomplete">Incomplete</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTask}>
              Save Task
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast for User Login */}
        <ToastContainer position="top-center" className="p-3">
          <Toast
            onClose={() => setLoginToast(false)}
            show={loginToast}
            delay={3000}
            autohide
            bg="info"
          >
            <Toast.Header>
              <i className="fa fa-info-circle text-info me-2"></i>
              <strong className="me-auto">Login Successful</strong>
              <small>Just Now</small>
            </Toast.Header>
            <Toast.Body>Welcome to your dashboard!</Toast.Body>
          </Toast>
        </ToastContainer>

        {/* Toast for Task Creation */}
        <ToastContainer position="top-center" className="p-3">
          <Toast
            onClose={() => setTaskToast(false)}
            show={taskToast}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header>
              <i className="fa fa-check-circle text-success me-2"></i>
              <strong className="me-auto">Task Created</strong>
              <small>Just Now</small>
            </Toast.Header>
            <Toast.Body>Your task has been added successfully!</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

export default Dashboard;
