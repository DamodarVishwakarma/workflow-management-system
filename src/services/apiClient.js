import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'development' ? 'http://13.126.50.98/api/v1' : ''
);

if (!apiBaseUrl) {
  throw new Error('REACT_APP_API_URL must be configured for production builds.');
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowboard-access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;