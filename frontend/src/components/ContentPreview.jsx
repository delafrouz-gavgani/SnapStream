import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeed } from '../services/api';
import { Play, Heart, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = (url) => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

export default function ContentPreview() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    getFeed(1).then(r => setImages(r.data.images?.slice(0, 9) || [])).catch(() => {});
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">See What's Being Shared</h2>
          <p className="text-gray-500">Real photos and videos from our community</p>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden shadow-lg">
          {images.map((img, i) => {
            const src   = img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`;
            const video = isVideo(src);
            const sizes = [
              'col-span-2 row-span-2', '', '',
              '', 'col-span-2', '',
              '', '', 'col-span-2',
            ];
            return (
              <Link key={img.id} to="/register"
                className={`relative group bg-gray-200 overflow-hidden block aspect-square ${sizes[i] || ''}`}>
                {video ? (
                  <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
                ) : (
                  <img src={src} alt={img.title} className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://placehold.co/400x400?text=Content'; }} />
                )}
                {video && (
                  <span className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5">
                    <Play className="w-3 h-3 fill-white" />
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                  <div className="flex gap-4 font-bold">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" />{img._count?.likes ?? 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4 fill-white" />{img._count?.comments ?? 0}</span>
                  </div>
                  <p className="text-xs font-medium opacity-80 px-4 text-center truncate w-full">{img.title}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/register"
            className="inline-block bg-rose-600 text-white font-bold px-8 py-3 rounded-full hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200">
            Join to See More
          </Link>
        </div>
      </div>
    </section>
  );
}
