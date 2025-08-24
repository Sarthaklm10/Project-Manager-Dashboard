import { useState, useEffect } from 'react';
import { projectAPI } from '../api';
import '../styles/Teams.css';

const Teams = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectsWithTeams();
  }, []);

  const fetchProjectsWithTeams = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getAllWithTeams();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  return (
    <div className="teams-container">
      <h1>Teams by Project</h1>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">
            ×
          </button>
        </div>
      )}
      <div className="projects-grid">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              <h2>{project.name}</h2>
              <div className="team-members-grid">
                {project.team && project.team.length > 0 ? (
                  project.team.map((member) => (
                    <div key={member.user._id} className="team-member-card">
                      <div className="member-details">
                        <p className="member-name">{member.user.name}</p>
                        <p className="member-email">{member.user.email}</p>
                        <p className="member-role">{member.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No team members yet.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default Teams;