import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);
export const getMe = () => api.get('/api/auth/me');

// Images
export const getFeed = (page = 1) => api.get(`/api/images?page=${page}`);
export const searchImages = (q) => api.get(`/api/images/search?q=${encodeURIComponent(q)}`);
export const getImage = (id) => api.get(`/api/images/${id}`);
export const uploadImage = (formData) =>
  api.post('/api/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (id) => api.delete(`/api/images/${id}`);
export const getMyImages = () => api.get('/api/images/mine');

// Comments
export const addComment = (imageId, data) => api.post(`/api/images/${imageId}/comments`, data);

// Ratings
export const rateImage = (imageId, data) => api.post(`/api/images/${imageId}/ratings`, data);

export default api;

// Likes
export const toggleLike = (imageId) => api.post(`/api/images/${imageId}/likes`);

// Bookmarks
export const toggleBookmark = (imageId) => api.post(`/api/bookmarks/${imageId}`);
export const getBookmarks   = ()         => api.get('/api/bookmarks');

// Follow
export const toggleFollow    = (creatorId) => api.post(`/api/creators/${creatorId}/follow`);
export const getFollowStatus = (creatorId) => api.get(`/api/creators/${creatorId}/follow`);

// Profile
export const getMyProfile = () => api.get('/api/profile');
