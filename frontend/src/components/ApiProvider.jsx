import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../services/api';

const ApiProvider = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get Clerk token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return children;
};

export default ApiProvider;
