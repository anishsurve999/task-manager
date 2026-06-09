import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const TASKS_PER_PAGE = 10;

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [editingTask, setEditingTask] = useState(null);
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // Filter by status
    const statusFilteredTasks = tasks.filter((task) => {
        if (filter === "all") return true;
        return task.status === filter;
    });

    // Filter by search query
    const filteredTasks = statusFilteredTasks.filter((task) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            task.title.toLowerCase().includes(q) ||
            (task.description && task.description.toLowerCase().includes(q))
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * TASKS_PER_PAGE,
        currentPage * TASKS_PER_PAGE
    );

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    const fetchTasks = async () => {
        try {
            const response = await API.get("/tasks");
            setTasks(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const createTask = async (e) => {
        e.preventDefault();
        try {
            await API.post("/tasks", formData);
            setFormData({ title: "", description: "" });
            setShowCreateForm(false);
            fetchTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const deleteTask = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;
        try {
            await API.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await API.patch(`/tasks/${id}/status`);
            fetchTasks();
        } catch (error) {
            console.log(error);
        }
    };

    const updateTask = async () => {
        try {
            await API.put(`/tasks/${editingTask._id}`, {
                title: editingTask.title,
                description: editingTask.description,
            });
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const pendingCount = tasks.filter((t) => t.status === "pending").length;
    const completedCount = tasks.filter((t) => t.status === "completed").length;

    return (
        <div className="dashboard-wrapper">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">✦</span>
                    <span className="brand-name">Taskr</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        <span className="nav-icon">⊞</span>
                        All Tasks
                        <span className="nav-badge">{tasks.length}</span>
                    </button>
                    <button
                        className={`nav-item ${filter === "pending" ? "active" : ""}`}
                        onClick={() => setFilter("pending")}
                    >
                        <span className="nav-icon">◷</span>
                        Pending
                        <span className="nav-badge">{pendingCount}</span>
                    </button>
                    <button
                        className={`nav-item ${filter === "completed" ? "active" : ""}`}
                        onClick={() => setFilter("completed")}
                    >
                        <span className="nav-icon">◉</span>
                        Completed
                        <span className="nav-badge">{completedCount}</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={logout}>
                        <span>↩</span> Log out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">
                            {filter === "all"
                                ? "All Tasks"
                                : filter === "pending"
                                ? "Pending Tasks"
                                : "Completed Tasks"}
                        </h1>
                        <p className="dashboard-subtitle">
                            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    </div>
                    <button
                        className="create-btn"
                        onClick={() => {
                            setShowCreateForm(true);
                            setEditingTask(null);
                        }}
                    >
                        <span className="create-btn-icon">+</span>
                        New Task
                    </button>
                </header>

                {/* Stats row */}
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{tasks.length}</span>
                    </div>
                    <div className="stat-card stat-pending">
                        <span className="stat-label">Pending</span>
                        <span className="stat-value">{pendingCount}</span>
                    </div>
                    <div className="stat-card stat-completed">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{completedCount}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Progress</span>
                        <span className="stat-value">
                            {tasks.length > 0
                                ? Math.round((completedCount / tasks.length) * 100)
                                : 0}%
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                {tasks.length > 0 && (
                    <div className="progress-bar-wrap">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                        />
                    </div>
                )}

                {/* Search bar */}
                <div className="search-wrap">
                    <span className="search-icon">⌕</span>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search tasks by title or description…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => setSearchQuery("")}
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Create form */}
                {showCreateForm && (
                    <div className="form-card">
                        <h2 className="form-title">Create New Task</h2>
                        <form onSubmit={createTask}>
                            <input
                                className="task-input"
                                type="text"
                                name="title"
                                placeholder="Task title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                            <textarea
                                className="task-textarea"
                                name="description"
                                placeholder="Add a description…"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    Create Task
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit form */}
                {editingTask && (
                    <div className="form-card form-card--edit">
                        <h2 className="form-title">Edit Task</h2>
                        <input
                            className="task-input"
                            type="text"
                            value={editingTask.title}
                            onChange={(e) =>
                                setEditingTask({ ...editingTask, title: e.target.value })
                            }
                            autoFocus
                        />
                        <textarea
                            className="task-textarea"
                            value={editingTask.description}
                            onChange={(e) =>
                                setEditingTask({ ...editingTask, description: e.target.value })
                            }
                            rows={3}
                        />
                        <div className="form-actions">
                            <button className="btn-primary" onClick={updateTask}>
                                Save Changes
                            </button>
                            <button
                                className="btn-ghost"
                                onClick={() => setEditingTask(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Task list */}
                <div className="task-list">
                    {filteredTasks.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">◎</span>
                            <p>
                                {searchQuery
                                    ? `No tasks match "${searchQuery}"`
                                    : "No tasks here yet"}
                            </p>
                            <span>
                                {searchQuery
                                    ? "Try a different search term"
                                    : filter === "all"
                                    ? "Create your first task to get started"
                                    : `No ${filter} tasks`}
                            </span>
                        </div>
                    ) : (
                        paginatedTasks.map((task) => (
                            <div
                                key={task._id}
                                className={`task-card ${task.status === "completed" ? "task-card--done" : ""}`}
                            >
                                <div className="task-card-left">
                                    <button
                                        className={`status-toggle ${task.status === "completed" ? "status-toggle--done" : ""}`}
                                        onClick={() => toggleStatus(task._id)}
                                        title={task.status === "pending" ? "Mark complete" : "Mark pending"}
                                    >
                                        {task.status === "completed" ? "✓" : ""}
                                    </button>
                                    <div className="task-content">
                                        <h3 className="task-title">{task.title}</h3>
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                        <span className={`task-status-badge ${task.status === "completed" ? "badge--done" : "badge--pending"}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="task-actions">
                                    <button
                                        className="action-btn action-btn--edit"
                                        onClick={() => {
                                            setEditingTask(task);
                                            setShowCreateForm(false);
                                        }}
                                        title="Edit"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        className="action-btn action-btn--delete"
                                        onClick={() => deleteTask(task._id)}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn page-btn--nav"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ‹
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`page-btn ${currentPage === page ? "page-btn--active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            className="page-btn page-btn--nav"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            ›
                        </button>

                        <span className="pagination-info">
                            {(currentPage - 1) * TASKS_PER_PAGE + 1}–
                            {Math.min(currentPage * TASKS_PER_PAGE, filteredTasks.length)} of{" "}
                            {filteredTasks.length}
                        </span>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
