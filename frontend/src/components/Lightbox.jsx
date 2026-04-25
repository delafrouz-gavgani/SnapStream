import React, { useEffect } from 'react';

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300 transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Image'; }}
      />
    </div>
  );
}
