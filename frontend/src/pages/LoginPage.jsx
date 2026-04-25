import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Video, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate(res.data.user.role === 'creator' ? '/creator' : '/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-900/50">
            <Video className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to <span className="font-semibold text-rose-500">SnapStream</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@gmail.com" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm pl-10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm pl-10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors" />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-rose-900/50">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{' '}<Link to="/register" className="text-rose-400 font-semibold hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
