import React, { useState, useEffect } from "react";
import { Modal, Button, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";

// Define the Task type
interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  is_important: boolean;
  status: string;
}


const TaskCards: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [taskToast, setTaskToast] = useState<boolean>(false);
  const [taskData, setTaskData] = useState<Task>({
    id: "",
    title: "",
    description: "",
    date: "",
    is_important: false,
    status: "Incomplete",
  });
  const [tasks, setTasks] = useState<Task[]>([]); // Holds fetched tasks
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string>("");
  const [showTaskUpdatedToast, setShowTaskUpdatedToast] = useState(false);
  const [showTaskDeletedToast, setShowTaskDeletedToast] = useState(false);
  
  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userData = localStorage.getItem("userData");

        if (userData) {
          const parsedUserData = JSON.parse(userData);

          if (parsedUserData && parsedUserData.id) {
            const userId = parsedUserData.id;

            const response = await axios.get(
              `http://localhost:8000/api/user-task/${userId}/`
            );

            setTasks(response.data.tasks); // Set fetched tasks
          }
        } else {
          console.error("User data not found in local storage.");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const triggerTaskUpdatedToast = () => {
    setShowTaskUpdatedToast(true);
    setTimeout(() => setShowTaskUpdatedToast(false), 3000); // Auto hide after 3 seconds
  };

  // Function to trigger the "Task Deleted" toast
  const triggerTaskDeletedToast = () => {
    setShowTaskDeletedToast(true);
    setTimeout(() => setShowTaskDeletedToast(false), 3000); // Auto hide after 3 seconds
  };

  const handleOpenDeleteModal = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setTaskToDelete("");
    setDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      const userData = localStorage.getItem("userData");

      if (userData) {
        const parsedUserData = JSON.parse(userData);

        if (parsedUserData && parsedUserData.id && taskToDelete) {
          const userId = parsedUserData.id;

          const response = await axios.delete(
            `http://localhost:8000/api/delete-task/${taskToDelete}/`
          );
          console.dir("task deleted sucessfully");
          if (response.status === 201) {
            // Fetch updated tasks
            triggerTaskDeletedToast();
            const updatedTasksResponse = await axios.get(
              `http://localhost:8000/api/user-task/${userId}/`
            );
            setTasks(updatedTasksResponse.data.tasks);
            handleCloseDeleteModal();
          }
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleAddTask = () => {
    setShowModal(true);
    setTaskData({
      id: "",
      title: "",
      description: "",
      date: "",
      is_important: false,
      status: "Incomplete",
    });
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
      const userData = localStorage.getItem("userData");

      if (userData) {
        const parsedUserData = JSON.parse(userData);

        if (parsedUserData && parsedUserData.id) {
          const userId = parsedUserData.id;

          if (taskData.id) {
            // Update existing task
            const response = await axios.put(
              `http://localhost:8000/api/edit-task/${taskData.id}/`,
              taskData,
              {
                headers: {
                  "Content-Type": "application/json", // Add this header
                },
              }
            );

            if (response.status === 200) {
              triggerTaskUpdatedToast();
              setTaskToast(true);
              // Fetch updated tasks
              const updatedTasksResponse = await axios.get(
                `http://localhost:8000/api/user-task/${userId}/`
              );
              setTasks(updatedTasksResponse.data.tasks);
              setTimeout(() => {
                setTaskToast(false);
                setShowModal(false);
              }, 2000);
            }
          } else {
            // Create new task
            const response = await axios.post(
              "http://localhost:8000/api/create-task/",
              { ...taskData, created_by: userId }
            );

            if (response.status === 201) {
              setTaskToast(true);
              // Fetch updated tasks
              const updatedTasksResponse = await axios.get(
                `http://localhost:8000/api/user-task/${userId}/`
              );
              setTasks(updatedTasksResponse.data.tasks);
              setTimeout(() => {
                setTaskToast(false);
                setShowModal(false);
              }, 3000);
            }
          }
        } else {
          alert("User ID not found. Please log in.");
        }
      } else {
        alert("No user data found. Please log in.");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const handleEdit = (taskId: string) => {
    console.log('Edit button clicked for task ID:', taskId);
    
    const taskToEdit = tasks.find((task) => task.id === taskId);
    console.log('Task to edit:', taskToEdit);
  
    if (taskToEdit) {
      setTaskData(taskToEdit); // Populate the modal with the task data
      setShowModal(true); // Show the modal
    } else {
      console.log("No task found with that ID");
    }
  };

  return (
    <div className="task-cards-container">
      {/* Modal for Add Task */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{taskData.id ? "Edit Task" : "Create Task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
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
            <strong className="me-auto">Task Updated</strong>
            <small>Just Now</small>
          </Toast.Header>
          <Toast.Body>Your task has been updated successfully!</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Toast Container */}
      <ToastContainer position="top-center" className="p-3">
        {/* Task Updated Toast */}
        {showTaskUpdatedToast && (
          <Toast onClose={() => setShowTaskUpdatedToast(false)} bg="success" autohide delay={3000}>
            <Toast.Header>
              <i className="fa fa-check-circle text-success me-2"></i>
              <strong className="me-auto">Task Updated</strong>
              <small>Just Now</small>
            </Toast.Header>
            <Toast.Body>Your task has been updated successfully!</Toast.Body>
          </Toast>
        )}

        {/* Task Deleted Toast */}
        {showTaskDeletedToast && (
          <Toast onClose={() => setShowTaskDeletedToast(false)} bg="danger" autohide delay={3000}>
            <Toast.Header>
              <i className="fa fa-check-circle text-danger me-2"></i>
              <strong className="me-auto">Task Deleted</strong>
              <small>Just Now</small>
            </Toast.Header>
            <Toast.Body>Your task has been deleted successfully!</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
      
      {/* Display Task Cards */}
      <div className="row mt-4">
        {/* Render Task Cards */}
        {tasks.map((task) => (
          
          <div className="col-md-4 mb-4" key={task.id}>
            <div className={`card task-card ${task.status.toLowerCase()}`}>
              <div className="task-actions">
                <button
                  className="btn btn-icon"
                  onClick={() => 
                    handleEdit(task.id)}  // Clicking will call handleEdit with task.id
                  title="Edit"
                >
                  <i className="fa fa-pencil"></i>
                </button>
                <button
                  className="btn btn-icon"
                  onClick={() => handleOpenDeleteModal(task.id)}
                  title="Delete"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </div>
              <div className="card-body">
                <h5 className="card-title">{task.title}</h5>
                <p className="card-text">{task.description}</p>
                <p className="card-text">
                  <small className="text-muted">Due: {task.date}</small>
                </p>
                <p className="card-text">
                  <small
                    className={`badge badge-${task.is_important ? "danger" : "secondary"}`}
                  >
                    {task.is_important ? "Important" : "Normal"}
                  </small>
                </p>
                <span
                  className={`badge ${task.status === "Complete" ? "bg-success" : "bg-warning"}`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          </div>
        ))}


 {/* Modal for Confirm Delete */}
 <Modal show={deleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this task?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>


      
        {/* Add Task Card */}
        <div className="col-md-4 mb-4">
          <div className="card task-card add-task-card">
            <div className="card-body text-center" onClick={handleAddTask}>
              <i className="fa fa-plus-circle fa-3x"></i>
              <h5 className="mt-3">Add Task</h5>
              <p className="card-text">Click to add a new task</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCards;