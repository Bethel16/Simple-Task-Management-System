import React, { useState, useEffect } from "react";
import { Modal, Button , Toast, ToastContainer} from "react-bootstrap";
import axios from "axios";

interface SideBarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onBoardSelect: (boardId: number , boardname : string) => void; // New prop to pass the selected board ID
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
  onBoardSelect,
}) => {
  const sidebarBg = isDarkMode ? "#1e1e2f" : "#f8f9fa";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState(""); // State for new board title
  const [taskToast, setTaskToast] = useState<boolean>(false);
  const [showProfileEdit, setshowProfileEdit] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Profile | null>(null);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };


  const handleEditShowModal = () => {
    const storedProfile = localStorage.getItem("userData");
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile) as UserProfileResponse;
      console.log(parsedProfile);
      console.log(parsedProfile.profile)
      setEditProfileData(parsedProfile.profile);
    }
    setshowProfileEdit(true);
  };  
  const handleEditCloseModal = () => {
    setshowProfileEdit(false);
  };

  const handleSaveBoard = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/create-board/`, // Update the API URL if needed
        {
          title: newBoardTitle,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newBoard: Board = response.data;
      console.log(newBoard)
      setBoards((prevBoards) => {
        console.log("Previous Boards:", prevBoards); // Log the previous state
        const updatedBoards = [...prevBoards, newBoard]; // Compute the new state
        console.log("Updated Boards:", updatedBoards); // Log the updated state
        return updatedBoards; // Update the state
      });
      setTaskToast(true);
      setNewBoardTitle("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create the board. Please try again.");
    }
  };


  const handleInpuProfiletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditProfileData((prevData) =>
      prevData ? { ...prevData, [name]: value } : null
    );
  };
  
  useEffect(() => {
    const storedProfile = localStorage.getItem("userData");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      setEditProfileData(JSON.parse(storedProfile).profile);

    } else {
      setProfile(null);
    }

    const fetchBoards = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/boards/", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setBoards(response.data.boards);
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };

    fetchBoards(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("csrfToken");
    window.location.href = "/login";
     // Redirect to login after logout
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBoardTitle(e.target.value);
  };


  const handleSaveProfile = async () => {
    if (editProfileData) {
      try {
        const response = await axios.put(
          "http://localhost:8000/api/update-profile/", // Replace with your API URL
          editProfileData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        localStorage.setItem("userData", JSON.stringify(response.data));
        setProfile(response.data); // Update profile state
        setEditProfileData(response.data.profile); // Sync updated data in modal
        setTaskToast(true); // Show toast
        handleEditCloseModal(); // Close the modal
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const generateAvatar = (email: string | null) => {
    const hash = email
      ? new TextEncoder().encode(email.trim().toLowerCase()).reduce((acc, curr) => acc + curr, 0)
      : 0;
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
    return gravatarUrl;
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
        overflowY: "auto",
        zIndex: 10,
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
  
    
      <div className="text-center py-4 profile-container">
  <div className="profile-image-container">
    <img
      src={
        profile.profile.profile_image
          ? `http://localhost:8000/${profile.profile.profile_image}`
          : generateAvatar(profile.profile.email)
      }
      alt="Profile"
      className="rounded-circle profile-img"
      style={{
        width: isCollapsed ? "50px" : "120px",
        height: isCollapsed ? "50px" : "120px",
        transition: "width 0.3s ease, height 0.3s ease",
      }}
    />
    {!isCollapsed && (
      <button
        className="edit-icon-btn"
        onClick={handleEditShowModal}
        title="Edit Profile"
      >
        <i className="fa fa-pencil" aria-hidden="true"></i>
      </button>
    )}
  </div>

  {!isCollapsed && (
    <p className="mt-2 profile-username">{profile.username}</p>
  )}

  <button
    className="btn btn-primary add-task-btn d-flex align-items-center mt-3"
    onClick={handleLogout}
  >
    <i className="fa fa-sign-out me-2" aria-hidden="true"></i>
    {!isCollapsed && <span>Logout</span>}
  </button>
</div>

  
     {/* Boards Section */}
<div style={{ maxHeight: "400px", overflowY: "auto", paddingLeft: "15px" }}>
 {/* Add Board Button */}
<div
  className="d-flex align-items-center mb-3"
  style={{
    justifyContent: isCollapsed ? "center" : "space-between", // Center when collapsed, space-between when expanded
    alignItems: "center", // Ensure vertical alignment of the elements
  }}
>
  {/* Center align Boards text */}
  {!isCollapsed && (
    <span
      style={{
        color: textColor,
        fontSize: "16px",
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        textAlign: "center", // This centers the text
        flexGrow: 1, // Allow Boards text to take up available space
      }}
    >
      Boards
    </span>
  )}

  {/* Add Board Button */}
  <button
    className="btn btn-success"
    onClick={handleShowModal}
    style={{
      backgroundColor: "#28a745",
      border: "none",
      padding: "5px 10px",
      borderRadius: "50%",
      marginLeft: isCollapsed ? "0" : "auto", // Remove margin left when collapsed
    }}
  >
    <i className="fa fa-plus" aria-hidden="true" style={{ color: "#fff" }}></i>
  </button>
</div>


 {/* Boards List */}
 {boards.map((board) => (
    <li
      key={board.id}
      className="nav-item mb-2" // Adjust margin for compactness
      style={{
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        listStyleType: "none", // Remove dot/bullet style from the list item
      }}
    >
      <a
        href="#"
        className="nav-link text-black"
        onClick={() => onBoardSelect(board.id , board.title)}
        style={{
          display: "flex",
          alignItems: "center", // Vertically center icon and title
          padding: "5px 10px", // Reduce padding for more compact layout
          cursor: "pointer", // Show pointer on hover
          textDecoration: "none", // Remove underline
        }}
      >
        {/* Icon with circular background */}
        <i
          className="fa fa-clipboard"
          aria-hidden="true"
          style={{
            fontSize: "18px",
            width: "35px",
            height: "35px",
            borderRadius: "50%", // Circular icon
            backgroundColor: isDarkMode ? "#444" : "#ddd",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "10px", // Space between icon and title
            transition: "background-color 0.3s ease-in-out",
          }}
        ></i>

        {/* Show board title only when not collapsed */}
        {!isCollapsed && (
          <span style={{ marginLeft: isCollapsed ? 0 : "10px" }}>
            {board.title}
          </span>
        )}
      </a>
    </li>
  ))}

</div>

  
      {/* Dark Mode Toggle */}
      <button
        className="btn btn-light mt-auto"
        onClick={toggleDarkMode}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {isDarkMode ? (
          <i className="fa fa-sun-o" aria-hidden="true"></i>
        ) : (
          <i className="fa fa-moon-o" aria-hidden="true"></i>
        )}
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


           {/* Edit Profile Modal */}
           <Modal show={showProfileEdit} onHide={handleEditCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="first_name" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-control"
                value={editProfileData?.bio || ""}
                onChange={handleInpuProfiletChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="last_name" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-control"
                value={editProfileData?.last_name || ""}
                onChange={handleInpuProfiletChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={editProfileData?.email || ""}
                onChange={handleInpuProfiletChange}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>


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
            <strong className="me-auto">Task Created successfully!</strong>
            <small>Just Now</small>
          </Toast.Header>
          <Toast.Body>Board has been created successfully!</Toast.Body>
        </Toast>
      </ToastContainer>


    </div>
  );
  
};

export default SideBar;
