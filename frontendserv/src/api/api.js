import axios from 'axios';

const STORAGE_SERVICE_URL = process.env.REACT_APP_STORAGE_SERVICE_URL;
const USAGE_SERVICE_URL = process.env.REACT_APP_USAGE_SERVICE_URL;
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL;

export const registerUser = (userData) => axios.post(`${USER_SERVICE_URL}/register`, userData);
export const loginUser = (credentials) => axios.post(`${USER_SERVICE_URL}/login`, credentials);
export const getUsageStats = (token) => axios.get(`${USAGE_SERVICE_URL}/usage`, {
  headers: { Authorization: `Bearer ${token}` },
});
export const uploadVideo = (formData, token) => axios.post(`${STORAGE_SERVICE_URL}/upload`, formData, {
  headers: { Authorization: `Bearer ${token}` },
});
export const getAllVideos = (token) => axios.get(`${STORAGE_SERVICE_URL}/videos`, {
  headers: { Authorization: `Bearer ${token}` },
});
export const getVideoDetails = (id, token) => axios.get(`${STORAGE_SERVICE_URL}/videos/${id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
