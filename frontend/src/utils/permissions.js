// Check if user can manage a project (is owner)
export const canManageProject = (userId, projectOwnerId) => {
  return userId === projectOwnerId;
};

// Check if user is project owner
export const isProjectOwner = (userId, projectOwnerId) => {
  return userId === projectOwnerId;
};

// Check if user can view project (owner or team member)
export const canViewProject = (userId, projectOwnerId, teamMembers = []) => {
  return userId === projectOwnerId || teamMembers.includes(userId);
};
