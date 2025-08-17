const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
} = require("../controllers/projectController.js");

const router = express.Router();

// Protect all project routes
router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Team management routes
router.post("/:id/team", addTeamMember);
router.delete("/:id/team/:userId", removeTeamMember);
router.get("/:id/team", getTeamMembers);

module.exports = router;
