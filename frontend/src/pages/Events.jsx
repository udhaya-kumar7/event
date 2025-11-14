import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import EventCard from "../components/EventCard";

const defaultImages = [
  "/images/event1.jpg",
  "/images/event2.jpg",
  "/images/event3.jpg",
  "/images/event4.jpg",
  "/images/event5.jpg",
];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "",
    description: "",
    image: "",
  });

  const [previewImage, setPreviewImage] = useState(
    defaultImages[Math.floor(Math.random() * defaultImages.length)]
  );
  const [calendars, setCalendars] = useState([]);
  
  const [dominantColor, setDominantColor] = useState("#0f172a");
  const imageRef = useRef(null);

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/calendars/user/list`, { credentials: 'include' });
      if (res.status === 401) return setCalendars([]);
      const data = await res.json();
      setCalendars(data || []);
    } catch (err) {
      console.error('Error fetching calendars', err);
      setCalendars([]);
    }
  };

  const fetchEvents = async () => {
    try {
      // fetch only authenticated user's events
      const response = await fetch(`${API_BASE}/api/events/me`, { credentials: 'include' });
      if (response.status === 401) {
        // not authenticated -> treat as no events
        setEvents([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setEvents(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  // Extract dominant color from image
  const extractDominantColor = (imageSrc) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        // Darken the color for better background effect
        r = Math.floor(r * 0.6);
        g = Math.floor(g * 0.6);
        b = Math.floor(b * 0.6);

        setDominantColor(`rgb(${r}, ${g}, ${b})`);
      } catch (error) {
        console.log("Could not extract color (CORS issue), using default");
        setDominantColor("#0f172a");
      }
    };

    img.onerror = () => {
      setDominantColor("#0f172a");
    };
  };

  // Extract color whenever image changes (only when form is shown)
  useEffect(() => {
    if (showForm) {
      extractDominantColor(previewImage);
    }
  }, [previewImage, showForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live image preview if user provides URL
    if (name === "image") {
      setPreviewImage(value || previewImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // include calendarId if user selected one
      const payloadBody = {
        ...formData,
        image: formData.image || previewImage, // Use provided image or default
      };

      if (formData.calendarId) payloadBody.calendarId = formData.calendarId;

      const response = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payloadBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 Event created successfully!");
        console.log("Event Created:", data);

        // Reset form
        setFormData({
          title: "",
          date: "",
          time: "",
          location: "",
          category: "",
          description: "",
          image: "",
          calendarId: "",
        });

        // Pick a new random default image for next event
        setPreviewImage(defaultImages[Math.floor(Math.random() * defaultImages.length)]);
        setShowForm(false);
        
        // Refresh events list
        fetchEvents();
        // Refresh calendars in case counts change
        fetchCalendars();
      } else if (response.status === 401) {
        toast.error('Please sign in to create events');
        setShowForm(false);
        // redirect to login
        window.location.href = '/login';
      } else {
        toast.error(data.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center py-16 px-6 text-white transition-colors duration-1000"
      style={{ backgroundColor: showForm ? dominantColor : undefined }}
    >
  {/* (Global background layers moved to App.jsx) */}
      {/* Blurred Background with Dominant Color Overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {showForm && (
          <>
            <img
              ref={imageRef}
              src={previewImage}
              alt="bg"
              className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 transition-colors duration-1000"
              style={{ 
                background: `linear-gradient(to bottom, ${dominantColor}99, transparent, ${dominantColor}cc)` 
              }}
            />
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-7xl z-10 px-4"
          >
            {loading ? (
              <div className="text-center text-gray-300">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                  No Upcoming Events
                </h1>
                <p className="text-gray-300">
                  You have no upcoming events. Why not host one?
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-gray-800 rounded-lg font-semibold shadow-md text-white hover:opacity-95"
                >
                  Host an Event
                </motion.button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                    Your Events
                  </h1>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-gray-800 rounded-lg font-semibold shadow-md text-white hover:opacity-95"
                  >
                    Host an Event
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="z-10 bg-gray-800/80 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-6xl backdrop-blur-lg"
          >
            {/* Form Section */}
            <motion.div
              className="flex-1 p-8"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-400">
                Host Your Event
              </h1>
              <p className="text-gray-400 mb-8">
                Create a professional event page with details, images, and more.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />

                <input
                  type="text"
                  name="category"
                  placeholder="Category (e.g., Music, Tech, Food)"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <textarea
                  name="description"
                  placeholder="Event Description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>

                <input
                  type="url"
                  name="image"
                  placeholder="Event Image URL (optional)"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                {/* Calendar selector */}
                <select
                  name="calendarId"
                  value={formData.calendarId || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Assign to calendar (optional)</option>
                  {calendars.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-1/2 bg-gray-600 hover:bg-gray-700 p-3 rounded font-semibold transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-gradient-to-r from-red-500 to-gray-800 hover:opacity-95 p-3 rounded font-semibold transition duration-300 text-white"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Image Preview Section */}
            <motion.div
              className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-900/60"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={previewImage}
                alt="Event Preview"
                className="w-full h-80 object-cover rounded-2xl shadow-lg mb-4"
              />
              <p className="text-gray-300">Live Preview</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
