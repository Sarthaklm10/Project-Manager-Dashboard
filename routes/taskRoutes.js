const express = require("express");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.route("/:projectId").get(protect, getTasks).post(protect, createTask);
router.route("/:projectId/:taskId").put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;