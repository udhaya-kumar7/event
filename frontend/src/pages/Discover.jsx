import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import SelectDropdown from '../components/SelectDropdown';

const categories = [
  { id: 'music', title: 'Music', img: '/images/event1.jpg' },
  { id: 'tech', title: 'Tech', img: '/images/event2.jpg' },
  { id: 'food', title: 'Food', img: '/images/event3.jpg' },
  { id: 'sports', title: 'Sports', img: '/images/event4.jpg' },
  { id: 'wellness', title: 'Wellness', img: '/images/event5.jpg' }
];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const Discover = () => {
  const [events, setEvents] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('Newest');
  const [dateFilter, setDateFilter] = useState('Any date');
  const location = useLocation();

  useEffect(() => {
    // reflect any q= query param into the local search state
    const params = new URLSearchParams(location.search || '');
    const q = params.get('q') || '';
    setSearchQuery(q);

    const fetchEvents = async () => {
      try {
        // try to get current user id (optional)
        let meId = null;
        try {
          const me = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
          if (me.ok) {
            const u = await me.json();
            meId = u._id || u.id || null;
            setCurrentUserId(meId);
          }
        } catch (ignore) {}

        const res = await fetch(`${API_BASE}/api/events`);
        const data = await res.json();
        // if we have a current user, hide their events from "All results"
        if (meId) {
          const filtered = (data || []).filter(ev => {
            const owner = ev.createdBy && (ev.createdBy._id || ev.createdBy).toString();
            return owner !== meId;
          });
          setEvents(filtered);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        console.error('Error loading events', err);
      } finally {
        setLoading(false);
      }
  };
    fetchEvents();
  }, [location.search]);

  const filtered = events.filter(ev => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQ = !q || ev.title.toLowerCase().includes(q) || (ev.description || '').toLowerCase().includes(q);
    const matchesCat = !category || ev.category === category;
    return matchesQ && matchesCat;
  });

  const trending = [...events].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,6);

  return (
  <div className="min-h-screen text-white">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-red-600/20 to-yellow-400/10 mix-blend-overlay pointer-events-none" />
        <div className="relative">
          <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} category={category} setCategory={setCategory} />
        </div>
      </header>

      <section className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Browse by category</h2>
            <div className="text-sm text-gray-400">Showing {filtered.length} results</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCategory(category === cat.id ? '' : cat.id)} className={`relative rounded-2xl overflow-hidden shadow-2xl transform transition hover:scale-105 ${category===cat.id ? 'ring-2 ring-red-500' : ''}`}>
                <img src={cat.img} alt={cat.title} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-black/35 flex items-end p-4">
                  <div className="text-white font-semibold text-base md:text-lg">{cat.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-300">Sort</div>
                <SelectDropdown
                  options={[{ value: 'Newest', label: 'Newest' }, { value: 'Popular', label: 'Popular' }, { value: 'Nearest', label: 'Nearest' }]}
                  value={sort}
                  onChange={setSort}
                />
                <SelectDropdown
                  options={[{ value: 'Any date', label: 'Any date' }, { value: 'Today', label: 'Today' }, { value: "This week", label: 'This week' }]}
                  value={dateFilter}
                  onChange={setDateFilter}
                />
              </div>

              <div className="text-sm text-gray-400">{filtered.length} results</div>
            </div>

            {/* Event Grid */}
            {loading ? (
              <div className="text-gray-400">Loading events...</div>
            ) : filtered.length === 0 ? (
              <div className="text-gray-400">No events found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map(ev => <EventCard key={ev._id} event={ev} />)}
              </div>
            )}

            <div className="mt-8 text-center">
              <button className="px-5 py-2 rounded-lg bg-white/6">Load more</button>
            </div>
          </div>

          {/* Right sidebar: Trending / Small highlights */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-900/50 rounded-2xl p-4 shadow-lg">
              <h4 className="text-lg font-semibold mb-3">Trending</h4>
              <div className="flex flex-col gap-3">
                {trending.map(ev => (
                  <div key={ev._id} className="flex items-center gap-3">
                    <img src={ev.image || '/images/event1.jpg'} alt={ev.title} className="w-16 h-12 object-cover rounded-md" />
                    <div>
                      <div className="text-sm font-medium">{ev.title}</div>
                      <div className="text-xs text-gray-400">{new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Discover;
