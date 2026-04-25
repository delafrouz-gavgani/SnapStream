import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
