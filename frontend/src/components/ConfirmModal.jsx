import React from 'react';

const ConfirmModal = ({ open, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-gray-900 text-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-sm text-gray-300 mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
