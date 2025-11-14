import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageForEvent } from '../utils/eventImages';

const EventCard = ({ event }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    let mounted = true;

    const load = async () => {
      try {
        const me = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
        if (me.status === 200 && me.data) {
          setIsAuth(true);
        }
      } catch (e) {
        if (mounted) setIsAuth(false);
      }

      try {
        const url = `${API_BASE}/api/events/subscription-status?eventId=${event._id}${!isAuth && email ? `&email=${encodeURIComponent(email)}` : ''}`;
        const res = await axios.get(url, { withCredentials: true });
        if (mounted) setSubscribed(res.data.subscribed);
      } catch (err) {
        // ignore
      }
    };

    load();
    return () => { mounted = false; };
  }, [email, event._id, isAuth]);

  const handleSubscribe = async () => {
    if (!email && !isAuth) {
      setShowToast('Please enter your email');
      setTimeout(() => setShowToast(null), 2200);
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const body = { eventId: event._id };
      if (!isAuth) body.email = email;
      const res = await axios.post(`${API_BASE}/api/events/subscribe`, body, { withCredentials: true });
      setShowToast(res.data.message || 'Subscribed');
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setShowToast(err?.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
      setTimeout(() => setShowToast(null), 2200);
    }
  };

  const shortDesc = event.description && event.description.length > 140 ? event.description.slice(0, 137) + '...' : event.description;

  return (
    <article className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-gray-900/60 to-gray-900/80 hover:scale-[1.01] transform transition-all duration-300">
      <div className="relative h-56 w-full">
        <img src={getImageForEvent(event)} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute left-4 bottom-4 right-4">
          <h3 className="text-xl md:text-2xl font-semibold text-white drop-shadow-md">{event.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-200">
            <span className="inline-flex items-center gap-2 bg-white/6 px-2 py-1 rounded-full">{event.date} • {event.time}</span>
            <span className="inline-flex items-center gap-2 bg-white/6 px-2 py-1 rounded-full">{event.location}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-gray-300 text-sm mb-4">{shortDesc}</p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!isAuth && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full sm:flex-1 bg-white text-black placeholder-gray-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              disabled={subscribed}
            />
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || subscribed}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${subscribed ? 'bg-gray-600 text-white cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-gray-800 text-white shadow-md hover:opacity-95'}`}
          >
            {loading ? '…' : subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Toast Message */}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-black/80 border border-white/10 text-white px-4 py-2 rounded-md shadow-lg">
            {showToast}
          </div>
        )}
      </div>
    </article>
  );
};

export default EventCard;
