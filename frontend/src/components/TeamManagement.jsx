import { useState, useEffect } from 'react';
import { teamAPI, userAPI } from '../api';
import '../styles/TeamManagement.css';

const TeamManagement = ({ projectId, isOwner }) => {
  const [team, setTeam] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchTeamAndUsers();
    }
  }, [projectId]);

  const fetchTeamAndUsers = async () => {
    try {
      setLoading(true);
      const [teamData, usersData] = await Promise.all([
        teamAPI.getTeam(projectId),
        userAPI.getAll(),
      ]);
      setTeam(teamData);
      setAllUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    try {
      await teamAPI.addMember(projectId, newUserEmail);
      setNewUserEmail('');
      fetchTeamAndUsers(); // Refresh team
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await teamAPI.removeMember(projectId, userId);
        fetchTeamAndUsers(); // Refresh team
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading team...</div>;
  }

  return (
    <div className="team-management-container">
      <div className="team-management-header">
        <h2>Team Members</h2>
        {isOwner && (
          <form onSubmit={handleAddMember} className="add-member-form">
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter user's email"
              className="add-member-input"
              required
            />
            <button type="submit" className="add-member-btn">
              Add Member
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">
            ×
          </button>
        </div>
      )}

      <div className="team-members-grid">
        {team && team.length > 0 ? (
          team.map((member) => (
            <div key={member.user._id} className="team-member-card">
              <div className="member-details">
                <p className="member-name">{member.user.name}</p>
                <p className="member-email">{member.user.email}</p>
                <p className="member-role">{member.role}</p>
              </div>
              {isOwner && (
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
          <div className="no-members">
            <p>No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;