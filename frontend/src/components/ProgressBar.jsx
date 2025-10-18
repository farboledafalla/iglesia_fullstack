import React from 'react';

export default function ProgressBar({ percent = 0 }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="w-full bg-gray-200 rounded h-4">
      <div className="bg-green-500 h-4 rounded" style={{ width: `${p}%` }} />
    </div>
  );
}
