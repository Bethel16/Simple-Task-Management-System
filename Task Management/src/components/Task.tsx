import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

interface SideBarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onBoardSelect: (boardId: number) => void;  // New prop to pass the selected board ID
}


interface Profile {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image: string | null;
  }
  
  interface UserProfileResponse {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile: Profile;
  }
interface Board {
  id: number;
  title: string;
}

const SideBar: React.FC<SideBarProps> = ({
  isCollapsed,
  toggleSidebar,
  isDarkMode,
  toggleDarkMode,
  onBoardSelect
}) => {
  const sidebarBg = isDarkMode ? "#1e1e2f" : "#f8f9fa";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState(""); // State for new board title

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBoardTitle(e.target.value);
  };

  const handleSaveBoard = async () => {
    try {
      // Sending the board data to the API
      const response = await axios.post(
        `http://localhost:8000/api/create-board/`, // Update the API URL if needed
        {
          title: newBoardTitle, // Data to send in the body
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure correct headers
          },
        }
      );

      // Assuming the API returns the newly created board
      const newBoard: Board = response.data;

      // Update state with the new board
      setBoards((prevBoards) => [...prevBoards, newBoard]);

      // Clear the input and close the modal
      setNewBoardTitle("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create the board. Please try again.");
    }
  };

  

  useEffect(() => {
    // Retrieve profile data from localStorage
    const storedProfile = localStorage.getItem('userData');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      setProfile(null);
    }

    // Fetch boards data from the API
    const fetchBoards = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/boards/', {
          headers: {
            "Content-Type": "application/json", // Ensure correct headers
          },
        });

        // Set boards data to state
        setBoards(response.data.boards);
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };

    fetchBoards(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('csrfToken');
    window.location.href = '/login'; // Redirect to login after logout
  };

  if (!profile) {
    return <h6>No profile data available. Please log in.</h6>;
  }

  return (
    <div
      className="sidebar"
      style={{
        backgroundColor: sidebarBg,
        color: textColor,
        width: isCollapsed ? "80px" : "250px",
        transition: "width 0.3s",
        minHeight: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >


        {/* Toggle Button */}
      <div
        className="d-flex justify-content-end align-items-center"
        style={{
          height: "56px",
          padding: "0 10px",
          borderBottom: isDarkMode ? "1px solid #333" : "1px solid #ddd",
        }}
      >
        <button
          onClick={toggleSidebar}
          className="btn btn-light"
          style={{
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "16px",
          }}
        >
          <i className={`fa ${isCollapsed ? "fa-angle-right" : "fa-angle-left"}`}></i>
        </button>
      </div>

      {/* Profile Section */}
      <div className="text-center py-4">
        <img
          src={'http://localhost:8000' + profile.profile.profile_image}
          alt="Profile"
          className="rounded-circle"
          style={{ width: "50px", height: "50px" }}
        />
        {!isCollapsed && <p className="mt-2">{profile.username}</p>}

        <button className="btn btn-primary add-task-btn" onClick={handleLogout}>
          <i className="fa fa-sign-out" aria-hidden="true"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      {/* Sidebar Content */}
      <div className="d-flex justify-content-end align-items-center">
        <button
          onClick={toggleSidebar}
          className="btn btn-light"
          style={{
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "16px",
          }}
        >
          <i className={`fa ${isCollapsed ? "fa-angle-right" : "fa-angle-left"}`}></i>
        </button>
      </div>

      <ul className="nav flex-column mt-4">
        <li className="nav-item mb-3">
          <a href="#" className="nav-link text-black">
            <i className="fa fa-clipboard me-2" aria-hidden="true"></i>
            {!isCollapsed && <span>Boards</span>}
          </a>
        </li>
        {boards.map((board) => (
          <li key={board.id} className="nav-item mb-3">
            <a
              href="#"
              className="nav-link text-black"
              onClick={() => onBoardSelect(board.id)}  // Pass the selected board ID
            >
              <i className="fa fa-circle me-2" aria-hidden="true"></i>
              {!isCollapsed && <span>{board.title}</span>}
            </a>
          </li>
        ))}
        <li>
          <button
            className="btn btn-success add-task-btn"
            onClick={handleShowModal}
          >
            <i className="fa fa-plus me-2"></i>
            {!isCollapsed && <span>Add Board</span>}
          </button>
        </li>
      </ul>

      {/* Dark Mode Toggle */}
      <button
        className="btn btn-light mt-auto"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? <i className="fa fa-sun-o" aria-hidden="true"></i> : <i className="fa fa-moon-o" aria-hidden="true"></i>}
      </button>

      {/* Create Board Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Board</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>


            <div className="mb-3">
              <label htmlFor="task-title" className="form-label">
                Board Title
              </label>
              <input
                type="text"
                id="task-title"
                name="title"
                className="form-control"
                placeholder="Enter board title"
                value={newBoardTitle}
                onChange={handleInputChange}
                required
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBoard}>
            Save Board
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SideBar;
