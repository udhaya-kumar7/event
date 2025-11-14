import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const resp = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (!mounted) return;
        if (resp.ok) {
          const data = await resp.json();
          if (data?.user?.email) localStorage.setItem('authUser', data.user.email);
          setAuthed(true);
        } else {
          localStorage.removeItem('authUser');
          setAuthed(false);
        }
      } catch (err) {
        localStorage.removeItem('authUser');
        setAuthed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => { mounted = false; };
  }, [location.pathname]);

  if (checking) return null;
  if (!authed) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
