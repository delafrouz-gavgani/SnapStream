import React, { useState } from 'react';
import { rateImage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RatingForm({ imageId, avgRating, totalRatings, onRate }) {
  const { isConsumer } = useAuth();
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleRate(val) {
    if (!isConsumer) return;
    setLoading(true);
    setMessage('');
    try {
      await rateImage(imageId, { ratingValue: val });
      setSelected(val);
      setMessage('Rating saved!');
      if (onRate) onRate();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to rate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Rating</h3>
        {avgRating !== null && (
          <span className="text-sm text-gray-600">
            <i className="fas fa-star text-yellow-400 mr-1"></i>{avgRating}/5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
          </span>
        )}
        {avgRating === null && <span className="text-sm text-gray-400">No ratings yet</span>}
      </div>

      {isConsumer && (
        <>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                disabled={loading}
                className="text-2xl transition-transform hover:scale-110 disabled:opacity-50"
              >
                <i className={star <= (hover || selected) ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-400'}></i>
              </button>
            ))}
          </div>
          {message && (
            <p className={`text-xs mt-1 ${message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
