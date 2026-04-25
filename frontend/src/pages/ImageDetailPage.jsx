import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImage, deleteImage, toggleLike, toggleBookmark, toggleFollow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import RatingForm from '../components/RatingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, Trash2, MapPin, Users, Calendar, AlertCircle, Heart, Bookmark, Share2, UserPlus, UserCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = (url) => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

export default function ImageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCreator } = useAuth();
  const [image, setImage]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing]   = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [shareToast, setShareToast] = useState(false);
  const [likeLoading, setLikeLoading]       = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [followLoading, setFollowLoading]   = useState(false);

  async function fetchImage() {
    try {
      const res = await getImage(id);
      const img = res.data;
      setImage(img);
      setLiked(img.isLiked ?? false);
      setLikeCount(img.likeCount ?? 0);
      setBookmarked(img.isBookmarked ?? false);
      setFollowing(img.isFollowing ?? false);
      setFollowerCount(img.followerCount ?? 0);
    } catch { setError('Media not found'); }
    finally  { setLoading(false); }
  }

  useEffect(() => { fetchImage(); }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteImage(id); navigate('/creator'); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  }

  async function handleLike() {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await toggleLike(id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {} finally { setLikeLoading(false); }
  }

  async function handleBookmark() {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const res = await toggleBookmark(id);
      setBookmarked(res.data.bookmarked);
    } catch {} finally { setBookmarkLoading(false); }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }

  async function handleFollow() {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      const res = await toggleFollow(image.creator.id);
      setFollowing(res.data.following);
      setFollowerCount(res.data.followerCount);
    } catch {} finally { setFollowLoading(false); }
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] py-8 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error || !image) return (
    <div className="min-h-[calc(100vh-4rem)] py-8 flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-gray-600 font-semibold">{error || 'Media not found'}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-rose-600 hover:underline text-sm">Go back</button>
    </div>
  );

  const src      = image.imageUrl.startsWith('http') ? image.imageUrl : `${API_URL}${image.imageUrl}`;
  const video    = isVideo(src);
  const isOwner  = isCreator && image.creator?.id === user?.id;
  const canFollow = user?.role === 'consumer' && image.creator?.id !== user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 mb-6 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media */}
        <div>
          <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-900">
            {video ? (
              <video src={src} className="w-full max-h-[600px]" controls preload="metadata" />
            ) : (
              <img src={src} alt={image.title} className="w-full object-contain max-h-[600px]"
                onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }} />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{image.title}</h1>
            {isOwner && (
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 shrink-0 ml-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>

          {/* Creator row */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700">
              {image.creator?.name?.[0]?.toUpperCase()}
            </div>
            <span className="font-medium text-gray-700">{image.creator?.name}</span>
            <span className="text-gray-300">·</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(image.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Social actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Like */}
            <button onClick={handleLike} disabled={likeLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                liked
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-600'
              }`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              {likeCount}
            </button>

            {/* Bookmark — consumers only */}
            {user?.role === 'consumer' && (
              <button onClick={handleBookmark} disabled={bookmarkLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  bookmarked
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-600'
                }`}>
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
                {bookmarked ? 'Saved' : 'Save'}
              </button>
            )}

            {/* Share — copies URL */}
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
              <Share2 className="w-4 h-4" />
              {shareToast ? 'Copied!' : 'Share'}
            </button>

            {/* Follow — consumers following creators */}
            {canFollow && (
              <button onClick={handleFollow} disabled={followLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ml-auto ${
                  following
                    ? 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700'
                }`}>
                {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {following ? `Following · ${followerCount}` : `Follow · ${followerCount}`}
              </button>
            )}
          </div>

          {image.caption && <p className="text-gray-600 text-sm leading-relaxed">{image.caption}</p>}

          <div className="flex flex-wrap gap-2">
            {image.location && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {image.location}
              </span>
            )}
            {image.peoplePresent && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5 text-rose-500" /> {image.peoplePresent}
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <RatingForm imageId={image.id} avgRating={image.avgRating} totalRatings={image.ratings?.length ?? 0} onRate={fetchImage} />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <CommentSection imageId={image.id} comments={image.comments || []} onAdd={fetchImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
