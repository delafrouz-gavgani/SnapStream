import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, LogOut, LayoutDashboard, Rss, Menu, X , Bookmark, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() { logout(); navigate('/'); }

  return (
    <nav className="sticky top-0 z-50 bg-rose-600 shadow-md shadow-rose-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">SnapStream</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          {user ? (
            <>
              {user.role === 'consumer' && (
                <>
                  <Link to="/feed" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors">
                  <Rss className="w-4 h-4" /> Feed
                </Link>
                  <Link to="/bookmarks" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"><Bookmark className="w-4 h-4" /> Saved</Link>
                </>
              )}
              {user.role === 'creator' && (
                <>
                  <Link to="/feed" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors">
                    <Rss className="w-4 h-4" /> Feed
                  </Link>
                  <Link to="/creator" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2 pl-2 border-l border-white/20 ml-1">
                <Link to="/profile" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:ring-2 hover:ring-offset-1 hover:opacity-90 transition-all">
                  <span className="text-xs font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                </Link>
              <button onClick={handleLogout} className="p-1.5 text-white/60 hover:text-white hover:bg-white/15 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors">Sign in</Link>
              <Link to="/register" className="text-sm bg-white text-rose-700 px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors font-semibold">Get started</Link>
            </>
          )}
        </div>

        <button className="sm:hidden p-2 rounded-lg text-white/80 hover:bg-white/15 transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-white/20 bg-rose-700 px-4 py-3 space-y-1">
          {user ? (
            <>
              {user.role === 'consumer' && <Link to="/feed" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg"><Rss className="w-4 h-4" /> Feed</Link>}
              {user.role === 'creator' && (<><Link to="/feed" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg"><Rss className="w-4 h-4" /> Feed</Link><Link to="/creator" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link></>)}
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg"><User className="w-4 h-4" /> Profile</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg w-full text-left"><LogOut className="w-4 h-4" /> Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg">Sign in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm bg-white text-rose-700 rounded-lg font-semibold text-center">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
