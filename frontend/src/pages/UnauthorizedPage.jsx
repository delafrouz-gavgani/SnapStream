import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { isCreator } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
        <ShieldOff className="w-10 h-10 text-red-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-8 max-w-sm">You don&apos;t have permission to view this page.</p>
      <button onClick={() => navigate(isCreator ? '/creator' : '/feed')}
        className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200">
        <ArrowLeft className="w-4 h-4" /> Go to Dashboard
      </button>
      <Link to="/" className="mt-4 text-sm text-gray-400 hover:text-gray-600">Back to Home</Link>
    </div>
  );
}
