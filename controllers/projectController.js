const Project = require("../models/Project.js");
const User = require("../models/User.js"); // Added for team management

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ leader: req.user.id }, { "team.user": req.user.id }],
    }).populate("leader", "name");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("leader", "name email")
      .populate("team.user", "name email role");

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
      leader: req.user.id,
      team: [{ user: req.user.id, role: 'leader' }]
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
      leader: req.user.id,
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
      leader: req.user.id,
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
    const { email, role } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.leader.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only project leader can add team members" });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    if (project.team.some(member => member.user.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    project.team.push({ user: userToAdd._id, role: role || 'member' });
    await project.save();

    res.json({
      message: "Team member added successfully",
      teamMember: { user: userToAdd, role: role || 'member' },
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

    if (project.leader.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only project leader can remove team members" });
    }

    if (userId === project.leader.toString()) {
      return res.status(400).json({ message: "Cannot remove project leader" });
    }

    project.team = project.team.filter(
      (member) => member.user.toString() !== userId
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

    const project = await Project.findById(id).populate("team.user", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.team);
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
