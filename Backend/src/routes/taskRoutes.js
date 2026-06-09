const express = require("express");

const { createTask,
    getTasks,
    toggleTaskStatus,
    deleteTask,
    updateTask
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.patch("/:id/status", authMiddleware, toggleTaskStatus);
router.delete("/:id",authMiddleware,deleteTask);
router.put("/:id", authMiddleware, updateTask);
module.exports = router;