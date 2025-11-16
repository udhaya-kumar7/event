import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";
import axios from 'axios';

// ensure axios sends cookies for protected endpoints
axios.defaults.withCredentials = true;
// Determine API base URL:
// 1. If VITE_API_BASE is set and non-empty, use it (production builds on Vercel/Render can set this).
// 2. Otherwise, if running in the browser use the current origin (same-origin deploy where backend serves the frontend).
// 3. Fallback to localhost for local development.
const envApiBase = import.meta.env.VITE_API_BASE;
const API_BASE = envApiBase && envApiBase !== ''
  ? envApiBase
  : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
axios.defaults.baseURL = API_BASE;

// Automatic refresh flow: on 401 try to refresh the access token using the refresh cookie
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_BASE}/api/auth/refresh`);
        return axios(originalRequest);
      } catch (refreshErr) {
        console.log('token refresh failed', refreshErr);
        // redirect to login so user can re-authenticate
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
     <Toaster position="top-right" reverseOrder={false} />
  </StrictMode>,
)
