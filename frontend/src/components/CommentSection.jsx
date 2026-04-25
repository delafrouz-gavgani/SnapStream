import React, { useState } from 'react';
import { addComment } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ imageId, comments: initial, onAdd }) {
  const { user, isConsumer } = useAuth();
  const [comments, setComments] = useState(initial || []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await addComment(imageId, { commentText: text.trim() });
      const newComment = { ...res.data, user: { id: user.id, name: user.name } };
      setComments([newComment, ...comments]);
      setText('');
      if (onAdd) onAdd();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-800 mb-3">Comments ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              Post
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </form>
      )}

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800">{c.user?.name}</span>
              <span className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{c.commentText}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
