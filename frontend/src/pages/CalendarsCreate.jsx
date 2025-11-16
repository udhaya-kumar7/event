import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

// Use relative API paths so production builds hit same origin or axios.defaults.baseURL

const COLOR_OPTIONS = [
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Yellow", value: "#facc15" },
  { name: "Orange", value: "#fb923c" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const CalendarsCreate = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [visibility, setVisibility] = useState("private");
  const [startDate, setStartDate] = useState(todayIso());
  const [touched, setTouched] = useState(false);

  const descriptionCount = description.length;

  const nameError = useMemo(() => {
    if (!touched) return "";
    if (!name.trim()) return "Calendar name is required.";
    return "";
  }, [name, touched]);

  const descriptionError = descriptionCount > 200 ? "Description must be 200 characters or less." : "";

  const isValid = name.trim().length > 0 && descriptionCount <= 200 && !!startDate;

  function handleSave(e) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      visibility,
      startDate,
    };

    // Post to backend
    axios.post('/api/calendars', payload, { withCredentials: true })
      .then((res) => {
        console.log('Calendar created:', res.data);
        navigate('/calendars');
      })
      .catch((err) => {
        console.error('Error creating calendar', err?.response?.data || err.message);
        // keep on the page so user can retry; could show toast
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">Create Calendar</h1>
              <p className="text-gray-300 mt-2">Set up your new calendar and manage your events.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/calendars"
                className="px-4 py-2 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition"
              >
                Back
              </Link>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Calendar Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                className={`w-full bg-gray-800 border ${nameError ? "border-red-500" : "border-gray-700"} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
                placeholder="e.g. Team Events"
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "name-error" : undefined}
              />
              {nameError && <p id="name-error" className="mt-2 text-sm text-red-400">{nameError}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-gray-800 border ${descriptionError ? "border-red-500" : "border-gray-700"} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition h-28 resize-none`}
                placeholder="Optional short description (max 200 characters)"
                maxLength={400}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <div>{descriptionError ? <span className="text-red-400">{descriptionError}</span> : <span>&nbsp;</span>}</div>
                <div>{descriptionCount}/200</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Color / Theme</label>
                <div className="flex items-center gap-3">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      aria-label={opt.name}
                      className={`w-9 h-9 rounded-md border-2 ${color === opt.value ? "border-white" : "border-gray-700"} flex-shrink-0 transition transform hover:scale-105`}
                      style={{ backgroundColor: opt.value }}
                    />
                  ))}
                  <div className="ml-3 text-sm text-gray-300">Selected</div>
                  <div className="w-6 h-6 rounded ml-2" style={{ backgroundColor: color }} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Visibility</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                      className="form-radio text-pink-500 bg-gray-800"
                    />
                    <span className="text-gray-300">Private</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="form-radio text-pink-500 bg-gray-800"
                    />
                    <span className="text-gray-300">Public</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white transition focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex gap-3">
                <Link
                  to="/calendars"
                  className="px-4 py-3 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition"
                >
                  Cancel
                </Link>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!isValid}
                  className={`inline-flex items-center gap-3 px-5 py-3 font-medium rounded-lg shadow-md transition transform ${isValid ? "bg-gradient-to-r from-red-500 to-gray-800 hover:scale-[1.02] text-white" : "opacity-60 cursor-not-allowed bg-gradient-to-r from-red-500 to-gray-800 text-white"}`}
                >
                  Save Calendar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CalendarsCreate;
