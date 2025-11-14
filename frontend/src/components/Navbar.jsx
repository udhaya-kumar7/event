import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { to: "/events", label: "Events" },
  { to: "/discover", label: "Discover" },
  { to: "/calendars", label: "Calendars" },
];

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profileEvents, setProfileEvents] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const profileRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    const p = location.pathname || "/";
    if (path === "/") return p === "/";
    return p.startsWith(path);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timePart = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? "+" : "-";
      const absMinutes = Math.abs(offsetMinutes);
      const tzHours = Math.floor(absMinutes / 60);
      const tzMinutes = absMinutes % 60;
      const tzString = `GMT${sign}${tzHours}:${tzMinutes.toString().padStart(2, "0")}`;
      setTimeStr(`${timePart} ${tzString}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const fetchProfileEvents = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await fetch(`${API_BASE}/api/events/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // support different shapes: { events: [...] } or just array
        const events = data.events || data || [];
        setProfileEvents(events || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSignOut = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const q = (searchTerm || '').trim();
    // navigate to discover with query param
    navigate(`/discover${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setOpen(false);
  };

  const fetchNotifications = () => {
    // temporary: client-side placeholder notifications
    setNotifications([
      { id: 1, text: 'New event from Music category' },
      { id: 2, text: 'Your subscribed event starts tomorrow' },
    ]);
  };

  return (
    <header className="w-full px-4 py-3 bg-transparent">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-extrabold text-xl tracking-tight">Ichigo</span>
          </Link>

          {/* Center: Nav Links (desktop) */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={classNames(
                  "text-sm font-medium transition-colors",
                  isActive(l.to) ? "text-red-500" : "text-white hover:text-red-500"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Time + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-sm text-gray-300 mr-2">{timeStr}</div>

          {/* Search (desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-white/6 rounded-lg px-2 py-1 mr-3">
            <input
              className="bg-transparent placeholder-gray-200 text-white text-sm outline-none w-48"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="pl-2 pr-1 text-gray-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
            </button>
          </form>

          <Link to="/events" className="inline-block">
            <button className="px-4 py-2 rounded text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-gray-800 shadow-md hover:opacity-95 transition">
              Host an Event
            </button>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications((s) => !s); if (!showNotifications) fetchNotifications(); }}
              className="p-2 rounded-md hover:bg-white/5"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{notifications.length || 0}</span>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 border border-white/10 rounded-lg shadow-lg p-3 z-50">
                <div className="text-sm font-semibold mb-2">Notifications</div>
                <div className="max-h-52 overflow-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-sm text-gray-400">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="text-sm p-2 rounded hover:bg-white/5">{n.text}</div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile((s) => !s); if (!showProfile) fetchProfileEvents(); }}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Profile"
            >
              <svg className="w-8 h-8 rounded-full text-gray-100" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 border border-white/10 rounded-lg shadow-lg p-3 z-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">U</div>
                  <div>
                    <div className="font-semibold">Your Profile</div>
                    <div className="text-xs text-gray-400">Local user</div>
                  </div>
                </div>
                <div className="text-sm font-medium mb-2">Subscribed / Your Events</div>
                <div className="max-h-52 overflow-auto space-y-2 mb-3">
                  {(!profileEvents || profileEvents.length === 0) ? (
                    <div className="text-sm text-gray-400">No events yet</div>
                  ) : (
                    profileEvents.map((ev) => (
                      <div key={ev._id || ev.id} className="text-sm p-2 rounded hover:bg-white/5">
                        <div className="font-medium">{ev.title}</div>
                        <div className="text-xs text-gray-400">{ev.date} • {ev.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-1 pt-2 border-t border-white/10 flex flex-col gap-2">
                  <Link to="/events" onClick={() => setShowProfile(false)} className="block text-center px-3 py-2 rounded bg-gradient-to-r from-red-500 to-gray-800 text-sm font-semibold">Manage Events</Link>
                  <button onClick={handleSignOut} className="w-full text-center px-3 py-2 rounded bg-white/5 text-sm">Sign out</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button (visible on small screens) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/20"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile full-screen overlay menu */}
        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <div className="relative h-full flex flex-col items-center justify-center px-6">
              <button
                aria-label="Close menu"
                className="absolute top-6 right-6 text-white text-2xl"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

              {/* Mobile search */}
              <form onSubmit={handleSearchSubmit} className="w-full max-w-md mb-6">
                <div className="flex items-center bg-white/6 rounded-lg px-3 py-2">
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search events..." className="bg-transparent flex-1 outline-none text-white" />
                  <button type="submit" className="ml-2 text-gray-200">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                    </svg>
                  </button>
                </div>
              </form>

              <nav className="space-y-6 text-center">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={classNames(isActive(l.to) ? 'text-red-400' : 'text-white', 'block text-2xl font-semibold')}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-10 w-full max-w-xs">
                <Link
                  to="/create"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-6 py-3 rounded-md bg-gradient-to-r from-red-500 to-gray-800 text-white font-semibold text-lg shadow-lg"
                >
                  Host an Event
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
