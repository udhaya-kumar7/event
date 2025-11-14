import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const CalendarDetail = () => {
  const { id } = useParams();
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [myCalendarEvents, setMyCalendarEvents] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  // calendar grid and create modal state
  const [viewDate, setViewDate] = useState(() => new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', date: '', time: '', location: '', category: '', description: '', image: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const pCal = axios.get(`${API_BASE}/api/calendars/${id}`, { withCredentials: true });

    const loadEvents = () => axios.get(`${API_BASE}/api/events/calendar/${id}`, { withCredentials: true });

    Promise.all([pCal, loadEvents()])
      .then(async ([calRes, evRes]) => {
        if (!mounted) return;
        setCalendar(calRes.data);
        const allEvents = evRes.data || [];
        // try to get current user and separate events
        let meId = null;
        try {
          const me = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
          meId = me.data?._id || me.data?.id || null;
          setCurrentUserId(meId);
        } catch (e) {
          meId = null;
          setCurrentUserId(null);
        }

        if (meId) {
          const mine = allEvents.filter(ev => (ev.createdBy && (ev.createdBy._id || ev.createdBy).toString()) === meId);
          const others = allEvents.filter(ev => (ev.createdBy && (ev.createdBy._id || ev.createdBy).toString()) !== meId);
          setMyCalendarEvents(mine);
          setEvents(others);
        } else {
          setMyCalendarEvents([]);
          setEvents(allEvents);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError(err?.response?.data?.message || err.message || 'Failed to load');
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/events/calendar/${id}`, { withCredentials: true });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to refresh events', err);
    }
  };

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .map(e => ({ ...e, _date: new Date(e.date) }))
      .filter(e => e._date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const past = useMemo(() => {
    const now = new Date();
    return events
      .map(e => ({ ...e, _date: new Date(e.date) }))
      .filter(e => e._date < new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [events]);

  function toggleSubscribe() {
    // Local toggle for now; backend subscription endpoint for calendars can be added later
    setSubscribed(s => !s);
  }

  // --- calendar grid helpers ---
  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
  function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
  function formatISO(d) { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const key = ev.date?.slice(0,10) || formatISO(new Date(ev.date));
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const monthGrid = useMemo(() => {
    const first = startOfMonth(viewDate);
    const startDay = first.getDay();
    const gridStart = addDays(first, -startDay);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      const iso = formatISO(d);
      cells.push({ date: d, iso, events: eventsByDate[iso] || [] });
    }
    return cells;
  }, [viewDate, eventsByDate]);

  function openCreateOn(date) {
    const iso = formatISO(date);
    setCreateForm({ title: '', date: iso, time: '', location: '', category: '', description: '', image: '' });
    setShowCreateModal(true);
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    // basic validation
    if (!createForm.title || !createForm.date || !createForm.time || !createForm.location) {
      toast.error('Please fill required fields');
      return;
    }

    const payload = {
      title: createForm.title,
      date: createForm.date,
      time: createForm.time,
      location: createForm.location,
      category: createForm.category,
      description: createForm.description,
      image: createForm.image || '',
      calendarId: id,
      createdBy: (localStorage.getItem('clientId') || (() => { const cid = `client_${Date.now()}_${Math.floor(Math.random()*10000)}`; localStorage.setItem('clientId', cid); return cid; })()),
    };

    try {
      const res = await axios.post(`${API_BASE}/api/events`, payload, { withCredentials: true });
      toast.success('Event created');
      setShowCreateModal(false);
      // refresh events
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event', err);
      toast.error('Failed to create event');
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white min-h-screen">
      {/* Hero */}
      <div className="relative py-12">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: `linear-gradient(90deg, ${calendar?.color || '#0ea5e9'}33, transparent)` }}>
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-extrabold">{calendar?.name || 'Calendar'}</h1>
                <p className="text-gray-300 mt-3 max-w-xl">{calendar?.description || 'No description yet.'}</p>
                <div className="flex items-center gap-3 mt-6">
                  <button onClick={toggleSubscribe} className={`px-4 py-2 rounded-md font-semibold transition ${subscribed ? 'bg-gray-700 border border-gray-600' : 'bg-gradient-to-r from-pink-500 to-yellow-400 text-black'}`}>
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                  <Link to="/calendars" className="px-4 py-2 rounded-md border border-gray-700 text-white">Back to Calendars</Link>
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Visibility</div>
                  <div className="font-medium">{calendar?.visibility || 'Private'}</div>
                </div>
                <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: calendar?.color || '#ec4899' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: events feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
              <div className="text-sm text-gray-400">{upcoming.length} upcoming</div>
            </div>

            {loading && <div className="text-gray-400">Loading events…</div>}
            {error && <div className="text-red-400">{error}</div>}

            {!loading && !error && upcoming.length === 0 && (
              <div className="bg-gray-900 rounded-lg p-6 text-gray-400">No upcoming events for this calendar.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map(ev => (
                <div key={ev._id} className="bg-gray-800 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-medium">{ev.title}</div>
                      <div className="text-sm text-gray-300 mt-1">{new Date(ev.date).toLocaleDateString()} • {ev.time}</div>
                    </div>
                    <div className="text-sm text-gray-400">{ev.location}</div>
                  </div>
                  {ev.description && <div className="text-sm text-gray-300 mt-3 truncate">{ev.description}</div>}
                </div>
              ))}
            </div>

              {/* Compact month grid for quick navigation & create */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-400">Calendar Overview</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="px-2 py-1 rounded border border-gray-700">Prev</button>
                    <button onClick={() => setViewDate(new Date())} className="px-2 py-1 rounded border border-gray-700">Today</button>
                    <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="px-2 py-1 rounded border border-gray-700">Next</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 bg-gray-900 rounded-lg p-3">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-xs text-gray-400 text-center">{d}</div>
                  ))}

                  {monthGrid.map((cell, idx) => {
                    const isCurrentMonth = cell.date.getMonth() === viewDate.getMonth();
                    const hasEvents = cell.events.length > 0;
                    return (
                      <div key={idx} className={`p-2 h-28 text-left rounded-lg relative ${isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900/40'}`}>
                        <div className="flex items-start justify-between">
                          <div className="text-sm font-medium text-white">{cell.date.getDate()}</div>
                          <button onClick={() => openCreateOn(cell.date)} className="text-xs text-gray-300 px-2 py-1 rounded hover:bg-gray-700">+ Create</button>
                        </div>

                        <div className="mt-2 space-y-1">
                          {cell.events.slice(0,2).map(ev => (
                            <div key={ev._id} className="text-xs truncate bg-gray-700/30 px-2 py-1 rounded text-gray-100">{ev.title}</div>
                          ))}
                          {hasEvents && cell.events.length > 2 && <div className="text-xs text-gray-400">+{cell.events.length - 2} more</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            {/* Past events */}
            {past.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Past Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {past.map(ev => (
                    <div key={ev._id} className="bg-gray-900 rounded-lg p-3 text-gray-300">
                      <div className="font-medium">{ev.title}</div>
                      <div className="text-sm text-gray-400">{new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <aside className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-sm text-gray-400">About this calendar</div>
              <div className="text-sm text-gray-300 mt-2">{calendar?.description || '—'}</div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Next events</div>
              <div className="space-y-3">
                {upcoming.slice(0,3).map(ev => (
                  <div key={ev._id} className="flex items-start justify-between">
                    <div className="text-sm">
                      <div className="font-medium">{ev.title}</div>
                      <div className="text-xs text-gray-400">{new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs text-gray-400">{ev.time}</div>
                  </div>
                ))}
                {upcoming.length === 0 && <div className="text-sm text-gray-400">No upcoming events</div>}
              </div>
            </div>

            {myCalendarEvents.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Your events in this calendar</div>
                <div className="space-y-3">
                  {myCalendarEvents.map(ev => (
                    <div key={ev._id} className="flex items-start justify-between">
                      <div className="text-sm">
                        <div className="font-medium">{ev.title}</div>
                        <div className="text-xs text-gray-400">{new Date(ev.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs text-gray-400">{ev.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-sm text-gray-400">Owner</div>
              <div className="mt-2 text-sm text-gray-200">{calendar?.createdBy?.email || 'Unknown'}</div>
            </div>
          </aside>
        </div>
      </div>
      
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Event on {createForm.date}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400">Close</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <input value={createForm.title} onChange={(e) => setCreateForm(f => ({...f, title: e.target.value}))} placeholder="Title" className="w-full p-3 rounded bg-gray-700" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={createForm.date} onChange={(e) => setCreateForm(f => ({...f, date: e.target.value}))} className="p-3 rounded bg-gray-700" required />
                <input type="time" value={createForm.time} onChange={(e) => setCreateForm(f => ({...f, time: e.target.value}))} className="p-3 rounded bg-gray-700" required />
              </div>
              <input value={createForm.location} onChange={(e) => setCreateForm(f => ({...f, location: e.target.value}))} placeholder="Location" className="w-full p-3 rounded bg-gray-700" required />
              <input value={createForm.category} onChange={(e) => setCreateForm(f => ({...f, category: e.target.value}))} placeholder="Category" className="w-full p-3 rounded bg-gray-700" />
              <textarea value={createForm.description} onChange={(e) => setCreateForm(f => ({...f, description: e.target.value}))} placeholder="Description" className="w-full p-3 rounded bg-gray-700 h-28 resize-none" />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded border border-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-yellow-400 text-black">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDetail;
