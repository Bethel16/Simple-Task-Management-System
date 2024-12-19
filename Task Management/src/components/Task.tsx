import React, { useState } from "react";
import axios from "axios";

// Define the Subtask interface
interface Subtask {
  id: string;
  title: string;
}

const TaskManager: React.FC = () => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>(""); // New subtask title
  const [showSubtaskModal, setShowSubtaskModal] = useState<boolean>(false); // Modal visibility
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null); // Currently active task ID

  // Function to open the modal for a specific task
  const handleOpenSecondModal = (taskId: string) => {
    console.log("Subtask card clicked for " + taskId);
    setActiveTaskId(taskId); // Set the active task ID
    setShowSubtaskModal(true); // Show the modal
  };

  // Function to save a new subtask
  const handleSaveSubtask = async () => {

    if (!newSubtaskTitle.trim()) {
      alert("Subtask title cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/create-subtask/${activeTaskId}`,
        {
          title: newSubtaskTitle,
          task: activeTaskId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newSubtask: Subtask = response.data;

      // Add the new subtask to the list
      setSubtasks((prevSubtasks) => [...prevSubtasks, newSubtask]);

      // Close the modal and reset the input
      setShowSubtaskModal(false);
      setNewSubtaskTitle("");
      console.log("Subtask created:", newSubtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      alert("Failed to create subtask. Please try again.");
    }
  };

  return (
    <div>
      {/* Subtask Modal */}
      {showSubtaskModal && (
        <div className="modal">
          <h3>Create Subtask</h3>
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Enter subtask title"
          />
          <button onClick={handleSaveSubtask}>Save Subtask</button>
          <button onClick={() => setShowSubtaskModal(false)}>Cancel</button>
        </div>
      )}

      {/* Example task triggering subtask modal */}
      <button onClick={() => handleOpenSecondModal("example-task-id")}>
        Open Subtask Modal for Task
      </button>

      {/* Subtasks List */}
      <ul>
        {subtasks.map((subtask) => (
          <li key={subtask.id}>{subtask.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
