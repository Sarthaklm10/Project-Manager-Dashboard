import { useState, useEffect } from "react";
import { teamAPI } from "../api";
import "../styles/TeamManagement.css";

const TeamManagement = ({ projectId, isOwner, onTeamUpdate }) => {
  const [team, setTeam] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTeam();
  }, [projectId]);

  const loadTeam = async () => {
    try {
      const teamData = await teamAPI.getTeam(projectId);
      setTeam(teamData);
    } catch (err) {
      setError("Failed to load team members");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await teamAPI.addMember(projectId, newMemberEmail);
      setNewMemberEmail("");
      setSuccess("Team member added successfully!");
      loadTeam(); // Reload team data
      if (onTeamUpdate) onTeamUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this team member?"))
      return;

    try {
      await teamAPI.removeMember(projectId, userId);
      setSuccess("Team member removed successfully!");
      loadTeam(); // Reload team data
      if (onTeamUpdate) onTeamUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="team-management">
      <h3>Team Management</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isOwner && (
        <form onSubmit={handleAddMember} className="add-member-form">
          <div className="form-group">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member's email"
              className="form-input"
              required
            />
            <button type="submit" className="add-member-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      )}

      <div className="team-list">
        {team && team.length > 0 ? (
          team.map((member) => (
            <div key={member.user._id} className="team-member">
              <span className="member-name">{member.user.name}</span>
              <div className="member-details">
                <span className="member-email">{member.user.email}</span>
                <span className="member-role">{member.role}</span>
              </div>
              {isOwner && member.role !== "leader" && (
                <button
                  onClick={() => handleRemoveMember(member.user._id)}
                  className="remove-member-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-members">No team members yet</p>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
