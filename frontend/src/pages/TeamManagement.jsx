
import { useState, useEffect } from 'react';
import { teamAPI } from '../api';
import '../styles/TeamManagement.css';

const TeamManagement = ({ projectId }) => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchTeam();
    }
  }, [projectId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.getTeam(projectId);
      setTeam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading team...</div>;
  }

  return (
    <div className="team-management">
      <div className="team-management-header">
        <h1>Team Members</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="users-list">
        {team && team.length > 0 ? (
          team.map(member => (
            <div key={member.user._id} className="user-card">
              <div className="user-info">
                <span className="user-name">{member.user.name}</span>
                <span className="user-role">{member.role}</span>
                <span className="user-email">{member.user.email}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No team members yet.</p>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
