const Task = require("../models/Task");

const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const task = await Task.create({
            title,
            description,
            userId: req.user.userId
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const toggleTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Check ownership
        if (task.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        // Toggle status
        task.status =
            task.status === "pending"
                ? "completed"
                : "pending";

        await task.save();

        res.status(200).json({
            message: "Task status updated",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Check ownership
        if (task.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        await task.deleteOne();

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (task.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        task.title = title || task.title;
        task.description = description || task.description;

        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    toggleTaskStatus,
    deleteTask,
    updateTask
};