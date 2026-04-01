import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// We rely on <ApiProvider> inside AppLayout to inject the Clerk Token 
// dynamically since it requires the useAuth hook inside react context.

export default api;
