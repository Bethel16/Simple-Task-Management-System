import React from "react";

interface NavBarProps {
  sidebarWidth: number; // Sidebar width will be passed dynamically
  isDarkMode: boolean;
}

// interface BoardTitle {
//   title : string;
// }
const NavBar: React.FC<NavBarProps> = ({ sidebarWidth, isDarkMode }) => {
  const navbarBg = isDarkMode ? "bg-dark" : "bg-light";
  const textColor = isDarkMode ? "text-white" : "text-dark";

  return (
    <nav
      className={`navbar ${navbarBg}`}
      style={{
        position: "fixed",
        top: "0",
        left: `${sidebarWidth}px`, // Adjust navbar left margin dynamically
        width: `calc(100% - ${sidebarWidth}px)`, // Full width minus sidebar width
        height: "56px", // Typical navbar height
        zIndex: 1000,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "left 0.3s, width 0.3s", // Smooth transitions when sidebar collapses/expands
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Brand */}
        <a className={`navbar-brand ${textColor}`} href="#">
          <i className="fa fa-tasks me-2"></i> Task Manager
        </a>

        {/* Search Bar */}
        <form className="d-flex">
          <input
            type="text"
            className={`form-control me-2 ${isDarkMode ? "bg-secondary text-white" : ""}`}
            placeholder="Search"
          />
          <button className={`btn btn-outline-${isDarkMode ? "light" : "dark"}`} type="submit">
            Search
          </button>
        </form>
      </div>
    </nav>
  );
};

export default NavBar;
