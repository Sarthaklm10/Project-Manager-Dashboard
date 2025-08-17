import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { projectAPI, taskAPI } from "../api";
import TaskItem from "../components/TaskItem";
import "../styles/ProjectDetail.css";
import { canManageProject, isProjectOwner } from "../utils/permissions";
import TeamManagement from "../components/TeamManagement";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        projectAPI.getById(id),
        taskAPI.getByProject(id),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setEditProjectData({
        name: projectData.name,
        description: projectData.description || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await taskAPI.create(id, { title: newTaskTitle.trim() });
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await taskAPI.update(id, taskId, taskData);
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(id, taskId);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleTaskComplete = async (taskId, completed) => {
    try {
      const updatedTask = await taskAPI.toggleComplete(id, taskId, completed);
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = await projectAPI.update(id, editProjectData);
      setProject(updatedProject);
      setIsEditingProject(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This will also delete all tasks."
      )
    ) {
      try {
        await projectAPI.delete(id);
        navigate("/dashboard");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Check if current user can manage this project
  const canManage =
    project && currentUser
      ? canManageProject(currentUser._id, project.owner)
      : false;
  const isOwner =
    project && currentUser
      ? isProjectOwner(currentUser._id, project.owner)
      : false;

  return (
    <div className="project-detail">
      <div className="project-header">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        {isEditingProject ? (
          <form onSubmit={handleUpdateProject} className="edit-project-form">
            <input
              type="text"
              value={editProjectData.name}
              onChange={(e) =>
                setEditProjectData({
                  ...editProjectData,
                  name: e.target.value,
                })
              }
              className="edit-project-name"
              required
            />
            <textarea
              value={editProjectData.description}
              onChange={(e) =>
                setEditProjectData({
                  ...editProjectData,
                  description: e.target.value,
                })
              }
              className="edit-project-description"
              placeholder="Project description"
            />
            <div className="edit-project-actions">
              <button type="submit" className="save-btn">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProject(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="project-info">
            <h1>{project.name}</h1>
            <p>{project.description || "No description provided"}</p>
            <div className="project-actions">
              {canManage && (
                <>
                  <button
                    onClick={() => setIsEditingProject(true)}
                    className="edit-btn"
                  >
                    Edit Project
                  </button>
                  <button onClick={handleDeleteProject} className="delete-btn">
                    Delete Project
                  </button>
                </>
              )}
              {isOwner && (
                <button className="owner-badge">
                  <span>👑 Project Owner</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")} className="close-error">
            ×
          </button>
        </div>
      )}

      {/* Team Management Section */}
      <TeamManagement
        projectId={id}
        isOwner={isOwner}
        onTeamUpdate={() => {
          // Optionally refresh project data
          // loadProject();
        }}
      />

      <div className="task-section">
        <h2>Tasks ({tasks.length})</h2>

        <form onSubmit={handleAddTask} className="add-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="add-task-input"
          />
          <button type="submit" className="add-task-btn">
            Add Task
          </button>
        </form>

        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <div className="tasks-container">
            {pendingTasks.length > 0 && (
              <div className="task-group">
                <h3>Pending ({pendingTasks.length})</h3>
                <div className="tasks-list">
                  {pendingTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleTaskComplete}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="task-group">
                <h3>Completed ({completedTasks.length})</h3>
                <div className="tasks-list">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      onToggleComplete={handleToggleTaskComplete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
