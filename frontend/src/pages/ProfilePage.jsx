import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile, getMyImages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, Image, Heart, Bookmark, Users, MessageCircle, Upload, UserCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = (url) => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myImages, setMyImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyProfile();
        setProfile(res.data);
        if (res.data.role === 'creator') {
          const imgRes = await getMyImages();
          setMyImages(imgRes.data.images || []);
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>
  );
  if (!profile) return null;

  const isCreator = profile.role === 'creator';

  const stats = isCreator ? [
    { label: 'Posts',          value: profile.stats.posts,          icon: Upload },
    { label: 'Likes Received', value: profile.stats.likesReceived,  icon: Heart },
    { label: 'Followers',      value: profile.stats.followers,      icon: Users },
    { label: 'Comments',       value: profile.stats.comments,       icon: MessageCircle },
  ] : [
    { label: 'Liked Posts', value: profile.stats.likesGiven,  icon: Heart },
    { label: 'Saved',       value: profile.stats.bookmarks,   icon: Bookmark },
    { label: 'Following',   value: profile.stats.following,   icon: UserCheck },
    { label: 'Comments',    value: profile.stats.comments,    icon: MessageCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-200">
            <span className="text-3xl font-bold text-white">{profile.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isCreator ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                {isCreator ? 'Creator' : 'Consumer'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
              <Mail className="w-3.5 h-3.5" /> {profile.email}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Member since {new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <Icon className="w-5 h-5 mx-auto mb-1.5 text-rose-500" />
            <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Creator uploads */}
      {isCreator && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="w-4 h-4 text-rose-500" /> My Uploads ({myImages.length})
          </h2>
          {myImages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No uploads yet.{' '}
              <Link to="/creator" className="text-rose-600 hover:underline font-medium">Upload something!</Link>
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {myImages.slice(0, 12).map(img => {
                const src = img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`;
                return (
                  <Link key={img.id} to={`/images/${img.id}`}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 block hover:opacity-90 transition-opacity">
                    {isVideo(src) ? (
                      <video src={src} className="w-full h-full object-cover" preload="metadata" muted />
                    ) : (
                      <img src={src} alt={img.title} className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://placehold.co/200x200?text=No+Image'; }} />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Consumer activity */}
      {!isCreator && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center py-10">
          <Heart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Browse the{' '}
            <Link to="/feed" className="text-rose-600 font-semibold hover:underline">feed</Link>
            {' '}to like, save, and follow creators.
          </p>
        </div>
      )}
    </div>
  );
}
