import React from "react";
import { Link } from "react-router-dom";

const Calendar = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto p-8 bg-gray-800/60 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-gray-300 mb-6">Month view will be rebuilt — for now this page matches the site theme.</p>

          <div className="flex gap-3">
            <Link to="/discover" className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-semibold">Discover</Link>
            <Link to="/calendars" className="px-4 py-2 rounded border border-gray-700">Calendars</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

