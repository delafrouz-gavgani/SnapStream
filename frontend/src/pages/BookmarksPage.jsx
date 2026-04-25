import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookmarks } from '../services/api';
import ImageCard from '../components/ImageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark, ImageOff } from 'lucide-react';

export default function BookmarksPage() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then(res => setImages(res.data.bookmarks))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved</h1>
          <p className="text-gray-500 text-sm mt-0.5">{images.length} bookmarked item{images.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading saved items..." />
      ) : images.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ImageOff className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">Nothing saved yet</p>
          <p className="text-sm text-gray-400 mt-1">Bookmark images on the detail page to collect them here</p>
          <Link to="/feed" className="mt-4 inline-block text-rose-600 text-sm hover:underline font-medium">Browse feed</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => <ImageCard key={img.id} image={img} />)}
        </div>
      )}
    </div>
  );
}
