import React from "react";
import CalendarCard from "./CalendarCard";

const CalendarSection = ({ title, items = [], onCardClick, onDelete }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-white">{title}</h2>
        <div className="text-sm text-gray-400">{items.length} {items.length === 1 ? 'calendar' : 'calendars'}</div>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-400">No calendars found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((c) => (
            <CalendarCard key={c.id} calendar={c} onClick={() => onCardClick && onCardClick(c.id)} onDelete={(id) => onDelete && onDelete(id)} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CalendarSection;
