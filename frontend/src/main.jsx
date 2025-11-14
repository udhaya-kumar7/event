import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";
import axios from 'axios';

// ensure axios sends cookies for protected endpoints
axios.defaults.withCredentials = true;
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

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
