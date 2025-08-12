import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project._id);
    }
  };

  return (
    <div className="project-card">
      <Link to={`/project/${project._id}`} className="project-card-link">
        <h3 className="project-name">{project.name}</h3>
        <p className="project-description">
          {project.description || 'No description provided'}
        </p>
        <div className="project-meta">
          <span className="project-date">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </Link>
      <button 
        className="project-delete-btn"
        onClick={handleDelete}
        title="Delete project"
      >
        ×
      </button>
    </div>
  );
};

export default ProjectCard;