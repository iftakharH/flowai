import axios from 'axios';

const buildApiBaseUrl = () => {
  const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();

  // Normalize API base URL so both "https://host" and "https://host/api" work.
  return /\/api\/?$/i.test(rawBaseUrl)
    ? rawBaseUrl.replace(/\/$/, '')
    : `${rawBaseUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: buildApiBaseUrl(),
  withCredentials: true,
});

// <ApiProvider> injects Firebase ID tokens into each request.

export default api;
