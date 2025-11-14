import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Discover from "./pages/Discover";
import Calendar from "./pages/Calendar";
import CalendarsPage from "./pages/CalendarsPage";
import CalendarsCreate from "./pages/CalendarsCreate";
import CalendarDetail from "./pages/CalendarDetail";
import Events from "./pages/Events"; // ✅ add this
import Starfield from "./components/Starfield";
import Nebula from "./components/Nebula";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const hideShell = location.pathname === "/login" || location.pathname === "/reset-password";

  return (
  <div className="relative flex flex-col min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* animated background layers (only shown when shell is visible) */}
      {!hideShell && (
        <>
          {/* Hide heavy animated backgrounds on small screens for performance */}
          <div className="hidden sm:block">
            <Nebula className="-z-40" tint={'255,60,60'} opacity={0.16} />
            <Starfield className="-z-30" tint={'255,120,100'} densityScale={1.0} />
            {/* subtle vignette + glow overlay to make colors pop */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: 'radial-gradient(60% 40% at 20% 20%, rgba(255,80,80,0.06), transparent 15%), radial-gradient(60% 40% at 80% 80%, rgba(255,140,120,0.05), transparent 20%)' }} />
          </div>
        </>
      )}

      {!hideShell && <Navbar />}

      {/* Main content should grow to fill space */}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          {/* legacy single-calendar path -> redirect to calendars list */}
          <Route path="/calendar" element={<Navigate to="/calendars" replace />} />
          <Route path="/calendars" element={<ProtectedRoute><CalendarsPage /></ProtectedRoute>} />
          <Route path="/calendars/create" element={<ProtectedRoute><CalendarsCreate /></ProtectedRoute>} />
          <Route path="/calendars/:id" element={<ProtectedRoute><CalendarDetail /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} /> {/* ✅ add this */}
        </Routes>
      </main>

      {/* Footer removed per request */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
