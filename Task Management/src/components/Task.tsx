// import React, { useState , useEffect} from "react";
// import { Modal, Button, Toast, ToastContainer } from "react-bootstrap";
// import axios from "axios";

// const TaskCards: React.FC = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [taskToast, setTaskToast] = useState(false);
//   const [taskData, setTaskData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     is_important: false,
//     status: "Incomplete",
//   });
//    const [tasks, setTasks] = useState([]); // Holds fetched tasks
    
//  // Fetch tasks from API
//  useEffect(() => {
//   const fetchTasks = async () => {
//     try {
//       const userData = localStorage.getItem("userData");

//       if (userData) {
//         const parsedUserData = JSON.parse(userData);

//         if (parsedUserData && parsedUserData.id) {
//           const userId = parsedUserData.id;

//           const response = await axios.get(`http://localhost:8000/api/user-task/${userId}/`);

//           setTasks(response.data.tasks); // Set fetched tasks
//         }
//       } else {
//         console.error("User data not found in local storage.");
//       }
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//     }
//   };

//   fetchTasks();
// }, []);

//   const handleAddTask = () => {
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type } = e.target;

//     if (type === "checkbox") {
//       setTaskData({
//         ...taskData,
//         [name]: (e.target as HTMLInputElement).checked,
//       });
//     } else {
//       setTaskData({
//         ...taskData,
//         [name]: value,
//       });
//     }
//   };
//   const handleSaveTask = async () => {
//     try {
//       const userData = localStorage.getItem("userData");

//       if (userData) {
//         const parsedUserData = JSON.parse(userData);

//         if (parsedUserData && parsedUserData.id) {
//           const userId = parsedUserData.id;

//           const response = await axios.post("http://localhost:8000/api/create-task/", {
//             ...taskData,
//             created_by: userId,
//           });

//           if (response.status === 201) {
//             setTaskToast(true);

//             // Fetch updated tasks
//             const updatedTasksResponse = await axios.get(`http://localhost:8000/api/user-task/${userId}/`);
//             setTasks(updatedTasksResponse.data.tasks);

//             setTimeout(() => {
//               setTaskToast(false);
//               setShowModal(false);
//               setTaskData({
//                 title: "",
//                 description: "",
//                 date: "",
//                 is_important: false,
//                 status: "Incomplete",
//               });
//             }, 3000);
//           }
//         } else {
//           alert("User ID not found. Please log in.");
//         }
//       } else {
//         alert("No user data found. Please log in.");
//       }
//     } catch (error) {
//       console.error("Error creating task:", error);
//       alert("Failed to create task. Please try again.");
//     }
//   };



//   return (
//     <div className="task-cards-container">
//       {/* Add Task Button */}
//       <button className="btn btn-success add-task-btn" onClick={handleAddTask}>
//         <i className="fa fa-plus me-2"></i> Add Task
//       </button>

//       {/* Modal for Add Task */}
//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Create Task</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <form>
//             <div className="mb-3">
//               <label htmlFor="task-title" className="form-label">
//                 Task Title
//               </label>
//               <input
//                 type="text"
//                 id="task-title"
//                 name="title"
//                 className="form-control"
//                 placeholder="Enter task title"
//                 value={taskData.title}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="task-desc" className="form-label">
//                 Description
//               </label>
//               <textarea
//                 id="task-desc"
//                 name="description"
//                 className="form-control"
//                 rows={3}
//                 placeholder="Enter task description"
//                 value={taskData.description}
//                 onChange={handleInputChange}
//               ></textarea>
//             </div>
//             <div className="mb-3">
//               <label htmlFor="task-date" className="form-label">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 id="task-date"
//                 name="date"
//                 className="form-control"
//                 value={taskData.date}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//             <div className="form-check form-switch mb-3">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 id="task-important"
//                 name="is_important"
//                 checked={taskData.is_important}
//                 onChange={handleInputChange}
//               />
//               <label className="form-check-label" htmlFor="task-important">
//                 Mark as Important
//               </label>
//             </div>
//             <div className="mb-3">
//               <label htmlFor="task-status" className="form-label">
//                 Status
//               </label>
//               <select
//                 id="task-status"
//                 name="status"
//                 className="form-control"
//                 value={taskData.status}
//                 onChange={handleInputChange}
//               >
//                 <option value="Incomplete">Incomplete</option>
//                 <option value="Complete">Complete</option>
//               </select>
//             </div>
//           </form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSaveTask}>
//             Save Task
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Toast for Task Creation */}
//       <ToastContainer position="top-center" className="p-3">
//         <Toast
//           onClose={() => setTaskToast(false)}
//           show={taskToast}
//           delay={3000}
//           autohide
//           bg="success"
//         >
//           <Toast.Header>
//             <i className="fa fa-check-circle text-success me-2"></i>
//             <strong className="me-auto">Task Created</strong>
//             <small>Just Now</small>
//           </Toast.Header>
//           <Toast.Body>Your task has been added successfully!</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </div>
//   );
// };

// export default TaskCards;





// 
