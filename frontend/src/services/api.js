import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't clear token on login failure
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('skillbridge_token');
        localStorage.removeItem('skillbridge_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  getUserSkills: () => api.get('/profile/skills'),
  addUserSkill: (data) => api.post('/profile/skills', data),
  deleteUserSkill: (skillId) => api.delete(`/profile/skills/${skillId}`),
};

export const skillsApi = {
  getAllSkills: (category) => api.get('/skills', { params: { category } }),
  createSkill: (data) => api.post('/skills', data),
};

export const projectsApi = {
  searchProjects: (params) => api.get('/projects', { params }),
  getAll: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getMatch: (id) => api.get(`/projects/${id}/match`),
  getSkillGap: (id) => api.get(`/projects/${id}/skill-gap`),
};
export const projectApi = projectsApi;

export const teamsApi = {
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  getRecommendations: (projectId) => api.get(`/projects/${projectId}/recommend-teammates`),
  removeMember: (projectId, memberUserId) => api.delete(`/projects/${projectId}/members/${memberUserId}`),
  leaveProject: (projectId) => api.post(`/projects/${projectId}/leave`),
};

export const invitationsApi = {
  sendInvitation: (projectId, data) => api.post(`/projects/${projectId}/invitations`, data),
  getProjectInvitations: (projectId) => api.get(`/projects/${projectId}/invitations`),
  getUserInvitations: () => api.get('/invitations'),
  acceptInvitation: (id) => api.post(`/invitations/${id}/accept`),
  rejectInvitation: (id) => api.post(`/invitations/${id}/reject`),
};

export const tasksApi = {
  getProjectTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  createTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  updateStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status?status=${status}`),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  getMyTasks: () => api.get('/tasks/my'),
};

export const goalsApi = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
};

export const notificationsApi = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const usersApi = {
  searchStudents: (params) => api.get('/users', { params }),
  getStudent: (id) => api.get(`/users/${id}`),
};

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  changeUserRole: (id, role) => api.patch(`/admin/users/${id}/role?role=${role}`),
  moderateProject: (id, status) => api.patch(`/admin/projects/${id}/status?status=${status}`),
};

export default api;
