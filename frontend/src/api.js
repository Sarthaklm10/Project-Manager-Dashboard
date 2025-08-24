const API_BASE_URL = "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Common fetch function with auth headers
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
};

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },
};

// Project API functions
export const projectAPI = {
  getAll: () => fetchWithAuth("/projects"),

  getAllWithTeams: () => fetchWithAuth("/projects/teams"),

  getById: (id) => fetchWithAuth(`/projects/${id}`),

  create: (projectData) =>
    fetchWithAuth("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    }),

  update: (id, projectData) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    }),

  delete: (id) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "DELETE",
    }),
};

// Task API functions
export const taskAPI = {
  getByProject: (projectId) => fetchWithAuth(`/tasks/${projectId}`),

  create: (projectId, taskData) =>
    fetchWithAuth(`/tasks/${projectId}`, {
      method: "POST",
      body: JSON.stringify(taskData),
    }),

  update: (projectId, taskId, taskData) =>
    fetchWithAuth(`/tasks/${projectId}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    }),

  delete: (projectId, taskId) =>
    fetchWithAuth(`/tasks/${projectId}/${taskId}`, {
      method: "DELETE",
    }),

  toggleComplete: (projectId, taskId, completed) =>
    fetchWithAuth(`/tasks/${projectId}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ completed }),
    }),
};

// User API functions
export const userAPI = {
  getAll: () => fetchWithAuth("/auth/users"),
};

// Team management
export const teamAPI = {
  addMember: async (projectId, email) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  },

  removeMember: async (projectId, userId) => {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/team/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  },

  getTeam: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  },
};
