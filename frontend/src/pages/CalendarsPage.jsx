import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CalendarSection from "../components/CalendarSection";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const CalendarsPage = () => {
  const navigate = useNavigate();
  const [myCalendars, setMyCalendars] = useState([]);
  const [allCalendars, setAllCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const mapToCard = (c) => ({ id: c._id, title: c.name || c.title || 'Untitled', description: c.description || '', eventCount: c.eventCount || 0, color: c.color, visibility: c.visibility, ownerId: c.createdBy?._id || (c.createdBy || null) });

    const loadCalendars = async () => {
      setLoading(true);
      setError(null);
      try {
        // attempt to get current user so we can exclude their calendars from "All Calendars"
        let meId = null;
        try {
          const me = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
          meId = me.data?._id || me.data?.id || null;
        } catch (ignore) {}

        const p1 = axios.get(`${API_BASE}/api/calendars`, { withCredentials: true });
        const p2 = axios.get(`${API_BASE}/api/calendars/user/list`, { withCredentials: true }).catch((err) => {
          if (err.response && err.response.status === 401) return { data: [] };
          throw err;
        });

        const [allRes, myRes] = await Promise.all([p1, p2]);
        if (!mounted) return;
        const allList = (allRes.data || []).map(mapToCard);
        const myList = (myRes.data || []).map(mapToCard);
        // exclude my calendars from 'All Calendars' for clarity
        const filteredAll = meId ? allList.filter(c => String(c.ownerId) !== String(meId)) : allList;
        setAllCalendars(filteredAll);
        setMyCalendars(myList);
      } catch (err) {
        console.error('Error fetching calendars', err);
        if (mounted) setError(err.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial load
    loadCalendars();

    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/calendars/${id}`, { withCredentials: true });
      // refresh lists from server to ensure consistent state
      const p1 = axios.get(`${API_BASE}/api/calendars`, { withCredentials: true });
      const p2 = axios.get(`${API_BASE}/api/calendars/user/list`, { withCredentials: true }).catch((err) => {
        if (err.response && err.response.status === 401) return { data: [] };
        throw err;
      });
      const [allRes, myRes] = await Promise.all([p1, p2]);
      const mapToCard = (c) => ({ id: c._id, title: c.name || c.title || 'Untitled', description: c.description || '', eventCount: c.eventCount || 0, color: c.color, visibility: c.visibility });
      setAllCalendars((allRes.data || []).map(mapToCard));
      setMyCalendars((myRes.data || []).map(mapToCard));
  toast.success('Calendar deleted');
    } catch (err) {
      console.error('Failed to delete calendar', err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to delete calendar';
      if (status === 401) {
        toast.error('Please sign in to delete calendars');
        navigate('/login');
        return;
      }
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen py-10 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Calendars</h1>
            <p className="text-gray-400 text-sm">Manage your calendars</p>
          </div>

          <div>
            <button
              onClick={() => navigate('/calendars/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-gray-800 text-white rounded-md shadow hover:scale-[1.02] transition"
            >
              + Create Calendar
            </button>
          </div>
        </div>

        <div className="space-y-10">
          {loading && <p className="text-gray-400">Loading calendars…</p>}
          {error && <p className="text-red-400">{error}</p>}

          <CalendarSection title="My Calendars" items={myCalendars} onCardClick={(id) => navigate(`/calendars/${id}`)} onDelete={handleDelete} emptyMessage="You have no calendars yet — create one." />

          <CalendarSection title="All Calendars" items={allCalendars} onCardClick={(id) => navigate(`/calendars/${id}`)} onDelete={handleDelete} emptyMessage="No public calendars available." />
        </div>
      </div>
    </div>
  );
};

export default CalendarsPage;
