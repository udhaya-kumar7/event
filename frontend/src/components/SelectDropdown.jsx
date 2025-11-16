import React, { useEffect, useRef, useState } from 'react';

export default function SelectDropdown({ options = [], value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const label = (() => {
    const found = options.find((o) => (o.value ?? o) === value);
    if (found) return found.label ?? found;
    // fallback to first option label
    const first = options[0];
    return first ? (first.label ?? first) : '';
  })();

  return (
    <div ref={ref} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-4 py-2 rounded-md border border-white/10 bg-transparent text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {label}
      </button>

      {open && (
        <div className="absolute mt-2 w-44 bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg z-50">
          <div className="py-1">
            {options.map((opt, idx) => {
              const val = opt.value ?? opt;
              const lab = opt.label ?? opt;
              const active = val === value;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(val);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${active ? 'bg-white/5 text-white' : 'text-gray-200 hover:bg-white/5'}`}
                >
                  {lab}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
