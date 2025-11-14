import React, { useState } from "react";
import ConfirmModal from './ConfirmModal';

const CalendarCard = ({ calendar, onClick, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    // ask parent to delete; parent manages API and toast
    onDelete && onDelete(calendar.id);
    setMenuOpen(false);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-full text-left bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-700 hover:scale-[1.02] transform transition p-5 flex flex-col justify-between h-40"
      >
        <div>
          <div className="text-lg font-semibold mb-1 text-white">{calendar.title}</div>
          {calendar.description && <div className="text-sm text-gray-300">{calendar.description}</div>}
        </div>

        <div className="mt-4 text-sm text-gray-400">{calendar.eventCount} {calendar.eventCount === 1 ? 'event' : 'events'}</div>
      </button>

      {/* 3-dot menu */}
      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((s) => !s); }}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          className="p-1 rounded hover:bg-gray-700"
        >
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="mt-2 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg p-2 text-sm">
            <button className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded">Edit</button>
            <button disabled={loadingDelete} onClick={handleDeleteClick} className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded">{loadingDelete ? 'Deleting...' : 'Delete'}</button>
            <button className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded">Unsubscribe</button>
          </div>
        )}
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={`Delete calendar "${calendar.title}"?`}
        message="This action cannot be undone. Are you sure you want to delete this calendar?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default CalendarCard;
