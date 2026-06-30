import api from './api';

export const getProjects = async () => {
  const { data } = await api.get('/projects');
  return data;
};

export const getProjectById = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const createProject = async (name, description) => {
  const { data } = await api.post('/projects', { name, description });
  return data;
};

export const updateProject = async (id, name, description) => {
  const { data } = await api.put(`/projects/${id}`, { name, description });
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};

export const inviteMember = async (id, userId) => {
  const { data } = await api.post(`/projects/${id}/members`, { userId });
  return data;
};

export const removeMember = async (id, userId) => {
  const { data } = await api.delete(`/projects/${id}/members/${userId}`);
  return data;
};
