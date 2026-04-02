import { useEffect } from 'react';
import api from '../services/api';
import { auth } from '../lib/firebase';

const TOKEN_STORAGE_KEY = 'flowai_firebase_id_token';

const ApiProvider = ({ children }) => {
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const user = auth.currentUser;
          const cachedToken = typeof window !== 'undefined'
            ? window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
            : null;
          const token = user ? await user.getIdToken(true) : cachedToken;
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get Firebase token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isUnauthorized = error.response?.status === 401;

        if (isUnauthorized && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const user = auth.currentUser;
            if (user) {
              const token = await user.getIdToken(true);
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
              }
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }

            if (typeof window !== 'undefined') {
              const cachedToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
              if (cachedToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${cachedToken}`;
                return api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh Firebase token after 401:', refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return children;
};

export default ApiProvider;
