import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    (async () => {
      try {
        if (!email || !password) return setError("Please provide email and password");
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const resp = await axios.post(`${API_BASE}/api/auth/signup`, { email, password }, { withCredentials: true });
        if (resp.data && resp.data.user) {
          if (!localStorage.getItem("clientId")) {
            const id = `client_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("clientId", id);
          }
          navigate("/");
        } else {
          setError(resp.data?.message || 'Signup failed');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Signup failed');
      }
    })();
  };

  const handleSignin = () => {
    (async () => {
      try {
        if (!email || !password) return setError("Please provide email and password");
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const resp = await axios.post(`${API_BASE}/api/auth/login`, { email, password }, { withCredentials: true });
        if (resp.data && resp.data.user) {
          if (!localStorage.getItem("clientId")) {
            const id = `client_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            localStorage.setItem("clientId", id);
          }
          navigate("/");
        } else {
          setError(resp.data?.message || 'Login failed');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    })();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signin") handleSignin(); else handleSignup();
  };

  const handleForgot = async () => {
    const emailToUse = prompt('Enter your account email for password reset:');
    if (!emailToUse) return;
    try {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const resp = await axios.post(`${API_BASE}/api/auth/request-reset`, { email: emailToUse }, { withCredentials: true });
      if (resp.data?.resetLink) {
        alert('Reset link (dev): ' + resp.data.resetLink);
      } else {
        alert('If an account exists, a reset link was sent.');
      }
    } catch (err) {
      alert('Error requesting reset');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-800/80 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{mode === "signin" ? "Sign in" : "Create account"}</h2>
        <p className="text-sm text-gray-400 mb-6">{mode === "signin" ? "Welcome back — please sign in." : "Create a local account for this demo."}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded bg-gray-700 outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700 outline-none" required />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>

        <div className="mt-4 text-sm text-gray-400 text-center">
          {mode === "signin" ? (
            <>
              Don't have an account? <button onClick={() => { setMode("signup"); setError(""); }} className="text-blue-300 underline">Create one</button>
            </>
          ) : (
            <>
              Already have an account? <button onClick={() => { setMode("signin"); setError(""); }} className="text-blue-300 underline">Sign in</button>
            </>
          )}
        </div>
        <div className="mt-3 text-center">
          <button className="text-sm text-gray-300 underline" onClick={handleForgot}>Forgot password?</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
