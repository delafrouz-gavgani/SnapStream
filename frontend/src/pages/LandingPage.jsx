import ContentPreview from '../components/ContentPreview';
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Play, Zap, Globe, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Dark hero */}
      <section className="bg-gray-950 py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/40 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Media streaming platform
          </div>
          <h1 className="text-6xl font-black text-white leading-tight">
            Stream your<br /><span className="text-rose-500">creativity</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Upload once. Reach everywhere. Built for creators who think in motion and consumers who love discovery.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/50">
              Start streaming <Play className="w-4 h-4 fill-white" />
            </Link>
            <Link to="/login" className="flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-colors border border-white/10">
              Sign in <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Light features */}
      <section className="flex-1 bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold mb-10">Platform capabilities</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Icon: Video,  t: 'Video uploads',  d: 'mp4, webm, mov supported' },
              { Icon: Zap,    t: 'LRU caching',    d: '60-second TTL, auto-invalidate' },
              { Icon: Globe,  t: 'Role access',    d: 'Creators manage, viewers browse' },
              { Icon: Play,   t: 'Media player',   d: 'In-browser playback controls' },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-rose-200 transition-colors">
                <Icon className="w-5 h-5 text-rose-600 mb-3" />
                <p className="font-semibold text-gray-900 text-sm mb-1">{t}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
