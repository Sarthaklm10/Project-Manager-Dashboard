const Project = require("../models/Project.js");
const User = require("../models/User.js"); // Added for team management

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      user: req.user.id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add team member to project
const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Debug: Log what we found
    console.log("Project found:", {
      id: project._id,
      owner: project.owner,
      user: project.user,
      hasOwner: !!project.owner,
    });

    // Check if project has an owner
    if (!project.owner) {
      return res.status(400).json({
        message: "Project has no owner. Please recreate the project.",
      });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only project owner can add team members" });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a team member
    if (project.teamMembers.includes(userToAdd._id)) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    // Check if user is the owner
    if (userToAdd._id.toString() === project.owner.toString()) {
      return res
        .status(400)
        .json({ message: "Owner is already part of the project" });
    }

    // Add user to team
    project.teamMembers.push(userToAdd._id);
    await project.save();

    res.json({
      message: "Team member added successfully",
      teamMember: userToAdd,
    });
  } catch (error) {
    console.error("Error in addTeamMember:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove team member from project
const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only project owner can remove team members" });
    }

    // Check if user is trying to remove themselves (owner)
    if (userId === project.owner.toString()) {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    // Remove user from team
    project.teamMembers = project.teamMembers.filter(
      (memberId) => memberId.toString() !== userId
    );
    await project.save();

    res.json({ message: "Team member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team members
const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("owner", "name email")
      .populate("teamMembers", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      owner: project.owner,
      teamMembers: project.teamMembers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
};
